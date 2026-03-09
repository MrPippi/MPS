# Plugin Messages — Velocity

Detailed reference for Velocity plugin messaging: channel registration, receiving messages from backend servers, and the BungeeCord compatibility channel.

---

## Channel Identifiers

Velocity uses typed channel identifiers, not plain strings:

| Type | When to Use | Example |
|------|------------|---------|
| `MinecraftChannelIdentifier` | Custom plugin channels | `myplugin:data` |
| `LegacyChannelIdentifier` | `BungeeCord` legacy channel | `new LegacyChannelIdentifier("BungeeCord")` |

```java
import com.velocitypowered.api.proxy.messages.MinecraftChannelIdentifier;
import com.velocitypowered.api.proxy.messages.LegacyChannelIdentifier;

// Custom channel
MinecraftChannelIdentifier customChannel =
    MinecraftChannelIdentifier.from("myplugin:network");

// BungeeCord compatibility channel
LegacyChannelIdentifier bungeeCordChannel =
    new LegacyChannelIdentifier("BungeeCord");
```

---

## Registering Channels

```java
// In plugin initialize event or constructor
server.getChannelRegistrar().register(customChannel, bungeeCordChannel);

// On shutdown
server.getChannelRegistrar().unregister(customChannel, bungeeCordChannel);
```

---

## Receiving Plugin Messages (PluginMessageEvent)

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PluginMessageEvent;
import com.velocitypowered.api.proxy.ServerConnection;

@Subscribe
public void onPluginMessage(PluginMessageEvent event) {
    // Filter by channel
    if (!event.getIdentifier().equals(customChannel)) return;

    // Determine the source type
    if (event.getSource() instanceof ServerConnection serverConn) {
        // Message from a backend server
        String serverName = serverConn.getServerInfo().getName();
        byte[] data = event.getData();
        processServerMessage(serverName, data);

        // Prevent forwarding to the player
        event.setResult(PluginMessageEvent.ForwardResult.handled());

    } else if (event.getSource() instanceof com.velocitypowered.api.proxy.Player player) {
        // Message from the player client (rare, usually from mods)
        processPlayerMessage(player, event.getData());
        event.setResult(PluginMessageEvent.ForwardResult.handled());
    }
}
```

---

## BungeeCord Channel at Velocity

When Velocity has `bungee-plugin-messaging-channel: true` in `velocity.toml`, it processes `BungeeCord` channel messages from backends and responds to them itself.

If you need to intercept BungeeCord channel messages at the proxy level:

```java
import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteStreams;
import com.velocitypowered.api.proxy.messages.LegacyChannelIdentifier;

private static final LegacyChannelIdentifier BUNGEE_CHANNEL =
    new LegacyChannelIdentifier("BungeeCord");

@Subscribe
public void onBungeeCordMessage(PluginMessageEvent event) {
    if (!event.getIdentifier().equals(BUNGEE_CHANNEL)) return;

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    String subChannel = in.readUTF();

    switch (subChannel) {
        case "Connect" -> {
            // Backend asked to connect a player to another server
            String targetServer = in.readUTF();
            logger.debug("BungeeCord Connect request → {}", targetServer);
            // Let Velocity handle it (forward) or handle yourself (set handled)
            event.setResult(PluginMessageEvent.ForwardResult.forward());
        }
        case "GetServer" -> {
            // Intercept and handle GetServer request manually if needed
            event.setResult(PluginMessageEvent.ForwardResult.forward());
        }
        default -> event.setResult(PluginMessageEvent.ForwardResult.forward());
    }
}
```

---

## Sending Messages from Velocity → Backend

Velocity sends a plugin message to a backend by routing it through a player:

```java
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import com.velocitypowered.api.proxy.Player;

public void sendToBackend(Player player, String action, String payload) {
    if (player.getCurrentServer().isEmpty()) return;

    ByteArrayDataOutput out = ByteStreams.newDataOutput();
    out.writeUTF(action);
    out.writeUTF(payload);

    player.sendPluginMessage(customChannel, out.toByteArray());
}
```

The backend registers `"myplugin:network"` as an incoming channel and receives the message in `PluginMessageListener.onPluginMessageReceived()`.

---

## Complete Proxy ↔ Backend Protocol Example

### Protocol Design

Define a shared protocol using a simple string action + data:

```
Request (Backend → Proxy):
  byte[]: writeUTF(action) + writeUTF(data...)

Response (Proxy → Backend, via same player):
  byte[]: writeUTF(action + "_RESPONSE") + writeUTF(data...)
```

### Velocity Side (Proxy receives, responds)

```java
@Subscribe
public void onPluginMessage(PluginMessageEvent event) {
    if (!event.getIdentifier().equals(CHANNEL)) return;
    if (!(event.getSource() instanceof ServerConnection conn)) return;

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    String action = in.readUTF();

    if ("GET_PLAYER_LIST".equals(action)) {
        // Build player list
        String playerList = server.getAllPlayers().stream()
            .map(Player::getUsername)
            .collect(java.util.stream.Collectors.joining(","));

        // Respond via same player
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("GET_PLAYER_LIST_RESPONSE");
        out.writeUTF(playerList);

        conn.getPlayer().sendPluginMessage(CHANNEL, out.toByteArray());
        event.setResult(PluginMessageEvent.ForwardResult.handled());
    }
}
```

### Paper Backend Side (Sends request, receives response)

```java
// Request
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("GET_PLAYER_LIST");
player.sendPluginMessage(plugin, "myplugin:network", out.toByteArray());

// Receive response
@Override
public void onPluginMessageReceived(String channel, Player player, byte[] data) {
    ByteArrayDataInput in = ByteStreams.newDataInput(data);
    String action = in.readUTF();
    if ("GET_PLAYER_LIST_RESPONSE".equals(action)) {
        String[] players = in.readUTF().split(",");
        // Use the list
    }
}
```

---

## Common Pitfalls

- **`velocity.toml` missing `bungee-plugin-messaging-channel: true`**: Without this, backends cannot use the `BungeeCord` channel to communicate with Velocity. Standard backends using `Connect`, `GetServer`, etc. will fail silently.

- **Forgetting to register channels on BOTH sides**: Velocity AND Paper must register the channel. Missing registration on either side causes messages to be silently dropped.

- **Message payload size**: Plugin messages have a 32767-byte limit. For larger data, use a shared database.

- **Sending from proxy to backend when player is switching servers**: During a server switch, `player.getCurrentServer()` may point to the old server. Wait for `ServerConnectedEvent` before sending.

## Related Skills

- [SKILL.md](SKILL.md) — Plugin messaging overview
- [../../paper/messaging/plugin-channels.md](../../paper/messaging/plugin-channels.md) — Paper backend messaging
- [../../waterfall/messaging/bungeecord-channels.md](../../waterfall/messaging/bungeecord-channels.md) — BungeeCord channel protocol
