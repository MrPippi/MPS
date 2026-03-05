---
name: generate-placeholder-expansion
description: 為 Bukkit/Paper 插件產生 PlaceholderAPI Expansion 類別，依使用者提供的 placeholder 清單產生對應的處理邏輯，含 pom.xml 依賴設定、plugin.yml 軟依賴宣告、PlaceholderAPI 是否安裝的檢查，以及測試方法。當使用者說「PlaceholderAPI」、「PAPI 擴充」、「幫我寫 placeholder」、「%myplugin_xxx%」時自動應用。
---

# Generate Placeholder Expansion Skill

## 目標

產生符合 PlaceholderAPI 規範的 `PlaceholderExpansion` 子類別，依使用者提供的 placeholder 清單，自動產生 `onRequest()` 方法中的分派邏輯，並附上完整的整合說明。

---

## 使用流程

1. **詢問基本資訊**：插件名稱（用於 identifier）、placeholder 清單（名稱 + 說明）
2. **產生 Expansion 類別**：依 placeholder 清單產生 switch 分派
3. **說明 plugin.yml 設定**：`softdepend` 宣告
4. **說明在主類中的註冊方式**
5. **提供測試指令說明**

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_name` | `MyPlugin` | 用於 Expansion 類別命名 |
| `identifier` | `myplugin` | Placeholder 前綴，即 `%myplugin_xxx%` 中的 `myplugin` |
| `package` | `com.example.myplugin.hooks` | 類別放置的套件 |
| `placeholders` | `balance, rank, playtime` | Placeholder 名稱清單 |

---

## pom.xml 依賴

```xml
<!-- PlaceholderAPI（provided，由伺服器提供） -->
<dependency>
    <groupId>me.clip</groupId>
    <artifactId>placeholderapi</artifactId>
    <version>2.11.6</version>
    <scope>provided</scope>
</dependency>
```

需要加入 PlaceholderAPI 的 Maven repository：

```xml
<repository>
    <id>placeholderapi</id>
    <url>https://repo.extendedclip.com/content/repositories/placeholderapi/</url>
</repository>
```

---

## plugin.yml 設定

```yaml
# 硬依賴（若 PAPI 不存在插件不啟動）
# depend: [PlaceholderAPI]

# 軟依賴（若 PAPI 不存在插件仍啟動，功能降級）
softdepend: [PlaceholderAPI]
```

---

## 代碼範本

### MyPluginExpansion.java

```java
package com.example.myplugin.hooks;

import com.example.myplugin.MyPlugin;
import me.clip.placeholderapi.expansion.PlaceholderExpansion;
import org.bukkit.OfflinePlayer;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

/**
 * 提供以下 placeholders：
 *
 * %myplugin_balance%      - 玩家目前餘額
 * %myplugin_rank%         - 玩家目前排名
 * %myplugin_playtime%     - 玩家累計遊玩時間（小時）
 * %myplugin_status%       - 玩家目前狀態（online/offline）
 */
public class MyPluginExpansion extends PlaceholderExpansion {

    private final MyPlugin plugin;

    public MyPluginExpansion(MyPlugin plugin) {
        this.plugin = plugin;
    }

    // ---- 必要元數據 ----

    @Override
    public @NotNull String getIdentifier() {
        return "myplugin";
    }

    @Override
    public @NotNull String getAuthor() {
        return String.join(", ", plugin.getDescription().getAuthors());
    }

    @Override
    public @NotNull String getVersion() {
        return plugin.getDescription().getVersion();
    }

    /**
     * 回傳 false 表示不需要 PlaceholderAPI 插件先載入（自訂 Expansion 通常回傳 false）。
     * 若依賴 PlaceholderAPI 的其他 API，回傳 true。
     */
    @Override
    public boolean canRegister() {
        return true;
    }

    /**
     * 回傳 false 表示 Expansion 不會隨 /papi reload 被卸載，保持持久性。
     */
    @Override
    public boolean persist() {
        return true;
    }

    // ---- Placeholder 處理 ----

