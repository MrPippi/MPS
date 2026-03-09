# Plugin Messaging Skill — Paper

## Purpose
Reference this skill when a Paper backend plugin needs to send or receive data to/from a Velocity or Waterfall proxy using the plugin messaging channel system.

## When to Use This Skill
- Sending a player to a different backend server via the proxy
- Getting the IP of the proxy the player connected through
- Notifying the proxy of a game event (e.g., game over, player rank change)
- Receiving instructions from the proxy plugin (e.g., switch server, apply punishment)

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Messenger#registerOutgoingPluginChannel(Plugin, String)` | Allow plugin to send on this channel | Required before sending |
| `Messenger#registerIncomingPluginChannel(Plugin, String, PluginMessageListener)` | Register to receive messages on channel | Callback fires async |
| `Player#sendPluginMessage(Plugin, String, byte[])` | Send a plugin message via a player | Player must be online |
| `PluginMessageListener` | Interface for receiving plugin messages | Implement `onPluginMessageReceived` |
| `ByteArrayDataOutput` (Guava) | Serialise message payload | `ByteStreams.newDataOutput()` |
| `ByteArrayDataInput` (Guava) | Deserialise received payload | `ByteStreams.newDataInput(bytes)` |
| `"BungeeCord"` | Standard proxy communication channel | Works with BungeeCord, Waterfall, Velocity (compat mode) |
| `"minecraft:brand"` | Built-in brand channel | Do not use for custom data |

## Code Pattern

```java
package com.yourorg.myplugin.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.plugin.messaging.PluginMessageListener;
import org.slf4j.Logger;

public class MessagingHandler implements PluginMessageListener {

    private static final String CHANNEL = "BungeeCord";

    private final JavaPlugin plugin;
    private final Logger logger;

    public MessagingHandler(JavaPlugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getSLF4JLogger();
    }

    public void register() {
        plugin.getServer().getMessenger()
            .registerOutgoingPluginChannel(plugin, CHANNEL);
        plugin.getServer().getMessenger()
            .registerIncomingPluginChannel(plugin, CHANNEL, this);
    }

    public void unregister() {
        plugin.getServer().getMessenger()
            .unregisterOutgoingPluginChannel(plugin, CHANNEL);
        plugin.getServer().getMessenger()
            .unregisterIncomingPluginChannel(plugin, CHANNEL, this);
    }

    // Send player to another backend server
    public void connectToServer(Player player, String serverName) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("Connect");
        out.writeUTF(serverName);
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    // Request the proxy to tell us which server this player is on
    public void requestServerName(Player player) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("GetServer");
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    // Receive and dispatch incoming messages from the proxy
    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!channel.equals(CHANNEL)) return;

        // NOTE: This callback fires on an async thread.
        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String subChannel = in.readUTF();

        switch (subChannel) {
            case "GetServer" -> {
                String serverName = in.readUTF();
                logger.info("Player {} is on server: {}", player.getName(), serverName);
            }
            case "GetIP" -> {
                String ip = in.readUTF();
                logger.info("Player {} connected from IP: {}", player.getName(), ip);
            }
            default -> logger.warn("Unknown BungeeCord subchannel: {}", subChannel);
        }
    }
}
```

**Register in `onEnable`, unregister in `onDisable`:**
```java
private MessagingHandler messagingHandler;

@Override
public void onEnable() {
    messagingHandler = new MessagingHandler(this);
    messagingHandler.register();
}

@Override
public void onDisable() {
    messagingHandler.unregister();
}
```

## Common Pitfalls

- **Sending plugin messages without a player**: Plugin messages must be sent through a player that is currently connected to this server. There is no "serverless" send. If no players are online, queue the message and send when the first player joins.

- **Using plugin messaging for large data**: The `BungeeCord` channel has a 32767-byte payload limit. For large data transfers, use a shared database instead.

- **Forgetting to register the channel**: Calling `sendPluginMessage()` on an unregistered outgoing channel will throw an exception. Always call `registerOutgoingPluginChannel` first.

- **Reading incoming messages on the main thread**: The `onPluginMessageReceived` callback fires on an async thread. Do not mutate Bukkit objects inside it without scheduling back to the main thread.

- **Using `BungeeCord` channel with Velocity's modern forwarding**: Velocity must have `bungee-plugin-messaging-channel: true` in `velocity.toml` for `BungeeCord` channel compatibility.

## Version Notes

- **1.21 / 1.21.1**: `BungeeCord` channel API unchanged. Guava's `ByteStreams` is bundled with Paper.
- For custom namespaced channels (Velocity plugin-to-plugin), use `"yourplugin:channel"` format and configure both sides. See [plugin-channels.md](plugin-channels.md).

## Related Skills

- [plugin-channels.md](plugin-channels.md) — Custom channel names, Velocity plugin messaging
- [../../velocity/messaging/plugin-messages.md](../../velocity/messaging/plugin-messages.md) — Velocity-side plugin messaging
- [../../waterfall/messaging/bungeecord-channels.md](../../waterfall/messaging/bungeecord-channels.md) — BungeeCord channel protocol reference
