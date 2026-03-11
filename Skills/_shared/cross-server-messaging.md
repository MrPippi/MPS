# Cross-Server Plugin Messaging — Cross-Platform Guide

Plugin Messaging (also called Plugin Channels or Custom Payload packets) allows backend servers (Paper/Purpur) to communicate with proxy servers (Velocity/Waterfall). Always check which platform you are on before generating messaging code — the API is completely different.

---

## Architecture Overview

```
[Paper/Purpur Backend]  ←→  [Velocity or Waterfall Proxy]  ←→  [Paper/Purpur Backend]
       Server A                        Proxy                           Server B
```

- Messages flow **through** the proxy
- The proxy can intercept, forward, or respond to messages
- Channel names must be registered on **both** sides (backend + proxy)
- Format: `namespace:channel` (lowercase, alphanumeric + hyphens only)

---

## Platform Comparison

| Aspect | Paper (Backend) | Velocity (Proxy) | Waterfall (Proxy) |
|--------|----------------|-----------------|-----------------|
| Send message | `player.sendPluginMessage(plugin, channel, data)` | `player.sendPluginMessage(channelId, data)` | `player.sendData(channel, data)` |
| Receive message | `PluginMessageListener` | `@Subscribe PluginMessageEvent` | `@EventHandler PluginMessageEvent` |
| Channel registration | `getServer().getMessenger().registerIncomingPluginChannel()` | `server.getChannelRegistrar().register(identifier)` | `getProxy().registerChannel(channelName)` |
| Channel identifier type | `String` | `MinecraftChannelIdentifier` (namespaced) | `String` |
| BungeeCord channel | `"BungeeCord"` (legacy) | `LegacyChannelIdentifier("BungeeCord")` | `"BungeeCord"` (built-in) |
| Mark message as handled | N/A (ChannelMessageSource) | `event.setResult(ForwardResult.handled())` | `event.setCancelled(true)` |

---

## 1. Paper Backend — Send and Receive

### Register and receive incoming messages

```java
// In onEnable():
getServer().getMessenger().registerIncomingPluginChannel(
    this, "myplugin:proxy",
    (channel, player, data) -> {
        ByteArrayDataInput in = ByteStreams.newDataInput(data);
        String action = in.readUTF();
        handleIncoming(action, in, player);
    }
);
getServer().getMessenger().registerOutgoingPluginChannel(this, "myplugin:proxy");
```

### Send a message to the proxy

```java
// Must send via a Player connected to the backend
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("REQUEST_PLAYER_COUNT");
player.sendPluginMessage(plugin, "myplugin:proxy", out.toByteArray());
```

### BungeeCord channel (built-in sub-channels)

```java
// Connect player to another server via BungeeCord channel
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("Connect");
out.writeUTF("lobby");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
```

---

## 2. Velocity Proxy — Handle Incoming and Send Responses

### Register and handle

```java
// Register in onProxyInitialize:
MinecraftChannelIdentifier CHANNEL = MinecraftChannelIdentifier.from("myplugin:proxy");
server.getChannelRegistrar().register(CHANNEL);
server.getEventManager().register(this, messagingHandler);

// Handler:
@Subscribe
public void onPluginMessage(PluginMessageEvent event) {
    if (!event.getIdentifier().equals(CHANNEL)) return;

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    String action = in.readUTF();

    switch (action) {
        case "REQUEST_PLAYER_COUNT" -> respondWithCount(event);
        case "BROADCAST"            -> broadcast(in.readUTF());
        case "MOVE_PLAYER"          -> movePlayer(in.readUTF(), in.readUTF());
    }

    // Mark as handled — prevents forwarding to other listeners
    event.setResult(PluginMessageEvent.ForwardResult.handled());
}

// Respond to backend:
private void respondWithCount(PluginMessageEvent event) {
    if (!(event.getSource() instanceof ServerConnection conn)) return;

    ByteArrayDataOutput out = ByteStreams.newDataOutput();
    out.writeUTF("PLAYER_COUNT_RESPONSE");
    out.writeInt(server.getAllPlayers().size());
    conn.getPlayer().sendPluginMessage(CHANNEL, out.toByteArray());
}
```

