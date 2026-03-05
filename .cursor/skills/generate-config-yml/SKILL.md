---
name: generate-config-yml
description: 依使用者提供的功能清單，產生結構完整、含預設值與繁體中文註解的 config.yml，並同步產生對應的 Java ConfigManager 類別。當使用者說「幫我產生 config.yml」、「設定檔怎麼寫」、「ConfigManager」、「讀取配置」時自動應用。
---

# Generate Config YML Skill

## 目標

依使用者描述的插件功能，產生一份結構清晰、有完整預設值與繁體中文說明的 `config.yml`，並同步輸出對應的 Java `ConfigManager` 類別，提供型別安全的設定存取介面。

---

## 使用流程

1. **詢問功能清單**：使用者列出需要的設定項目（若未說明則依通用模板輸出）
2. **產生 config.yml**：含所有設定項目、預設值、繁體中文行內說明
3. **產生 ConfigManager.java**：封裝 `FileConfiguration` 存取，提供 getter 方法
4. **說明熱重載寫法**（可選）

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_name` | `MyPlugin` | 用於 ConfigManager 類別命名 |
| `features` | `economy, cooldown, messages` | 功能分類清單 |
| `package` | `com.example.myplugin.managers` | ConfigManager 放置的套件 |

---

## 代碼範本

### config.yml（通用模板）

```yaml
# =============================================
# MyPlugin 配置檔案
# 版本：1.0.0
# 修改後請使用 /myplugin reload 重新載入
# =============================================

# ---- 基本設定 ----
general:
  # 是否啟用除錯模式（輸出詳細 log）
  debug: false
  # 插件語言（目前支援 zh-tw、en）
  language: zh-tw
  # 資料儲存方式：sqlite 或 mysql
  storage-type: sqlite

# ---- 經濟系統 ----
economy:
  # 是否啟用經濟功能
  enabled: true
  # 新玩家初始金額
  starting-balance: 1000.0
  # 最大持有金額（-1 表示無限制）
  max-balance: 1000000.0
  # 貨幣符號（顯示用）
  currency-symbol: "$"
  # 貨幣名稱
  currency-name: "金幣"

# ---- 冷卻時間設定 ----
cooldown:
  # 指令冷卻時間（秒），-1 表示停用
  command-cooldown: 30
  # 是否告知玩家剩餘冷卻時間
  show-remaining: true

# ---- 訊息設定 ----
messages:
  # 前綴（支援 MiniMessage 格式）
  prefix: "<gradient:#FF6B35:#FFD700>[MyPlugin]</gradient> "
  no-permission: "<red>你沒有權限執行此操作。</red>"
  player-only: "<red>此指令僅限玩家使用。</red>"
  reload-success: "<green>配置已重新載入。</green>"

# ---- 資料庫設定（storage-type: mysql 時生效）----
database:
  host: localhost
  port: 3306
  name: myplugin
  username: root
  password: ""
  # 連線池大小
  pool-size: 10
  # 連線逾時（毫秒）
  connection-timeout: 30000
```

---

### ConfigManager.java

```java
package com.example.myplugin.managers;

import com.example.myplugin.MyPlugin;
import org.bukkit.configuration.file.FileConfiguration;

public class ConfigManager {

    private final MyPlugin plugin;
    private FileConfiguration config;

    public ConfigManager(MyPlugin plugin) {
        this.plugin = plugin;
        reload();
    }

    public void reload() {
        plugin.reloadConfig();
        config = plugin.getConfig();
    }

    // ---- General ----

    public boolean isDebug() {
        return config.getBoolean("general.debug", false);
    }

    public String getLanguage() {
        return config.getString("general.language", "zh-tw");
    }

    public String getStorageType() {
        return config.getString("general.storage-type", "sqlite");
    }

    // ---- Economy ----

    public boolean isEconomyEnabled() {
        return config.getBoolean("economy.enabled", true);
    }

    public double getStartingBalance() {
        return config.getDouble("economy.starting-balance", 1000.0);
    }

    public double getMaxBalance() {
        return config.getDouble("economy.max-balance", -1.0);
    }

    public String getCurrencySymbol() {
        return config.getString("economy.currency-symbol", "$");
    }

    public String getCurrencyName() {
        return config.getString("economy.currency-name", "金幣");
    }

    // ---- Cooldown ----

    public int getCommandCooldown() {
        return config.getInt("cooldown.command-cooldown", 30);
    }

    public boolean isShowRemaining() {
        return config.getBoolean("cooldown.show-remaining", true);
    }

    // ---- Messages ----

    public String getPrefix() {
        return config.getString("messages.prefix", "[MyPlugin] ");
    }

    public String getNoPermissionMessage() {
        return config.getString("messages.no-permission", "<red>你沒有權限。</red>");
    }

    public String getPlayerOnlyMessage() {
        return config.getString("messages.player-only", "<red>此指令僅限玩家使用。</red>");
    }

    public String getReloadSuccessMessage() {
        return config.getString("messages.reload-success", "<green>配置已重新載入。</green>");
    }

    // ---- Database ----

    public String getDbHost() {
        return config.getString("database.host", "localhost");
    }

    public int getDbPort() {
        return config.getInt("database.port", 3306);
    }

    public String getDbName() {
        return config.getString("database.name", "myplugin");
    }

    public String getDbUsername() {
        return config.getString("database.username", "root");
    }

    public String getDbPassword() {
        return config.getString("database.password", "");
    }

    public int getPoolSize() {
        return config.getInt("database.pool-size", 10);
    }

    public long getConnectionTimeout() {
        return config.getLong("database.connection-timeout", 30000L);
    }
}
```

---

### 在主類中初始化

```java
@Override
public void onEnable() {
    saveDefaultConfig();
    configManager = new ConfigManager(this);
}
```

---

### 熱重載指令實作範例

```java
case "reload" -> {
    if (!player.hasPermission("myplugin.admin")) {
        player.sendMessage(configManager.getNoPermissionMessage());
        yield true;
    }
    plugin.getConfigManager().reload();
    player.sendMessage(configManager.getReloadSuccessMessage());
    yield true;
}
```

---

## 設計規範

1. **分區命名**：用 `general`、`economy`、`messages` 等頂層 key 分類，避免扁平化
2. **預設值**：所有 getter 必須提供合理的 fallback 預設值
3. **繁體中文行內說明**：每個設定項目前加上 `#` 說明用途
4. **版本標記**：頂部標記版本號，方便未來遷移
5. **MiniMessage 格式**：訊息類設定使用 MiniMessage（`<red>`、`<green>`），避免舊版 ChatColor

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `saveDefaultConfig()` 覆蓋玩家修改 | 每次啟動重設 | 只在檔案不存在時呼叫（`saveDefaultConfig()` 本身已有此邏輯） |
| 修改 config.yml 不生效 | 未呼叫 `reloadConfig()` | 在 reload 指令中呼叫 `plugin.reloadConfig()` |
| `getString()` 回傳 `null` | 鍵名打錯 | 永遠在 getter 中提供第二參數（預設值） |
| YAML 縮排錯誤 | 混用 Tab 與空格 | 強制使用 2 個空格縮排 |
