# Plugin Message Channels — Paper

Full reference for the `BungeeCord` plugin messaging channel and custom namespaced channels in Paper 1.21.

---

## BungeeCord Sub-Channels

The `BungeeCord` channel is the standard protocol for Paper ↔ BungeeCord/Waterfall/Velocity communication. Messages use a sub-channel pattern written via Guava's `ByteArrayDataOutput`.

### Available Sub-Channels (Outgoing — Paper → Proxy)

| Sub-Channel | Arguments | Effect |
|-------------|-----------|--------|
| `Connect` | `serverName: String` | Send player to another backend |
| `ConnectOther` | `playerName: String`, `serverName: String` | Send another player to a server |
| `IP` | — | Request the player's real IP |
| `IPOther` | `playerName: String` | Request another player's IP |
| `PlayerCount` | `serverName: String` (or `"ALL"`) | Request online count |
| `PlayerList` | `serverName: String` (or `"ALL"`) | Request comma-separated player list |
| `GetServer` | — | Request the server name this player is on |
| `GetServers` | — | Request all registered server names |
| `Message` | `playerName: String`, `message: String` | Send chat message to a player on proxy |
| `GetPlayerServer` | `playerName: String` | Get the server a specific player is on |
| `Forward` | `serverName: String`, `channel: String`, `data: byte[]` | Forward custom data to another server |
| `ForwardToPlayer` | `playerName: String`, `channel: String`, `data: byte[]` | Forward data to a specific player's server |
| `UUID` | — | Request this player's UUID |
| `UUIDOther` | `playerName: String` | Request another player's UUID |
| `ServerIP` | `serverName: String` | Request a backend server's IP:port |

### Available Sub-Channels (Incoming — Proxy → Paper)

| Sub-Channel | Response Data |
|-------------|--------------|
| `GetServer` | `serverName: String` |
| `GetServers` | `serverList: String` (comma-separated) |
| `PlayerCount` | `serverName: String`, `count: int` |
| `PlayerList` | `serverName: String`, `players: String` (comma-separated) |
| `GetPlayerServer` | `playerName: String`, `serverName: String` |
| `IP` | `ip: String`, `port: int` |
| `IPOther` | `playerName: String`, `ip: String`, `port: int` |
| `UUID` | `uuid: String` |
| `UUIDOther` | `playerName: String`, `uuid: String` |
| `ServerIP` | `serverName: String`, `host: String`, `port: short` |
| `Forward` / `ForwardToPlayer` | `channel: String`, `data: byte[]` |

---

## Complete Messaging Manager

```java
package com.yourorg.myplugin.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.plugin.messaging.PluginMessageListener;
import org.slf4j.Logger;

public class BungeeCordMessenger implements PluginMessageListener {

    private static final String CHANNEL = "BungeeCord";

    private final JavaPlugin plugin;
    private final Logger logger;

    public BungeeCordMessenger(JavaPlugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getSLF4JLogger();
    }

    public void register() {
        plugin.getServer().getMessenger().registerOutgoingPluginChannel(plugin, CHANNEL);
        plugin.getServer().getMessenger().registerIncomingPluginChannel(plugin, CHANNEL, this);
    }

    public void unregister() {
        plugin.getServer().getMessenger().unregisterOutgoingPluginChannel(plugin, CHANNEL);
        plugin.getServer().getMessenger().unregisterIncomingPluginChannel(plugin, CHANNEL, this);
    }

    // --- Outgoing helpers ---

    public void connectTo(Player player, String serverName) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("Connect");
        out.writeUTF(serverName);
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    public void requestServerName(Player player) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("GetServer");
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    public void requestPlayerCount(Player player, String serverName) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("PlayerCount");
        out.writeUTF(serverName);
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    // Forward custom data to another server via proxy
    public void forward(Player player, String targetServer, String subChannel, byte[] data) {
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("Forward");
        out.writeUTF(targetServer);
        out.writeUTF(subChannel);
        out.writeShort(data.length);
        out.write(data);
        player.sendPluginMessage(plugin, CHANNEL, out.toByteArray());
    }

    // --- Incoming dispatcher ---

    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!channel.equals(CHANNEL)) return;
        // Fires on an async thread — do NOT call Bukkit world mutations here

        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String subChannel = in.readUTF();

        switch (subChannel) {
            case "GetServer" -> {
                String serverName = in.readUTF();
                logger.info("{} is on server: {}", player.getName(), serverName);
            }
            case "PlayerCount" -> {
                String server = in.readUTF();
                int count = in.readInt();
                logger.info("Server {} has {} players", server, count);
            }
            case "PlayerList" -> {
                String server = in.readUTF();
                String players = in.readUTF();
                logger.info("Players on {}: {}", server, players);
            }
            case "Forward" -> {
                String customChannel = in.readUTF();
                short len = in.readShort();
                byte[] data = new byte[len];
                in.readFully(data);
                handleForwarded(player, customChannel, data);
            }
            default -> logger.debug("Unhandled BungeeCord sub-channel: {}", subChannel);
        }
    }

    private void handleForwarded(Player player, String customChannel, byte[] data) {
        ByteArrayDataInput in = ByteStreams.newDataInput(data);
        // Parse custom forwarded payload based on your protocol
        logger.info("Forwarded message on channel '{}' from proxy", customChannel);
    }
}
```