    @Override
    public @Nullable String onRequest(OfflinePlayer player, @NotNull String params) {
        if (player == null) return "";

        return switch (params.toLowerCase()) {
            case "balance"   -> getBalance(player);
            case "rank"      -> getRank(player);
            case "playtime"  -> getPlaytime(player);
            case "status"    -> player.isOnline() ? "線上" : "離線";
            default          -> null; // null 表示未知的 placeholder
        };
    }

    // ---- 各 Placeholder 取值邏輯 ----

    private String getBalance(OfflinePlayer player) {
        // 從你的資料來源取得餘額
        double balance = plugin.getDatabaseManager()
            .getBalance(player.getUniqueId().toString())
            .join(); // 注意：join() 會阻塞，PAPI 建議在此同步取值

        return String.format("%.2f", balance);
    }

    private String getRank(OfflinePlayer player) {
        // 範例：從記憶體快取取得排名
        int rank = plugin.getRankManager().getRank(player.getUniqueId());
        return rank > 0 ? "#" + rank : "未排名";
    }

    private String getPlaytime(OfflinePlayer player) {
        // 取得玩家遊玩時間（Minecraft 以 ticks 計算）
        // 1 小時 = 3600 秒 = 72000 ticks
        long ticks = player.getStatistic(org.bukkit.Statistic.PLAY_ONE_MINUTE);
        long hours = ticks / 72000;
        return hours + " 小時";
    }
}
```

---

### 帶動態參數的 Placeholder（進階）

支援 `%myplugin_top_1%`、`%myplugin_top_2%` 這類帶數字參數的格式：

```java
@Override
public @Nullable String onRequest(OfflinePlayer player, @NotNull String params) {
    // 動態參數：%myplugin_top_1%, %myplugin_top_2%, ...
    if (params.startsWith("top_")) {
        String rankStr = params.substring(4);
        try {
            int rank = Integer.parseInt(rankStr);
            return plugin.getLeaderboard().getPlayerAtRank(rank);
        } catch (NumberFormatException e) {
            return "無效排名";
        }
    }

    return switch (params.toLowerCase()) {
        case "balance" -> getBalance(player);
        default        -> null;
    };
}
```

---

### 在主類中註冊

```java
@Override
public void onEnable() {
    // ...初始化其他元件...

    // 檢查並註冊 PlaceholderAPI Expansion
    if (getServer().getPluginManager().getPlugin("PlaceholderAPI") != null) {
        new MyPluginExpansion(this).register();
        getLogger().info("PlaceholderAPI 整合已啟用。");
    } else {
        getLogger().info("未偵測到 PlaceholderAPI，placeholder 功能停用。");
    }
}
```

---

## 所有可用 Placeholder 清單

使用 `/papi list` 可查看已安裝的 Expansion，使用 `/papi parse <玩家名> %myplugin_balance%` 可測試 placeholder 輸出。

| Placeholder | 說明 | 範例輸出 |
|-------------|------|----------|
| `%myplugin_balance%` | 玩家目前餘額 | `1234.56` |
| `%myplugin_rank%` | 玩家排名 | `#42` |
| `%myplugin_playtime%` | 累計遊玩時數 | `12 小時` |
| `%myplugin_status%` | 玩家線上狀態 | `線上` / `離線` |

---

## 測試方式

```bash
# 在伺服器控制台或遊戲內（需要權限）
/papi parse <玩家名稱> %myplugin_balance%
/papi parse <玩家名稱> %myplugin_rank%

# 查看所有已載入的 Expansion
/papi list

# 重新載入 Expansion（若 persist() 回傳 false）
/papi reload myplugin
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| Placeholder 顯示原始文字 `%myplugin_xxx%` | Expansion 未成功註冊 | 確認 `register()` 有被呼叫、PAPI 已安裝 |
| `onRequest()` 回傳 `null` | params 名稱不符 | 使用 `/papi parse` 確認 params 實際值 |
| 伺服器卡頓 | `join()` 阻塞主執行緒 | 改用記憶體快取（預先載入玩家資料），避免在 `onRequest` 中同步查詢 DB |
| ClassNotFoundException PlaceholderExpansion | 依賴未設定為 provided | 確認 pom.xml 中 `<scope>provided</scope>` |
| Expansion 被 `/papi reload` 卸載 | `persist()` 回傳 `true` | 設定 `persist()` 回傳 `true` 以保持持久性 |
