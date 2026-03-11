# Plugin Messaging Skill — Velocity

## Purpose
Reference this skill when a Velocity proxy plugin needs to send or receive data to/from backend Paper/Purpur servers using plugin messaging channels.

## When to Use This Skill
- Receiving data from backend servers at the proxy level
- Forwarding messages between backend servers via the proxy
- Building custom proxy-backend communication protocols

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `ChannelRegistrar#register(ChannelIdentifier...)` | Register channel(s) for the proxy | Get via `server.getChannelRegistrar()` |
| `MinecraftChannelIdentifier.from(String)` | Create a channel identifier | Format: `"namespace:channel"` |
| `LegacyChannelIdentifier` | For `BungeeCord` legacy channel | |
| `PluginMessageEvent` | Fired when a plugin message arrives at the proxy | From `com.velocitypowered.api.event.connection.PluginMessageEvent` |
| `event.getSource()` | `ChannelMessageSource` | The server that sent the message |
| `event.getTarget()` | `ChannelMessageTarget` | The destination (proxy or player) |
| `event.getData()` | `byte[]` | The raw message payload |
| `event.setResult(ForwardResult)` | Forward or discard | `handled()` or `forward()` |
| `Player#sendPluginMessage(ChannelIdentifier, byte[])` | Send message to player's current backend | For backend → proxy direction, sent from backend |

## Code Pattern

```java
package com.yourorg.proxyplugin.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PluginMessageEvent;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.ServerConnection;
import com.velocitypowered.api.proxy.messages.ChannelIdentifier;
import com.velocitypowered.api.proxy.messages.MinecraftChannelIdentifier;
import org.slf4j.Logger;

public class ProxyMessagingHandler {

    // Custom channel for proxy ↔ backend communication
    public static final MinecraftChannelIdentifier CHANNEL =
        MinecraftChannelIdentifier.from("myplugin:proxy");

    private final ProxyServer server;
    private final Logger logger;

    public ProxyMessagingHandler(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    public void register() {
        server.getChannelRegistrar().register(CHANNEL);
    }

    public void unregister() {
        server.getChannelRegistrar().unregister(CHANNEL);
    }

    // Handle incoming plugin messages from backend servers
    @Subscribe
    public void onPluginMessage(PluginMessageEvent event) {
        if (!event.getIdentifier().equals(CHANNEL)) return;

        // Parse the message
        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String action = in.readUTF();

        switch (action) {
            case "REQUEST_PLAYER_COUNT" -> {
                // Backend asking for total proxy player count
                handlePlayerCountRequest(event);
            }
            case "BROADCAST" -> {
                // Backend asking proxy to broadcast a message
                String message = in.readUTF();
                handleBroadcast(message);
            }
            case "MOVE_PLAYER" -> {
                // Backend asking proxy to move a player
                String playerName = in.readUTF();
                String targetServer = in.readUTF();
                handleMovePlayer(playerName, targetServer);
            }
            default -> logger.warn("Unknown action from backend: {}", action);
        }

        // Mark as handled — don't forward to other listeners
        event.setResult(PluginMessageEvent.ForwardResult.handled());
    }

    private void handlePlayerCountRequest(PluginMessageEvent event) {
        if (!(event.getSource() instanceof ServerConnection conn)) return;

        // Respond with player count
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("PLAYER_COUNT_RESPONSE");
        out.writeInt(server.getAllPlayers().size());

        // Send response back to the backend server that asked
        conn.getPlayer().sendPluginMessage(CHANNEL, out.toByteArray());
    }

    private void handleBroadcast(String message) {
        net.kyori.adventure.text.Component component =
            net.kyori.adventure.text.minimessage.MiniMessage.miniMessage().deserialize(message);

        server.getAllPlayers().forEach(p -> p.sendMessage(component));
        logger.info("Proxy broadcast: {}", message);
    }

    private void handleMovePlayer(String playerName, String targetServer) {
        server.getPlayer(playerName).ifPresent(player ->
            server.getServer(targetServer).ifPresent(srv ->
                player.createConnectionRequest(srv).fireAndForget()
            )
        );
    }

    // Send a message from the proxy to a specific backend server
    public void sendToBackend(Player player, String action, byte[] payload) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF(action);
        out.write(payload);
        player.sendPluginMessage(CHANNEL, out.toByteArray());
    }
}
```

**Register in main plugin class:**
```java
private ProxyMessagingHandler messagingHandler;

@Subscribe
public void onProxyInitialize(ProxyInitializeEvent event) {
    messagingHandler = new ProxyMessagingHandler(server, logger);
    messagingHandler.register();
    server.getEventManager().register(this, messagingHandler);
}

@Subscribe
public void onProxyShutdown(ProxyShutdownEvent event) {
    if (messagingHandler != null) {
        messagingHandler.unregister();
    }
}
```

## Common Pitfalls

- **Using `LegacyChannelIdentifier("BungeeCord")` vs `MinecraftChannelIdentifier`**: The `BungeeCord` channel is a legacy identifier. For custom channels, always use `MinecraftChannelIdentifier.from("namespace:channel")`. The namespace must be lowercase and alphanumeric.

- **Not calling `event.setResult(ForwardResult.handled())`**: If you don't call this, Velocity may forward the message to other registered handlers or the player. Always explicitly mark messages as handled when you've processed them.

- **Sending to a backend when player has no server**: `player.sendPluginMessage()` requires the player to be connected to a backend. Check `player.getCurrentServer().isPresent()` first.

- **Channel not registered on backend**: The backend Paper plugin must also register the incoming channel with `getServer().getMessenger().registerIncomingPluginChannel(plugin, "myplugin:proxy", listener)`.

## Version Notes

- **Velocity 3.3**: `PluginMessageEvent` is stable. `MinecraftChannelIdentifier` is the correct type for namespaced channels.
- `LegacyChannelIdentifier` is for the `BungeeCord` compatibility channel only.

## Related Skills

- [plugin-messages.md](plugin-messages.md) — Detailed protocol patterns and BungeeCord compat
- [../../paper/messaging/plugin-channels.md](../../paper/messaging/plugin-channels.md) — Backend side
- [../../waterfall/messaging/bungeecord-channels.md](../../waterfall/messaging/bungeecord-channels.md) — BungeeCord channel reference
