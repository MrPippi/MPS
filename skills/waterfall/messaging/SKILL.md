# Plugin Messaging Skill — Waterfall

## Purpose
Reference this skill when a Waterfall proxy plugin needs to send or receive plugin messages to/from backend Paper/Purpur servers via the `BungeeCord` channel or custom plugin channels.

## When to Use This Skill
- Intercepting `BungeeCord` channel messages at the proxy
- Building custom backend ↔ proxy communication on Waterfall
- Forwarding messages between backend servers via the proxy

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `ProxyServer#registerChannel(String)` | Register a channel for listening | Must be called before handling messages |
| `ProxyServer#unregisterChannel(String)` | Unregister a channel | Call in `onDisable` |
| `PluginMessageEvent` | Fires when a plugin message arrives at the proxy | `net.md_5.bungee.api.event.PluginMessageEvent` |
| `event.getSender()` | `Connection` | The backend server or player who sent it |
| `event.getReceiver()` | `Connection` | The destination |
| `event.getData()` | `byte[]` | Raw payload |
| `event.setCancelled(boolean)` | Prevent forwarding | Use when handling internally |
| `event.getTag()` | `String` | The channel name |
| `ProxiedPlayer#sendData(String, byte[])` | Send plugin message to player's backend | Proxy → Backend |

## Code Pattern

```java
package com.yourorg.waterfallplugin.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import net.md_5.bungee.api.ProxyServer;
import net.md_5.bungee.api.chat.TextComponent;
import net.md_5.bungee.api.config.ServerInfo;
import net.md_5.bungee.api.connection.ProxiedPlayer;
import net.md_5.bungee.api.connection.Server;
import net.md_5.bungee.api.event.PluginMessageEvent;
import net.md_5.bungee.api.plugin.Listener;
import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.event.EventHandler;

import java.util.logging.Logger;

public class WaterfallMessagingHandler implements Listener {

    private static final String CUSTOM_CHANNEL = "myplugin:network";
    private static final String BUNGEE_CHANNEL  = "BungeeCord";

    private final Plugin plugin;
    private final Logger logger;

    public WaterfallMessagingHandler(Plugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getLogger();
    }

    public void register() {
        ProxyServer proxy = plugin.getProxy();
        proxy.registerChannel(CUSTOM_CHANNEL);
        // BungeeCord channel is always registered by Waterfall itself
        proxy.getPluginManager().registerListener(plugin, this);
    }

    public void unregister() {
        plugin.getProxy().unregisterChannel(CUSTOM_CHANNEL);
    }

    @EventHandler
    public void onPluginMessage(PluginMessageEvent event) {
        String tag = event.getTag();

        if (CUSTOM_CHANNEL.equals(tag)) {
            handleCustomMessage(event);
        } else if (BUNGEE_CHANNEL.equals(tag)) {
            handleBungeeCordMessage(event);
        }
    }

    private void handleCustomMessage(PluginMessageEvent event) {
        // Only handle messages from backend servers
        if (!(event.getSender() instanceof Server backendServer)) return;

        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String action = in.readUTF();

        switch (action) {
            case "BROADCAST" -> {
                String message = in.readUTF();
                plugin.getProxy().broadcast(new TextComponent("§6[Network] §f" + message));
                event.setCancelled(true);   // Don't forward to player
            }
            case "MOVE_PLAYER" -> {
                String playerName = in.readUTF();
                String targetServer = in.readUTF();
                movePlayer(playerName, targetServer);
                event.setCancelled(true);
            }
            case "GET_PLAYER_COUNT" -> {
                int count = plugin.getProxy().getOnlineCount();
                respondToBackend(event, "PLAYER_COUNT_RESPONSE", out -> out.writeInt(count));
                event.setCancelled(true);
            }
            default -> logger.warning("Unknown action: " + action);
        }
    }

    private void handleBungeeCordMessage(PluginMessageEvent event) {
        // Intercept specific BungeeCord sub-channels for logging/auditing
        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String subChannel = in.readUTF();

        if ("Connect".equals(subChannel)) {
            String targetServer = in.readUTF();
            logger.info("BungeeCord Connect request → " + targetServer);
            // Allow Waterfall to process it normally
        }
        // Most BungeeCord sub-channels should be forwarded — don't cancel them
    }

    private void movePlayer(String playerName, String targetServer) {
        ProxiedPlayer player = plugin.getProxy().getPlayer(playerName);
        if (player == null) return;

        ServerInfo server = plugin.getProxy().getServerInfo(targetServer);
        if (server == null) return;

        player.connect(server);
    }

    private void respondToBackend(PluginMessageEvent event,
                                   String responseAction,
                                   java.util.function.Consumer<ByteArrayDataOutput> writer) {
        if (!(event.getReceiver() instanceof ProxiedPlayer player)) return;

        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF(responseAction);
        writer.accept(out);
        player.sendData(CUSTOM_CHANNEL, out.toByteArray());
    }

    // Send from proxy → specific backend server
    public void sendToServer(String serverName, byte[] data) {
        // Must route via an online player on that server
        plugin.getProxy().getPlayers().stream()
            .filter(p -> p.getServer() != null
                && serverName.equals(p.getServer().getInfo().getName()))
            .findFirst()
            .ifPresent(p -> p.sendData(CUSTOM_CHANNEL, data));
    }
}
```

**Register in main class:**
```java
private WaterfallMessagingHandler messagingHandler;

@Override
public void onEnable() {
    messagingHandler = new WaterfallMessagingHandler(this);
    messagingHandler.register();
}

@Override
public void onDisable() {
    if (messagingHandler != null) {
        messagingHandler.unregister();
    }
}
```

## Common Pitfalls

- **Using `MinecraftChannelIdentifier` on Waterfall**: This is a Velocity class. On Waterfall, channel names are plain strings (`"myplugin:network"`).

- **Not cancelling `PluginMessageEvent` when handled**: If you handle a message internally but don't cancel the event, Waterfall forwards it to the player. Call `event.setCancelled(true)` for messages you handle yourself.

- **Cancelling BungeeCord sub-channels**: Cancelling built-in `BungeeCord` channel messages (like `Connect`, `GetServer`) prevents Waterfall from processing them. Only cancel if you're fully replacing Waterfall's handling.

- **Sending without a player on that server**: To send data from the proxy to a specific backend, you need a player on that backend to route the message. If no player is on the target server, queue the message.

## Version Notes

- **Waterfall 1.21**: Plugin messaging API unchanged from older BungeeCord.
- `event.getData()` returns a byte array. Guava's `ByteStreams` (bundled with BungeeCord) handles serialization.

## Related Skills

- [bungeecord-channels.md](bungeecord-channels.md) — Full BungeeCord channel sub-channel reference
- [../events/SKILL.md](../events/SKILL.md) — Waterfall event system
- [../../paper/messaging/plugin-channels.md](../../paper/messaging/plugin-channels.md) — Paper backend messaging
- [../../velocity/messaging/plugin-messages.md](../../velocity/messaging/plugin-messages.md) — Equivalent Velocity messaging
