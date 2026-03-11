---
name: generate-bungeecord-channel
description: 為 Waterfall/BungeeCord proxy plugin 產生 plugin messaging channel 處理器，支援自訂頻道和 BungeeCord 內建 sub-channel（Connect、GetServer、PlayerCount 等），含 ByteStreams 序列化和 event.setCancelled() 正確用法。當使用者說「BungeeCord channel」、「PluginMessageEvent Waterfall」、「plugin messaging BungeeCord」、「自訂頻道 Waterfall」時自動應用。
---

# Generate BungeeCord Channel Handler / 產生 BungeeCord 頻道處理器

## 技能名稱 / Skill Name
generate-bungeecord-channel

## 目的 / Purpose
為 Waterfall proxy plugin 產生完整的 plugin messaging 處理類別，含頻道註冊、入站訊息解析、proxy 向後端回應以及 BungeeCord 內建 sub-channel 攔截範例。

## 觸發條件 / Triggers
- 「BungeeCord channel」
- 「PluginMessageEvent on Waterfall」
- 「plugin messaging BungeeCord」
- 「自訂頻道 Waterfall」
- 「proxy backend communication Waterfall」
- 「ByteStreams BungeeCord」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_package` | `com.mynetwork.myplugin` | 插件套件名稱 |
| `channel_name` | `myplugin:network` | 自訂頻道名稱（`namespace:channel` 格式） |
| `actions` | `["BROADCAST", "MOVE_PLAYER", "GET_PLAYER_COUNT"]` | 要處理的 action 列表 |
| `intercept_bungee` | `false` | 是否需要攔截 BungeeCord 內建 sub-channel |

## 輸出產物 / Outputs

- `messaging/WaterfallMessagingHandler.java` — 完整處理器類別（實作 `Listener`）

## 代碼範本 / Code Template

```java
package {plugin_package}.messaging;

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

import java.util.function.Consumer;
import java.util.logging.Logger;

public class WaterfallMessagingHandler implements Listener {

    private static final String CUSTOM_CHANNEL = "{channel_name}";
    private static final String BUNGEE_CHANNEL  = "BungeeCord";

    private final Plugin plugin;
    private final Logger logger;

    public WaterfallMessagingHandler(Plugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getLogger();
    }

    /** Call in onEnable(). */
    public void register() {
        plugin.getProxy().registerChannel(CUSTOM_CHANNEL);
        plugin.getProxy().getPluginManager().registerListener(plugin, this);
    }

    /** Call in onDisable(). */
    public void unregister() {
        plugin.getProxy().unregisterChannel(CUSTOM_CHANNEL);
    }

    @EventHandler
    public void onPluginMessage(PluginMessageEvent event) {
        String tag = event.getTag();

        if (CUSTOM_CHANNEL.equals(tag)) {
            // Only handle messages from backend servers
            if (!(event.getSender() instanceof Server)) return;
            handleCustomMessage(event);
        } else if (BUNGEE_CHANNEL.equals(tag)) {
            handleBungeeCordMessage(event);
        }
    }

    // --- Custom Channel Handlers ---

    private void handleCustomMessage(PluginMessageEvent event) {
        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String action = in.readUTF();

        switch (action) {
            case "BROADCAST" -> {
                String message = in.readUTF();
                plugin.getProxy().broadcast(new TextComponent("§6[Network] §f" + message));
                event.setCancelled(true);   // handled internally — don't forward
            }
            case "MOVE_PLAYER" -> {
                String playerName   = in.readUTF();
                String targetServer = in.readUTF();
                movePlayer(playerName, targetServer);
                event.setCancelled(true);
            }
            case "GET_PLAYER_COUNT" -> {
                int count = plugin.getProxy().getOnlineCount();
                respondToBackend(event, "PLAYER_COUNT_RESPONSE",
                    out -> out.writeInt(count));
                event.setCancelled(true);
            }
            default -> logger.warning("Unknown custom action from backend: " + action);
        }
    }

    // --- BungeeCord Built-in Channel Intercept ---

