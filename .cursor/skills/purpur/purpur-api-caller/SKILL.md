---
name: purpur-api-caller
description: 為 Purpur 伺服器插件產生正確的 Purpur-specific Java API 調用代碼，包含 Purpur 專屬事件（PlayerAFKEvent）、purpur.yml 配置讀取、Purpur/Paper 雙平台相容守衛。當使用者說「Purpur API」、「PlayerAFKEvent」、「purpur.yml」、「Purpur 特有功能」時自動應用。
---

# Purpur API Caller / Purpur API 代碼產生器

## 技能名稱 / Skill Name
purpur-api-caller

## 目的 / Purpose
為需要使用 Purpur 專屬 API 的插件產生正確的 Java 代碼，包含執行環境偵測守衛（確保同一 JAR 可在 Paper 和 Purpur 上執行）。

## 觸發條件 / Triggers
- 「Purpur API」
- 「PlayerAFKEvent」
- 「purpur.yml 配置」
- 「Purpur 特有功能」
- 「purpur event」
- 「EntityAirChangeEvent」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `api_type` | `afk_event` | 要使用的 Purpur API 類型（見下方速查表） |
| `plugin_package` | `com.mynetwork.myplugin` | 插件套件名稱 |
| `purpur_only` | `false` | 是否要求僅在 Purpur 上執行（true = 加入執行環境守衛） |

## 輸出產物 / Outputs

- 對應 API 的 Java 代碼片段或完整類別

## Purpur API 速查表 / API Quick Reference

| API 類型 | 套件 | 說明 |
|---------|------|------|
| `PlayerAFKEvent` | `org.purpurmc.purpur.event.player` | 玩家進入 AFK 狀態 |
| `PlayerNotAFKEvent` | same | 玩家離開 AFK 狀態 |
| `EntityAirChangeEvent` | `org.purpurmc.purpur.event.entity` | 實體空氣值變化 |

## 代碼範本 / Code Templates

### 1. AFK 事件監聽器（`PlayerAFKEvent`）

```java
package {plugin_package}.listeners;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.plugin.java.JavaPlugin;
import org.purpurmc.purpur.event.player.PlayerAFKEvent;
import org.purpurmc.purpur.event.player.PlayerNotAFKEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

/**
 * Handles Purpur-specific AFK events.
 * Only register this listener if Purpur is available at runtime.
 * See: MyPlugin.isPurpurAvailable()
 */
public class PurpurAfkListener implements Listener {

    private final JavaPlugin plugin;

    public PurpurAfkListener(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerAfk(PlayerAFKEvent event) {
        // Fires when the player has been idle for purpur.yml afk-timeout seconds
        event.getPlayer().sendMessage(
            Component.text("You are now AFK.").color(NamedTextColor.GRAY)
        );
        plugin.getSLF4JLogger().info("{} went AFK.", event.getPlayer().getName());
    }

    @EventHandler
    public void onPlayerNotAfk(PlayerNotAFKEvent event) {
        event.getPlayer().sendMessage(
            Component.text("Welcome back!").color(NamedTextColor.GREEN)
        );
        plugin.getSLF4JLogger().info("{} is no longer AFK.", event.getPlayer().getName());
    }
}
```

**Register with runtime guard (in your main class):**
```java
@Override
public void onEnable() {
    // Always register Paper listeners:
    getServer().getPluginManager().registerEvents(new GeneralListener(this), this);

    // Only register Purpur listeners if running on Purpur:
    if (isPurpurAvailable()) {
        getServer().getPluginManager().registerEvents(new PurpurAfkListener(this), this);
        getSLF4JLogger().info("Purpur detected — AFK events enabled.");
    }
}

public static boolean isPurpurAvailable() {
    try {
        Class.forName("org.purpurmc.purpur.event.player.PlayerAFKEvent");
        return true;
    } catch (ClassNotFoundException e) {
        return false;
    }
}
```

### 2. EntityAirChangeEvent

```java
package {plugin_package}.listeners;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.purpurmc.purpur.event.entity.EntityAirChangeEvent;

public class PurpurEntityListener implements Listener {

    @EventHandler
    public void onEntityAirChange(EntityAirChangeEvent event) {
        // Fires when an entity's air supply changes (e.g., player diving)
        if (event.getEntity() instanceof org.bukkit.entity.Player player) {
            if (event.getAmount() < 0 && player.getRemainingAir() <= 40) {
                // Player is about to drown — warn them
                player.sendActionBar(
                    net.kyori.adventure.text.Component.text("⚠ Running out of air!")
                        .color(net.kyori.adventure.text.format.NamedTextColor.RED)
                );
            }
        }
    }
}
```

### 3. `purpur.yml` AFK Timeout Configuration

The AFK timeout (seconds before `PlayerAFKEvent` fires) is configured server-side in `purpur.yml`:

```yaml
gameplay-mechanics:
  afk-timeout: 300   # 5 minutes — set to -1 to disable
```

This is a **server configuration**, not a plugin config. Your plugin cannot change it at runtime, but can read the current timeout via `Bukkit.getServer()` server properties inspection or by documenting the expected configuration to server admins.

## 失敗回退 / Fallback

- 若在 Paper（非 Purpur）伺服器上執行且沒有加入執行環境守衛，載入 `PurpurAfkListener` 時會拋出 `ClassNotFoundException`，導致插件初始化失敗。**務必使用 `isPurpurAvailable()` 守衛**。
- `purpur-api` 在 `build.gradle` 中必須標記為 `compileOnly`（伺服器執行時提供）。若誤用 `implementation`，會將 Purpur API 打包進 JAR，造成版本衝突。
- Purpur 的 API 變更較少，但仍建議在 `build.gradle` 固定版本（`1.21.1-R0.1-SNAPSHOT`），並在伺服器升級時重新測試。
