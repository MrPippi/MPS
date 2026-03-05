---
name: spigot-paper-api-caller
description: 為 Minecraft Bukkit/Spigot/Paper 插件產生正確的 Java API 調用代碼，包含事件系統、指令、玩家操作、世界操作、物品堆疊、NBT、調度器等。當使用者詢問「如何用 API 做 X」、「幫我寫調用 XXEvent 的代碼」、「Paper API 怎麼用」時自動應用。
---

# Spigot / Paper API Caller Skill

## 目標

依使用者描述的功能需求，產生正確、現代化的 Spigot/Paper Java API 調用代碼片段，並附上必要的 import 與說明。

---

## 使用流程

1. **確認 MC 版本**：Paper 1.20+ 與舊版 API 有差異，優先使用新版寫法
2. **確認功能需求**：事件監聽 / 指令 / 玩家操作 / 排程 / 資料儲存
3. **產生代碼**：含完整 import、正確類別與方法名稱
4. **補充注意事項**：執行緒安全、主執行緒限制、棄用 API 替代方案

---

## 常用 API 類別速查

| 需求 | 主要類別 |
|------|----------|
| 玩家操作 | `Player`, `HumanEntity` |
| 世界操作 | `World`, `Location`, `Chunk` |
| 物品 | `ItemStack`, `ItemMeta`, `Material` |
| 事件 | `Listener`, `@EventHandler`, `EventPriority` |
| 指令 | `CommandExecutor`, `TabCompleter` |
| 排程 | `BukkitRunnable`, `BukkitScheduler` |
| NBT (Paper) | `PersistentDataContainer`, `PersistentDataType` |
| 聊天訊息 | `Component` (Adventure API, Paper 1.16+) |
| 資料庫 | `HikariCP` (連線池推薦) |

---

## 代碼範本

### 事件監聽器
```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

public class PlayerListener implements Listener {

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerJoin(PlayerJoinEvent event) {
        // event.getPlayer() 取得玩家
    }
}
```
注意：Listener 必須在主類 `onEnable()` 中 `getServer().getPluginManager().registerEvents(new PlayerListener(), this);`

### 非同步排程（延遲/重複執行）
```java
// 延遲 20 ticks（1 秒）後在主執行緒執行
new BukkitRunnable() {
    @Override
    public void run() {
        // 主執行緒安全操作
    }
}.runTaskLater(plugin, 20L);

// 非同步重複任務（不可操作 Bukkit 物件）
new BukkitRunnable() {
    @Override
    public void run() {
        // 資料庫查詢等耗時操作
    }
}.runTaskTimerAsynchronously(plugin, 0L, 100L);
```

### Adventure Component（Paper 1.16+）
```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

player.sendMessage(
    Component.text("Hello, ").color(NamedTextColor.GREEN)
        .append(Component.text(player.getName()).color(NamedTextColor.GOLD))
);
```
舊版 `player.sendMessage(ChatColor.GREEN + "...")` 僅在 Spigot 使用。

### PersistentDataContainer（NBT 儲存）
```java
import org.bukkit.NamespacedKey;
import org.bukkit.persistence.PersistentDataType;

// 寫入
NamespacedKey key = new NamespacedKey(plugin, "my_data");
player.getPersistentDataContainer().set(key, PersistentDataType.STRING, "value");

// 讀取
String value = player.getPersistentDataContainer()
    .getOrDefault(key, PersistentDataType.STRING, "default");
```

### ItemStack 建立與設定 Meta
```java
import org.bukkit.Material;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import net.kyori.adventure.text.Component;

ItemStack item = new ItemStack(Material.DIAMOND_SWORD);
ItemMeta meta = item.getItemMeta();
meta.displayName(Component.text("神聖之劍").color(NamedTextColor.AQUA));
meta.lore(List.of(
    Component.text("傳說中的武器").color(NamedTextColor.GRAY)
));
item.setItemMeta(meta);
```

---

## 執行緒安全規則

- **主執行緒**：所有 Bukkit/Paper 物件操作（玩家、世界、物品）
- **非同步執行緒**：IO 操作、資料庫查詢、HTTP 請求
- 從非同步回主執行緒：`Bukkit.getScheduler().runTask(plugin, () -> { ... });`

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `IllegalStateException` 非主執行緒操作 | 在 async 任務中直接操作 Player | 用 `runTask()` 切回主執行緒 |
| `NullPointerException` on `getItemMeta()` | Material 不支援 Meta | 先 `item.hasItemMeta()` 判斷 |
| `ChatColor` 在 Paper 無效 | Paper 推薦 Adventure API | 改用 `Component` |
| Event 未被觸發 | 忘記 `registerEvents()` | 在 `onEnable()` 中註冊 |

---

## 輸出格式規範

回答時依以下格式輸出：

```
1. 所需 import 清單
2. 完整 Java 代碼片段（含類別宣告或方法骨架）
3. 整合說明（在主類哪裡呼叫、需要哪些前置步驟）
4. 注意事項（執行緒、版本相容性）
```

## 其他資源

- 詳細 API 參考見 [api-reference.md](api-reference.md)