    private void handleBungeeCordMessage(PluginMessageEvent event) {
        ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
        String subChannel = in.readUTF();

        switch (subChannel) {
            case "Connect" -> {
                String targetServer = in.readUTF();
                logger.info("[Audit] BungeeCord Connect request → " + targetServer);
                // Do NOT cancel — let Waterfall process the Connect normally
            }
            // Most BungeeCord sub-channels should NOT be cancelled
            // Only intercept if you are fully replacing Waterfall's handling
        }
    }

    // --- Helpers ---

    private void movePlayer(String playerName, String targetServer) {
        ProxiedPlayer player = plugin.getProxy().getPlayer(playerName);
        if (player == null) {
            logger.warning("Move failed: player '" + playerName + "' not found.");
            return;
        }
        ServerInfo server = plugin.getProxy().getServerInfo(targetServer);
        if (server == null) {
            logger.warning("Move failed: server '" + targetServer + "' not found.");
            return;
        }
        player.connect(server);
    }

    private void respondToBackend(PluginMessageEvent event,
                                   String responseAction,
                                   Consumer<ByteArrayDataOutput> writer) {
        // Route the response via the player who is on the requesting backend
        if (!(event.getReceiver() instanceof ProxiedPlayer player)) return;

        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF(responseAction);
        writer.accept(out);
        player.sendData(CUSTOM_CHANNEL, out.toByteArray());
    }

    /**
     * Send from proxy → specific backend server (requires at least one player on that server).
     */
    public void sendToServer(String serverName, String action,
                              Consumer<ByteArrayDataOutput> writer) {
        plugin.getProxy().getPlayers().stream()
            .filter(p -> p.getServer() != null
                && serverName.equals(p.getServer().getInfo().getName()))
            .findFirst()
            .ifPresent(p -> {
                ByteArrayDataOutput out = ByteStreams.newDataOutput();
                out.writeUTF(action);
                writer.accept(out);
                p.sendData(CUSTOM_CHANNEL, out.toByteArray());
            });
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
    if (messagingHandler != null) messagingHandler.unregister();
}
```

**Backend (Paper) side:**
```java
// onEnable():
getServer().getMessenger().registerIncomingPluginChannel(
    this, "{channel_name}",
    (channel, player, data) -> { /* handle response */ }
);
getServer().getMessenger().registerOutgoingPluginChannel(this, "{channel_name}");

// Send to proxy:
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("BROADCAST");
out.writeUTF("Hello from backend!");
player.sendPluginMessage(this, "{channel_name}", out.toByteArray());
```

## BungeeCord Sub-Channel Reference

| Sub-Channel | 用途 | 方向 |
|-------------|------|------|
| `Connect` | 將玩家連接到指定伺服器 | Backend → Proxy |
| `ConnectOther` | 將其他玩家連接到指定伺服器 | Backend → Proxy |
| `IP` | 獲取玩家真實 IP | Backend → Proxy |
| `PlayerCount` | 獲取指定伺服器玩家數 | Backend ↔ Proxy |
| `PlayerList` | 獲取指定伺服器玩家名單 | Backend ↔ Proxy |
| `GetServers` | 獲取所有伺服器列表 | Backend → Proxy |
| `Message` | 向其他伺服器玩家發送訊息 | Backend → Proxy |
| `GetServer` | 獲取玩家當前伺服器 | Backend → Proxy |
| `Forward` | 向指定伺服器轉發自訂資料 | Backend → Backend (via Proxy) |
| `ForwardToPlayer` | 向特定玩家所在伺服器轉發資料 | Backend → Backend (via Proxy) |

## 失敗回退 / Fallback

- 在 Waterfall 不要使用 `MinecraftChannelIdentifier`（那是 Velocity 的類別），頻道名稱直接用字串。
- 若未呼叫 `event.setCancelled(true)`，Waterfall 會將訊息轉發給玩家——對於在 proxy 內部處理的訊息，必須 cancel。
- 不要 cancel 內建 BungeeCord sub-channel（如 `Connect`、`GetServer`），除非你要完全取代 Waterfall 的處理邏輯。
- `sendToServer()` 需要目標伺服器上至少有一位玩家，否則無法路由。
