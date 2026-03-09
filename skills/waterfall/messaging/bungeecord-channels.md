# BungeeCord Channel Protocol — Waterfall

Complete reference for the `BungeeCord` plugin messaging channel used between Paper backend servers and BungeeCord/Waterfall proxies.

---

## Protocol Overview

All messages on the `BungeeCord` channel follow this structure:

**Backend → Proxy (outgoing from Paper):**
1. `writeUTF(subChannelName)` — identifies the operation
2. Additional arguments depending on sub-channel

**Proxy → Backend (incoming to Paper):**
1. `readUTF()` — the response sub-channel name (usually same as request)
2. Response data

Communication is via Guava's `ByteArrayDataOutput` / `ByteArrayDataInput` (bundled with Paper and BungeeCord).

---

## Outgoing Sub-Channels (Paper → Proxy)

### Connect

Send the message-sending player to another server.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("Connect");
out.writeUTF("lobby");   // server name as in BungeeCord config
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
```

### ConnectOther

Send a different player to a server.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("ConnectOther");
out.writeUTF("TargetPlayerName");   // must be on the network
out.writeUTF("games");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
```

### GetServer

Request which server name this player is on. Response comes back asynchronously.

```java
// Request
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("GetServer");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response handler (in PluginMessageListener):
// in.readUTF() → sub-channel = "GetServer"
// in.readUTF() → serverName
```

### GetServers

Request the list of all registered server names.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("GetServers");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "GetServers"
// in.readUTF() → "lobby,games,survival" (comma-separated)
```

### PlayerCount

Request the online player count for a server (or all servers).

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("PlayerCount");
out.writeUTF("ALL");   // or specific server name
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "PlayerCount"
// in.readUTF() → serverName (or "ALL")
// in.readInt() → count
```

### PlayerList

Request the list of player names on a server.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("PlayerList");
out.writeUTF("ALL");   // or specific server name
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "PlayerList"
// in.readUTF() → serverName
// in.readUTF() → "Player1,Player2,Player3"
```

### IP

Request the real IP address the player connected from (proxy-level).

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("IP");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "IP"
// in.readUTF() → "192.168.1.100"
// in.readInt() → port
```

### IPOther

Request the IP of another player.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("IPOther");
out.writeUTF("OtherPlayerName");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "IPOther"
// in.readUTF() → playerName
// in.readUTF() → ip
// in.readInt() → port
```

### UUID

Request this player's UUID as seen by BungeeCord.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("UUID");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "UUID"
// in.readUTF() → "550e8400-e29b-41d4-a716-446655440000"
```

### UUIDOther

Request another player's UUID.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("UUIDOther");
out.writeUTF("OtherPlayerName");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "UUIDOther"
// in.readUTF() → playerName
// in.readUTF() → uuid
```

### ServerIP

Request the IP and port of a backend server registered in BungeeCord.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("ServerIP");
out.writeUTF("lobby");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "ServerIP"
// in.readUTF() → serverName
// in.readUTF() → "127.0.0.1"
// in.readShort() → 25565
```

### Message

Send a chat message to a specific player on the network.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("Message");
out.writeUTF("TargetPlayerName");   // or "ALL" for all players
out.writeUTF("Hello from another server!");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
// No response
```

### GetPlayerServer

Get which server a specific player is currently on.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("GetPlayerServer");
out.writeUTF("TargetPlayerName");
player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());

// Response:
// in.readUTF() → "GetPlayerServer"
// in.readUTF() → playerName
// in.readUTF() → serverName
```

---

## Forward Sub-Channel

Send custom data from one backend to another backend via the proxy.

```java
// On sending backend (Paper server A):
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("Forward");
out.writeUTF("lobby");      // target server name (or "ONLINE" for all servers)
out.writeUTF("myplugin:event");   // your custom sub-channel name

// Serialise your custom payload
ByteArrayDataOutput data = ByteStreams.newDataOutput();
data.writeUTF("PLAYER_RANKED_UP");
data.writeUTF(player.getName());
data.writeInt(5);

byte[] dataBytes = data.toByteArray();
out.writeShort(dataBytes.length);
out.write(dataBytes);

player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
```

