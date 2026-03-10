---
name: generate-plugin-message-handler
description: 為 Velocity proxy plugin 產生 PluginMessageEvent 處理器，支援自訂 namespaced channel 和 BungeeCord 相容 channel，含 ByteStreams 序列化、ForwardResult 設定、proxy-to-backend 回應範例。當使用者說「plugin messaging」、「PluginMessageEvent」、「proxy channel」、「傳訊息給後端伺服器」時自動應用。
---

# Generate Plugin Message Handler (Velocity) / 產生 Velocity 插件訊息處理器

## 技能名稱 / Skill Name
generate-plugin-message-handler

## 目的 / Purpose
為 Velocity proxy plugin 產生完整的 plugin messaging 處理類別，含頻道註冊、入站訊息解析、proxy 向後端回應的範例。

## 觸發條件 / Triggers
- 「plugin messaging on Velocity」
- 「PluginMessageEvent」
- 「proxy channel」
- 「傳訊息給後端伺服器」
- 「MinecraftChannelIdentifier」
- 「backend proxy communication」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_package` | `com.mynetwork.myplugin` | 插件套件名稱 |
| `channel_namespace` | `myplugin` | 頻道命名空間（小寫英數） |
| `channel_name` | `proxy` | 頻道名稱（結果為 `myplugin:proxy`） |
| `actions` | `["BROADCAST", "MOVE_PLAYER", "PLAYER_COUNT"]` | 要處理的 action 列表 |

## 輸出產物 / Outputs

- `messaging/ProxyMessagingHandler.java` — 完整處理器類別

## 代碼範本 / Code Template

```java
package {plugin_package}.messaging;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PluginMessageEvent;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.ServerConnection;
import com.velocitypowered.api.proxy.messages.MinecraftChannelIdentifier;
import net.kyori.adventure.text.minimessage.MiniMessage;
import org.slf4j.Logger;

public class ProxyMessagingHandler {

    // Channel identifier: "{channel_namespace}:{channel_name}"
    public static final MinecraftChannelIdentifier CHANNEL =
        MinecraftChannelIdentifier.from("{channel_namespace}:{channel_name}");

    private final ProxyServer server;
    private final Logger logger;

    public ProxyMessagingHandler(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    /** Call this from onProxyInitialize to register the channel. */
    public void register() {
        server.getChannelRegistrar().register(CHANNEL);
    }

    /** Call this from onProxyShutdown to clean up. */
    public void unregister() {
        server.getChannelRegistrar().unregister(CHANNEL);
    }

    /** Handles all incoming plugin messages on our channel. */
    @Subscribe
    public void onPluginMessage(PluginMessageEvent event) {
        // Filter: only our channel
        if (!event.getIdentifier().equals(CHANNEL)) return;

        // Filter: only accept messages from backend servers (not from players)
        if (!(event.getSource() instanceof ServerConnection sourceConn)) return;

        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String action = in.readUTF();

        switch (action) {
            case "BROADCAST"     -> handleBroadcast(in);
            case "MOVE_PLAYER"   -> handleMovePlayer(in);
            case "PLAYER_COUNT"  -> handlePlayerCount(sourceConn);
            default              -> logger.warn("Unknown action from backend: {}", action);
        }

        // Mark as handled — prevents forwarding to the player or other listeners
        event.setResult(PluginMessageEvent.ForwardResult.handled());
    }

    // --- Action Handlers ---

    private void handleBroadcast(ByteArrayDataInput in) {
        String miniMessage = in.readUTF();
        server.getAllPlayers().forEach(p ->
            p.sendMessage(MiniMessage.miniMessage().deserialize(miniMessage))
        );
        logger.info("Proxy broadcast: {}", miniMessage);
    }

    private void handleMovePlayer(ByteArrayDataInput in) {
        String playerName  = in.readUTF();
        String targetServer = in.readUTF();

        server.getPlayer(playerName).ifPresentOrElse(
            player -> server.getServer(targetServer).ifPresentOrElse(
                srv   -> player.createConnectionRequest(srv).fireAndForget(),
                ()    -> logger.warn("Move failed: server '{}' not found", targetServer)
            ),
            () -> logger.warn("Move failed: player '{}' not found", playerName)
        );
    }

    private void handlePlayerCount(ServerConnection requester) {
        // Respond to the backend server that asked
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("PLAYER_COUNT_RESPONSE");
        out.writeInt(server.getAllPlayers().size());

        requester.getPlayer().sendPluginMessage(CHANNEL, out.toByteArray());
    }

    // --- Outbound: Proxy → Backend ---

    /**
     * Send a message from the proxy to a specific backend server.
     * Requires any player currently on that server as a routing conduit.
     */
    public void sendToBackend(String serverName, String action, java.util.function.Consumer<ByteArrayDataOutput> writer) {
        server.getServer(serverName).ifPresent(registeredServer -> {
            ByteArrayDataOutput out = ByteStreams.newDataOutput();
            out.writeUTF(action);
            writer.accept(out);
            byte[] payload = out.toByteArray();

            // Route via the first online player on that server
            registeredServer.getPlayersConnected().stream()
                .findFirst()
                .ifPresent(p -> p.sendPluginMessage(CHANNEL, payload));
        });
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
    if (messagingHandler != null) messagingHandler.unregister();
}
```

**Backend (Paper) side — register incoming channel:**
```java
// In onEnable():
getServer().getMessenger().registerIncomingPluginChannel(
    this, "{channel_namespace}:{channel_name}",
    (channel, player, data) -> {
        ByteArrayDataInput in = ByteStreams.newDataInput(data);
        String responseAction = in.readUTF();
        // handle response...
    }
);
getServer().getMessenger().registerOutgoingPluginChannel(
    this, "{channel_namespace}:{channel_name}"
);
```

## 失敗回退 / Fallback

- 如果沒有呼叫 `event.setResult(ForwardResult.handled())`，Velocity 會將訊息轉發給其他監聽者或玩家，可能造成重複處理。
- 頻道命名空間必須全小寫英數，否則 `MinecraftChannelIdentifier.from()` 拋出異常。
- `sendToBackend()` 需要目標伺服器上至少有一位玩家，否則訊息無法路由。若無玩家，需在伺服器本身掛載 `ServerConnection` 或使用其他 IPC 方案（如 Redis）。
- 請確認後端 Paper 插件已用 `registerIncomingPluginChannel()` 和 `registerOutgoingPluginChannel()` 雙向註冊同一頻道。