---

## Custom Namespaced Channels

For Velocity or custom plugin-to-plugin communication, use namespaced channels:

```java
// Register a custom channel: "myplugin:sync"
String customChannel = "myplugin:sync";
plugin.getServer().getMessenger().registerOutgoingPluginChannel(plugin, customChannel);
plugin.getServer().getMessenger().registerIncomingPluginChannel(plugin, customChannel, listener);
```

On the Velocity side, listen for `PluginMessageEvent` with this channel name. See `velocity/messaging/plugin-messages.md`.

---

## Handling No Online Players (Queuing)

Plugin messages require an online player. If no player is available, queue the message:

```java
import org.bukkit.entity.Player;
import java.util.ArrayDeque;
import java.util.Queue;
import java.util.function.Consumer;

public class MessageQueue {

    private final Queue<Consumer<Player>> queue = new ArrayDeque<>();
    private final JavaPlugin plugin;
    private final String channel;

    public MessageQueue(JavaPlugin plugin, String channel) {
        this.plugin = plugin;
        this.channel = channel;
    }

    public void send(byte[] data) {
        Player player = plugin.getServer().getOnlinePlayers().stream().findFirst().orElse(null);
        if (player != null) {
            player.sendPluginMessage(plugin, channel, data);
        } else {
            queue.offer(p -> p.sendPluginMessage(plugin, channel, data));
        }
    }

    // Call this when a player joins
    public void flush(Player player) {
        while (!queue.isEmpty()) {
            queue.poll().accept(player);
        }
    }
}
```

---

## Common Pitfalls

- **Sending without registering**: Call `registerOutgoingPluginChannel` before any `sendPluginMessage`. Missing registration throws `IllegalArgumentException`.

- **No online players**: If `getOnlinePlayers().isEmpty()`, you cannot send plugin messages. Queue them and flush when a player joins.

- **32767-byte payload limit**: `BungeeCord` channel data is capped. For larger payloads, use a shared database.

- **Reading incoming messages on main thread**: The callback fires async. Use `Bukkit.getScheduler().runTask(plugin, ...)` if you need Bukkit object access from within `onPluginMessageReceived`.

- **Using `BungeeCord` channel with Velocity without enabling compat**: Velocity requires `bungee-plugin-messaging-channel: true` in `velocity.toml` to process `BungeeCord` channel messages.

## Related Skills

- [SKILL.md](SKILL.md) — Plugin messaging overview
- [../../velocity/messaging/plugin-messages.md](../../velocity/messaging/plugin-messages.md) — Velocity side
- [../../waterfall/messaging/bungeecord-channels.md](../../waterfall/messaging/bungeecord-channels.md) — Full sub-channel protocol
