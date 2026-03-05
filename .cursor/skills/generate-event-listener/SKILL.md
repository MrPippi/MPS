---
name: generate-event-listener
description: 依使用者指定的 Bukkit/Paper 事件名稱清單，產生對應的 Listener 類別骨架，含正確的 @EventHandler 宣告、EventPriority 設定、ignoreCancelled 選項、常見欄位取用範例，以及在主類中的註冊方式。當使用者說「監聽事件」、「幫我寫 Listener」、「EventHandler 怎麼用」、「產生事件監聽器」時自動應用。
---

# Generate Event Listener Skill

## 目標

依使用者提供的事件名稱清單，產生結構正確、可直接貼入專案的 `Listener` 實作類別，包含常用欄位存取範例與執行緒安全提醒。

---

## 使用流程

1. **詢問事件清單**：使用者列出要監聽的事件（例：`PlayerJoinEvent, BlockBreakEvent`）
2. **詢問選項**：
   - EventPriority（預設 `NORMAL`）
   - 是否 `ignoreCancelled`（預設 `true`）
   - 是否需要取消事件（`event.setCancelled(true)`）
3. **產生 Listener 類別**：含所有指定事件的 handler 方法
4. **輸出註冊方式**：在 `onEnable()` 中呼叫

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| `class_name` | `PlayerListener` | 類別名稱 |
| `package` | `com.example.myplugin.listeners` | 套件名 |
| `events` | `PlayerJoinEvent, PlayerQuitEvent` | 要監聽的事件清單 |
| `priority` | `NORMAL` | EventPriority（LOW/NORMAL/HIGH/HIGHEST/MONITOR） |
| `ignore_cancelled` | `true` | 是否忽略已取消的事件 |

---

## 代碼範本

### 玩家事件 Listener

```java
package com.example.myplugin.listeners;

import com.example.myplugin.MyPlugin;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerDeathEvent;

public class PlayerListener implements Listener {

    private final MyPlugin plugin;

    public PlayerListener(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();

        // 修改加入訊息（null = 不顯示）
        event.joinMessage(
            Component.text(player.getName() + " 加入了遊戲！").color(NamedTextColor.GREEN)
        );

        // 首次登入處理
        if (!player.hasPlayedBefore()) {
            player.sendMessage(Component.text("歡迎首次加入！").color(NamedTextColor.GOLD));
        }
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();

        event.quitMessage(
            Component.text(player.getName() + " 離開了遊戲。").color(NamedTextColor.GRAY)
        );
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player player = event.getEntity();

        // 自訂死亡訊息
        event.deathMessage(
            Component.text(player.getName() + " 死了。").color(NamedTextColor.RED)
        );

        // 保留死亡物品（不掉落）
        // event.setKeepInventory(true);
        // event.getDrops().clear();
    }
}
```

---

### 方塊與世界事件 Listener

```java
package com.example.myplugin.listeners;

import com.example.myplugin.MyPlugin;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;

public class BlockListener implements Listener {

    private final MyPlugin plugin;

    public BlockListener(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        Block block = event.getBlock();

        // 阻止特定方塊被破壞
        if (block.getType() == Material.BEDROCK) {
            event.setCancelled(true);
            player.sendMessage("你無法破壞此方塊！");
            return;
        }

        // 阻止掉落物（例：精準採集效果）
        // event.setDropItems(false);
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onBlockPlace(BlockPlaceEvent event) {
        Player player = event.getPlayer();
        Block block = event.getBlockPlaced();

        if (!player.hasPermission("myplugin.build")) {
            event.setCancelled(true);
            player.sendMessage("你沒有建造權限！");
        }
    }
}
```

---

### 實體事件 Listener

```java
package com.example.myplugin.listeners;

import com.example.myplugin.MyPlugin;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;

public class EntityListener implements Listener {

    private final MyPlugin plugin;

    public EntityListener(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onEntityDamageByEntity(EntityDamageByEntityEvent event) {
        // 玩家被玩家攻擊
        if (event.getDamager() instanceof Player attacker
                && event.getEntity() instanceof Player victim) {

            // 停用 PvP
            // event.setCancelled(true);

            double damage = event.getDamage();
            attacker.sendMessage("你對 " + victim.getName() + " 造成了 " + damage + " 點傷害。");
        }
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onEntityDamage(EntityDamageEvent event) {
        Entity entity = event.getEntity();

        // 讓特定類型實體免疫傷害
        if (entity.getType() == EntityType.VILLAGER) {
            event.setCancelled(true);
        }
    }
}
```

---

### 在主類中註冊

```java
@Override
public void onEnable() {
    getServer().getPluginManager().registerEvents(new PlayerListener(this), this);
    getServer().getPluginManager().registerEvents(new BlockListener(this), this);
    getServer().getPluginManager().registerEvents(new EntityListener(this), this);
}
```

---

## EventPriority 說明

| Priority | 說明 | 適用場景 |
|----------|------|----------|
| `LOWEST` | 最先執行 | 基礎資料讀取 |
| `LOW` | 較早執行 | 前置驗證 |
| `NORMAL` | 預設 | 一般邏輯（大多數情況） |
| `HIGH` | 較晚執行 | 覆蓋其他插件 |
| `HIGHEST` | 幾乎最後 | 最終決策 |
| `MONITOR` | 只讀監視 | 日誌記錄，**不可修改事件** |

---

## 常用事件速查

### 玩家類
| 事件 | 觸發時機 |
|------|----------|
| `PlayerJoinEvent` | 玩家加入伺服器 |
| `PlayerQuitEvent` | 玩家離開伺服器 |
| `PlayerDeathEvent` | 玩家死亡 |
| `PlayerRespawnEvent` | 玩家重生 |
| `PlayerMoveEvent` | 玩家移動（高頻率，謹慎使用）|
| `PlayerInteractEvent` | 玩家右鍵/左鍵互動 |
| `PlayerDropItemEvent` | 玩家丟棄物品 |
| `PlayerInventoryClickEvent` | 點擊背包格子 |
| `AsyncPlayerChatEvent` | 玩家聊天（非同步）|

### 方塊類
| 事件 | 觸發時機 |
|------|----------|
| `BlockBreakEvent` | 玩家破壞方塊 |
| `BlockPlaceEvent` | 玩家放置方塊 |
| `BlockBurnEvent` | 方塊被火燒毀 |
| `SignChangeEvent` | 玩家修改告示牌 |

### 實體類
| 事件 | 觸發時機 |
|------|----------|
| `EntityDamageEvent` | 實體受到傷害 |
| `EntityDamageByEntityEvent` | 實體被另一實體傷害 |
| `EntityDeathEvent` | 實體死亡 |
| `CreatureSpawnEvent` | 生物生成 |
| `ProjectileHitEvent` | 投射物命中 |

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| Event 未觸發 | 忘記 `registerEvents()` | 在 `onEnable()` 中呼叫 |
| `ignoreCancelled = true` 但仍執行 | 事件未被其他插件取消 | 確認是否有其他插件先取消 |
| `MONITOR` priority 修改了事件 | Monitor 僅用於觀察 | 改用 `HIGHEST` 做最後修改 |
| `PlayerMoveEvent` 導致 TPS 下降 | 每 tick 大量觸發 | 加上 `hasMoved()` 判斷或只監聽區塊變更 |
| `AsyncPlayerChatEvent` 操作 Bukkit 物件 | 非主執行緒 | 用 `Bukkit.getScheduler().runTask()` 切回主執行緒 |