### Move player between servers

```java
private void movePlayer(String playerName, String targetServer) {
    server.getPlayer(playerName).ifPresent(player ->
        server.getServer(targetServer).ifPresent(srv ->
            player.createConnectionRequest(srv).fireAndForget()
        )
    );
}
```

---

## 3. Waterfall Proxy — Handle Incoming and Send Responses

### Register and handle

```java
// In onEnable():
getProxy().registerChannel("myplugin:network");
getProxy().getPluginManager().registerListener(this, this);

// Handler:
@EventHandler
public void onPluginMessage(PluginMessageEvent event) {
    if (!"myplugin:network".equals(event.getTag())) return;

    if (!(event.getSender() instanceof Server)) return;  // only from backends

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    String action = in.readUTF();

    switch (action) {
        case "BROADCAST" -> {
            getProxy().broadcast(new TextComponent(in.readUTF()));
            event.setCancelled(true);
        }
        case "MOVE_PLAYER" -> {
            movePlayer(in.readUTF(), in.readUTF());
            event.setCancelled(true);
        }
    }
}

// Move player:
private void movePlayer(String playerName, String targetServer) {
    ProxiedPlayer player = getProxy().getPlayer(playerName);
    ServerInfo server = getProxy().getServerInfo(targetServer);
    if (player != null && server != null) {
        player.connect(server);
    }
}
```

---

## 4. BungeeCord Built-in Sub-channels

Waterfall (and backend servers) support these `BungeeCord` channel sub-channels:

| Sub-channel | Direction | Purpose |
|-------------|-----------|---------|
| `Connect` | Backend → Proxy | Connect player to named server |
| `ConnectOther` | Backend → Proxy | Connect another player to server |
| `IP` | Backend → Proxy | Get player's real IP |
| `PlayerCount` | Backend → Proxy | Count players on a server |
| `PlayerList` | Backend → Proxy | List player names on a server |
| `GetServers` | Backend → Proxy | Get list of all servers |
| `Message` | Backend → Proxy | Send message to player on another server |
| `GetServer` | Backend → Proxy | Get the server the current player is on |
| `Forward` | Backend → Proxy | Forward custom data to another server |
| `ForwardToPlayer` | Backend → Proxy | Forward custom data to a specific player's server |

> **Velocity note**: Velocity supports the `BungeeCord` channel for legacy compatibility via `LegacyChannelIdentifier("BungeeCord")`. However, prefer custom namespaced channels for new code.

---

## 5. Payload Serialization

Use Guava's `ByteStreams` (bundled with both Velocity and Waterfall):

```java
import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;

// Write
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("ACTION_NAME");
out.writeUTF(stringValue);
out.writeInt(intValue);
out.writeBoolean(boolValue);
byte[] payload = out.toByteArray();

// Read
ByteArrayDataInput in = ByteStreams.newDataInput(payload);
String action = in.readUTF();
String str    = in.readUTF();
int    num    = in.readInt();
boolean flag  = in.readBoolean();
```

**Common pitfalls:**
- Always read in the **same order** you wrote
- Check `if (!(event.getSender() instanceof Server))` on Waterfall to filter backend-only messages
- On Velocity, always call `event.setResult(ForwardResult.handled())` or `forward()` — never leave it unset
- On Waterfall, call `event.setCancelled(true)` for messages you handle internally

---

## Related Skills

- `Skills/velocity/generate-plugin-message-handler/SKILL.md` — Velocity messaging skill
- `Skills/waterfall/generate-bungeecord-channel/SKILL.md` — Waterfall messaging skill
- `skills/velocity/messaging/plugin-messages.md` — Detailed Velocity messaging reference
- `skills/waterfall/messaging/bungeecord-channels.md` — Full BungeeCord sub-channel reference
- `skills/paper/messaging/plugin-channels.md` — Backend Paper messaging reference
