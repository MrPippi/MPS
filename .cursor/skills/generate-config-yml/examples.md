# examples — generate-config-yml

## 範例 1：經濟插件設定檔

**Input:**
```
plugin_name: EconomyPlugin
config_sections:
  - economy (起始金額、貨幣名稱)
  - cooldown (轉帳冷卻秒數)
  - database (SQLite/MySQL 切換)
```

**Output — config.yml:**
```yaml
# EconomyPlugin 設定檔
# 修改後請使用 /economyplugin reload 重新載入

# ── 經濟設定 ──────────────────────────────────────────────
economy:
  # 新玩家初始金額
  starting-balance: 1000.0
  # 貨幣單位名稱（單數）
  currency-name: "元"
  # 貨幣單位名稱（複數，英文伺服器使用）
  currency-name-plural: "元"
  # 最大持有上限（-1 = 無限制）
  max-balance: -1

# ── 冷卻設定 ──────────────────────────────────────────────
cooldown:
  # 轉帳指令冷卻時間（秒）
  transfer: 30
  # 領取每日獎勵冷卻時間（秒）
  daily-reward: 86400

# ── 資料庫設定 ────────────────────────────────────────────
database:
  # 資料庫類型：sqlite 或 mysql
  type: sqlite
  mysql:
    host: "localhost"
    port: 3306
    database: "economyplugin"
    username: "root"
    password: "password"
    # 連線池大小
    pool-size: 10
```

**Output — ConfigManager.java（節錄）:**
```java
public class ConfigManager {
    private final JavaPlugin plugin;

    public ConfigManager(JavaPlugin plugin) {
        this.plugin = plugin;
        plugin.saveDefaultConfig();
    }

    public double getStartingBalance() {
        return plugin.getConfig().getDouble("economy.starting-balance", 1000.0);
    }

    public String getCurrencyName() {
        return plugin.getConfig().getString("economy.currency-name", "元");
    }

    public int getTransferCooldown() {
        return plugin.getConfig().getInt("cooldown.transfer", 30);
    }

    public String getDatabaseType() {
        return plugin.getConfig().getString("database.type", "sqlite");
    }

    public void reload() {
        plugin.reloadConfig();
    }
}
```

---

## 範例 2：傳送點插件設定檔

**Input:**
```
plugin_name: WarpPlugin
config_sections:
  - general (訊息前綴、語言)
  - limits (每人最多傳送點數量)
  - teleport (傳送延遲、取消移動)
```

**Output — config.yml:**
```yaml
# WarpPlugin 設定檔

general:
  # 訊息前綴（支援 & 色碼）
  prefix: "&8[&bWarp&8] &r"
  # 語言（目前支援：zh-TW、en-US）
  language: "zh-TW"

limits:
  # 一般玩家最多可設定的傳送點數量
  default: 3
  # VIP 玩家最多傳送點數量（需有 warpplugin.vip 權限）
  vip: 10
  # 管理員不受限制

teleport:
  # 傳送前的倒數秒數（0 = 立即傳送）
  delay: 3
  # 傳送倒數期間移動是否取消傳送
  cancel-on-move: true
  # 傳送倒數期間受傷是否取消傳送
  cancel-on-damage: true
```