```java
// On receiving backend (Paper server lobby):
// In PluginMessageListener.onPluginMessageReceived:
if (subChannel.equals("Forward")) {
    String customChannel = in.readUTF();   // "myplugin:event"
    short len = in.readShort();
    byte[] data = new byte[len];
    in.readFully(data);

    if ("myplugin:event".equals(customChannel)) {
        ByteArrayDataInput payload = ByteStreams.newDataInput(data);
        String event = payload.readUTF();   // "PLAYER_RANKED_UP"
        String name  = payload.readUTF();
        int rank     = payload.readInt();
    }
}
```

---

## ForwardToPlayer

Like `Forward`, but sends to the server a specific player is on.

```java
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("ForwardToPlayer");
out.writeUTF("TargetPlayerName");   // player whose server receives the message
out.writeUTF("myplugin:sync");

byte[] payload = ...;
out.writeShort(payload.length);
out.write(payload);

player.sendPluginMessage(plugin, "BungeeCord", out.toByteArray());
```

---

## Complete Backend PluginMessageListener

```java
package com.yourorg.myplugin.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteStreams;
import org.bukkit.entity.Player;
import org.bukkit.plugin.messaging.PluginMessageListener;

public class BungeeCordListener implements PluginMessageListener {

    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!"BungeeCord".equals(channel)) return;

        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String subChannel = in.readUTF();

        switch (subChannel) {
            case "GetServer"       -> handleGetServer(in);
            case "GetServers"      -> handleGetServers(in);
            case "PlayerCount"     -> handlePlayerCount(in);
            case "PlayerList"      -> handlePlayerList(in);
            case "IP"              -> handleIP(in);
            case "UUID"            -> handleUUID(in);
            case "GetPlayerServer" -> handleGetPlayerServer(in);
            case "Forward"         -> handleForward(in);
            default                -> {}
        }
    }

    private void handleGetServer(ByteArrayDataInput in) {
        String serverName = in.readUTF();
        // use serverName
    }

    private void handleGetServers(ByteArrayDataInput in) {
        String[] servers = in.readUTF().split(", ");
    }

    private void handlePlayerCount(ByteArrayDataInput in) {
        String server = in.readUTF();
        int count = in.readInt();
    }

    private void handlePlayerList(ByteArrayDataInput in) {
        String server = in.readUTF();
        String[] players = in.readUTF().split(", ");
    }

    private void handleIP(ByteArrayDataInput in) {
        String ip = in.readUTF();
        int port = in.readInt();
    }

    private void handleUUID(ByteArrayDataInput in) {
        String uuid = in.readUTF();
    }

    private void handleGetPlayerServer(ByteArrayDataInput in) {
        String playerName = in.readUTF();
        String serverName = in.readUTF();
    }

    private void handleForward(ByteArrayDataInput in) {
        String customChannel = in.readUTF();
        short len = in.readShort();
        byte[] data = new byte[len];
        in.readFully(data);
        // handle based on customChannel
    }
}
```

---

## Common Pitfalls

- **Responses are async**: BungeeCord channel responses come back as new `PluginMessageReceived` events — they are NOT synchronous returns. Register `PluginMessageListener` and dispatch responses in the handler.

- **`PlayerList` response separator**: The players are separated by `", "` (comma + space), not just `","`. Use `in.readUTF().split(", ")`.

- **`Forward` to an empty server**: If the target server has no players online, `Forward` is silently dropped. Use a shared database for reliable cross-server communication.

- **Max payload 32767 bytes**: Both regular messages and `Forward` payloads are limited to 32767 bytes. For larger data, use a shared MySQL database.

## Related Skills

- [SKILL.md](SKILL.md) — Plugin messaging overview
- [../../paper/messaging/plugin-channels.md](../../paper/messaging/plugin-channels.md) — Paper backend side
- [../../velocity/messaging/plugin-messages.md](../../velocity/messaging/plugin-messages.md) — Velocity equivalent
