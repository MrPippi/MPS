---
name: integrate-vault
description: 為 Bukkit/Paper 插件整合 Vault 經濟 API，產生 EconomyManager 類別、pom.xml 依賴設定、plugin.yml 宣告，含存款、扣款、查詢餘額、軟依賴降級處理。當使用者說「Vault 整合」、「經濟插件」、「EconomyManager」、「Vault API」、「存款扣款」、「幫我整合 Vault」時自動應用。
---

# Integrate Vault Skill

## 目標

為 Bukkit/Paper 插件正確接入 Vault 經濟 API，產生 `EconomyManager` 類別，封裝常用的餘額查詢、存款、扣款操作，並處理 Vault 未安裝時的降級或停用邏輯。

---

## 使用流程

1. **確認基本資訊**：插件名稱、套件名、Vault 是 `depend`（必裝）還是 `softdepend`（選裝）
2. **更新 pom.xml**：加入 Vault API 依賴（`provided` scope）
3. **更新 plugin.yml**：宣告 `depend` 或 `softdepend`
4. **產生 EconomyManager.java**：含初始化、存取餘額、存款、扣款、關閉

---

## pom.xml 依賴

```xml
<!-- Vault API（不需打包進 JAR，伺服器端提供） -->
<dependency>
    <groupId>com.github.MilkBowl</groupId>
    <artifactId>VaultAPI</artifactId>
    <version>1.7.1</version>
    <scope>provided</scope>
</dependency>
```

需在 `pom.xml` 的 `<repositories>` 加入 JitPack：

```xml
<repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
</repository>
```

---

## plugin.yml 宣告

**必裝模式（depend）：**

```yaml
depend: [Vault]
```

**選裝模式（softdepend）：**

```yaml
softdepend: [Vault]
```

---

## 代碼範本

### EconomyManager.java

```java
package com.example.myplugin.managers;

import com.example.myplugin.MyPlugin;
import net.milkbowl.vault.economy.Economy;
import net.milkbowl.vault.economy.EconomyResponse;
import org.bukkit.OfflinePlayer;
import org.bukkit.plugin.RegisteredServiceProvider;

public class EconomyManager {

    private final MyPlugin plugin;
    private Economy economy;

    public EconomyManager(MyPlugin plugin) {
        this.plugin = plugin;
    }

    // ---- 初始化 ----

    /**
     * 嘗試取得 Vault Economy 服務。
     * @return true 若成功取得，false 若 Vault 未安裝或無經濟插件
     */
    public boolean setupEconomy() {
        if (plugin.getServer().getPluginManager().getPlugin("Vault") == null) {
            plugin.getLogger().warning("找不到 Vault 插件，經濟功能停用。");
            return false;
        }

        RegisteredServiceProvider<Economy> rsp =
            plugin.getServer().getServicesManager().getRegistration(Economy.class);

        if (rsp == null) {
            plugin.getLogger().warning("Vault 找不到任何經濟插件（如 EssentialsX、CMI），經濟功能停用。");
            return false;
        }

        economy = rsp.getProvider();
        plugin.getLogger().info("Vault 經濟整合成功：" + economy.getName());
        return true;
    }

    // ---- 狀態查詢 ----

    /** 是否已成功連接到 Vault 經濟服務 */
    public boolean isAvailable() {
        return economy != null;
    }

    // ---- 餘額查詢 ----

    public double getBalance(OfflinePlayer player) {
        ensureAvailable();
        return economy.getBalance(player);
    }

    public boolean has(OfflinePlayer player, double amount) {
        ensureAvailable();
        return economy.has(player, amount);
    }

    // ---- 存款 ----

    /**
     * 存入金額至玩家帳戶。
     * @return EconomyResponse（含 type、errorMessage）
     */
    public EconomyResponse deposit(OfflinePlayer player, double amount) {
        ensureAvailable();
        return economy.depositPlayer(player, amount);
    }

    // ---- 扣款 ----

    /**
     * 從玩家帳戶扣除金額。
     * @return EconomyResponse（含 type、errorMessage）
     */
    public EconomyResponse withdraw(OfflinePlayer player, double amount) {
        ensureAvailable();
        return economy.withdrawPlayer(player, amount);
    }

    // ---- 輔助 ----

    private void ensureAvailable() {
        if (economy == null) {
            throw new IllegalStateException("Vault Economy 服務未初始化，請先呼叫 setupEconomy()");
        }
    }

    /** 在 onDisable 中呼叫，清除參照 */
    public void shutdown() {
        economy = null;
    }
}
```

---

### 在主類中初始化與關閉

```java
private EconomyManager economyManager;

@Override
public void onEnable() {
    economyManager = new EconomyManager(this);

    if (!economyManager.setupEconomy()) {
        // 必裝模式：初始化失敗則停用插件
        getLogger().severe("Vault 經濟初始化失敗，插件停用。");
        getServer().getPluginManager().disablePlugin(this);
        return;
    }
}

@Override
public void onDisable() {
    if (economyManager != null) {
        economyManager.shutdown();
    }
}

public EconomyManager getEconomyManager() {
    return economyManager;
}
```

---

### EconomyResponse 處理範例

```java
EconomyResponse resp = plugin.getEconomyManager().withdraw(player, 100.0);

if (resp.transactionSuccess()) {
    player.sendMessage("已扣除 100 金幣，剩餘：" + resp.balance);
} else {
    player.sendMessage("扣款失敗：" + resp.errorMessage);
}
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `NullPointerException` 於 `economy.xxx()` | `setupEconomy()` 未被呼叫或回傳 false | 在 `onEnable` 確認初始化成功才繼續 |
| `ClassNotFoundException: net.milkbowl.vault.economy.Economy` | pom.xml 中 VaultAPI 依賴設定錯誤或未加入 JitPack repo | 確認 repository 與 dependency 均已設定 |
| Vault 已安裝但 `rsp == null` | 伺服器上沒有任何實作 Economy 的插件（如 EssentialsX） | 安裝一個經濟插件作為 Vault 後端 |
| 在非同步執行緒呼叫 Vault API | Vault Economy API 為同步 API，不保證執行緒安全 | 透過 `Bukkit.getScheduler().runTask()` 切回主執行緒再呼叫 |
| `plugin.yml` 缺少 `depend: [Vault]` | Vault 可能比插件晚載入，導致 `getPlugin("Vault")` 回傳 null | 在 `plugin.yml` 加入 `depend` 或 `softdepend` |

---

## 更多範例

詳見 [examples.md](examples.md)
