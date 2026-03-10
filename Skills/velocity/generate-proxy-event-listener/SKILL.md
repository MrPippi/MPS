---
name: generate-proxy-event-listener
description: 為 Velocity proxy plugin 產生 @Subscribe 事件監聽器，支援連線事件（LoginEvent, PostLoginEvent, DisconnectEvent）和伺服器切換事件（ServerConnectedEvent, PlayerChooseInitialServerEvent）。當使用者說「監聽 Velocity 事件」、「proxy event listener」、「login event」、「server switch」時自動應用。
---

# Generate Proxy Event Listener / 產生 Velocity 事件監聽器

## 技能名稱 / Skill Name
generate-proxy-event-listener

## 目的 / Purpose
依使用者指定的 Velocity 事件清單，產生完整的 `@Subscribe` 事件監聽器類別，含 PostOrder、ResultedEvent 處理、正確的 Guice 注入範例。

## 觸發條件 / Triggers
- 「監聽 Velocity 事件」
- 「proxy event listener」
- 「@Subscribe」
- 「LoginEvent / PostLoginEvent / DisconnectEvent」
- 「server switch event」
- 「PlayerChooseInitialServerEvent」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `listener_name` | `ConnectionListener` | 監聽器類別名稱 |
| `events` | `["PostLoginEvent", "DisconnectEvent", "ServerConnectedEvent"]` | 要監聽的事件列表 |
| `plugin_package` | `com.mynetwork.myplugin` | 插件套件名稱 |
| `deny_on_login` | `false` | 是否需要在 LoginEvent 拒絕連線（ResultedEvent 模式） |

## 輸出產物 / Outputs

- `{ListenerName}.java` — 完整的事件監聽器類別

## 代碼範本 / Code Template

```java
package {plugin_package}.listeners;

import com.velocitypowered.api.event.PostOrder;
import com.velocitypowered.api.event.ResultedEvent;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.DisconnectEvent;
import com.velocitypowered.api.event.connection.LoginEvent;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.event.player.PlayerChooseInitialServerEvent;
import com.velocitypowered.api.event.player.ServerConnectedEvent;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.slf4j.Logger;

import java.util.Optional;

public class ConnectionListener {

    private final ProxyServer server;
    private final Logger logger;

    public ConnectionListener(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    /**
     * Fires before the player is fully logged in — can deny the connection.
     * This is a ResultedEvent: always call event.setResult() when making decisions.
     */
    @Subscribe(order = PostOrder.NORMAL)
    public void onLogin(LoginEvent event) {
        String username = event.getPlayer().getUsername();

        if (isBanned(username)) {
            // Deny the connection with a reason
            event.setResult(ResultedEvent.ComponentResult.denied(
                Component.text("You are banned from this network.")
                    .color(NamedTextColor.RED)
            ));
            return;
        }
        // Allow (default result — only set explicitly when needed)
    }

    /**
     * Fires after the player has fully connected to the proxy.
     * Safe place to load player data, broadcast join messages, etc.
     */
    @Subscribe(order = PostOrder.NORMAL)
    public void onPostLogin(PostLoginEvent event) {
        Player player = event.getPlayer();
        logger.info("{} ({}) connected to the proxy.",
            player.getUsername(), player.getUniqueId());

        // Network-wide join broadcast
        server.getAllPlayers().forEach(p ->
            p.sendMessage(Component.text("→ ")
                .color(NamedTextColor.GREEN)
                .append(Component.text(player.getUsername() + " joined the network.")
                    .color(NamedTextColor.WHITE)))
        );
    }

    /**
     * Fires when Velocity selects the initial backend server for a connecting player.
     * Override the target server by calling event.setInitialServer().
     */
    @Subscribe(order = PostOrder.NORMAL)
    public void onChooseInitialServer(PlayerChooseInitialServerEvent event) {
        Optional<RegisteredServer> lobby = server.getServer("lobby");
        lobby.ifPresent(event::setInitialServer);
    }

    /**
     * Fires after the player successfully switches to a backend server.
     */
    @Subscribe(order = PostOrder.NORMAL)
    public void onServerConnected(ServerConnectedEvent event) {
        Player player = event.getPlayer();
        String targetServer   = event.getServer().getServerInfo().getName();
        String previousServer = event.getPreviousServer()
            .map(s -> s.getServerInfo().getName())
            .orElse("none");

        logger.info("{} switched from {} to {}",
            player.getUsername(), previousServer, targetServer);
    }

    /**
     * Fires when the player disconnects from the proxy entirely.
     */
    @Subscribe(order = PostOrder.NORMAL)
    public void onDisconnect(DisconnectEvent event) {
        logger.info("{} disconnected ({}).",
            event.getPlayer().getUsername(),
            event.getLoginStatus());
    }

    private boolean isBanned(String username) {
        // Replace with your ban storage check
        return false;
    }
}
```

**Register the listener in your main plugin class:**
```java
@Subscribe
public void onProxyInitialize(ProxyInitializeEvent event) {
    server.getEventManager().register(this, new ConnectionListener(server, logger));
}
```

## 事件速查表 / Event Quick Reference

| Event | 套件 | 觸發時機 | ResultedEvent? |
|-------|------|---------|----------------|
| `PreLoginEvent` | `connection` | 最早階段，可拒絕（甚至在 UUID 查詢前） | ✅ |
| `LoginEvent` | `connection` | UUID 確認後，可拒絕連線 | ✅ |
| `PostLoginEvent` | `connection` | 完全連線後 | ❌ |
| `DisconnectEvent` | `connection` | 玩家斷線（含未完全登入的情況） | ❌ |
| `PlayerChooseInitialServerEvent` | `player` | 選擇初始後端伺服器 | ✅ |
| `ServerPreConnectEvent` | `player` | 切換伺服器前，可拒絕 | ✅ |
| `ServerConnectedEvent` | `player` | 切換伺服器完成後 | ❌ |
| `KickedFromServerEvent` | `player` | 被後端伺服器踢出 | ✅ (可重導向) |
| `PlayerChatEvent` | `player` | 玩家發送聊天訊息 | ✅ |
| `CommandExecuteEvent` | `command` | 玩家執行指令 | ✅ |

## 失敗回退 / Fallback

- 不要在 `@Subscribe` 方法中使用 `@EventHandler`（那是 Bukkit/Waterfall 的 annotation，會被 Velocity 靜默忽略）。
- `LoginEvent` 是 `ResultedEvent`：如果沒有呼叫 `setResult()`，預設結果是允許（allow）。
- Velocity 事件全部在 async thread pool 執行，不要呼叫 `Thread.sleep()` 或執行 blocking IO。
- 若需要在事件處理完成前等待 async 工作，回傳 `EventTask.async(() -> {...})`。
