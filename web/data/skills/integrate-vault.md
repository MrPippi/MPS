---
id: integrate-vault
title: Integrate Vault Economy API
titleZh: Vault 經濟整合器
description: Integrate the Vault economy API into your Bukkit/Paper plugin, generating an EconomyManager class with balance queries, deposits, withdrawals, and soft-depend fallback handling.
descriptionZh: 為 Bukkit/Paper 插件整合 Vault 經濟 API，產生 EconomyManager 類別，含餘額查詢、存款、扣款與軟依賴降級處理。
version: "1.0.0"
status: active
category: integrations
categoryLabel: 整合
categoryLabelEn: Integrations
tags: [vault, economy, bukkit, paper, integration]
triggerKeywords:
  - "Vault 整合"
  - "經濟插件"
  - "EconomyManager"
  - "Vault API"
  - "存款扣款"
  - "幫我整合 Vault"
  - "Vault Economy"
  - "餘額查詢"
updatedAt: "2026-03-06"
githubPath: Skills/integrate-vault/SKILL.md
featured: false
---

# Integrate Vault Economy API Skill

## 目標

為 Bukkit/Paper 插件正確接入 Vault 經濟 API，產生 `EconomyManager` 類別，封裝常用的餘額查詢、存款、扣款操作，並處理 Vault 未安裝時的降級或停用邏輯。

---

## 使用流程

1. **確認基本資訊**：插件名稱、套件名、Vault 是 `depend`（必裝）還是 `softdepend`（選裝）
2. **更新 pom.xml**：加入 Vault API 依賴（`provided` scope）
3. **更新 plugin.yml**：宣告 `depend` 或 `softdepend`
4. **產生 EconomyManager.java**：含初始化、餘額查詢、存款、扣款

---

## pom.xml 依賴

```xml
<repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
</repository>

<dependency>
    <groupId>com.github.MilkBowl</groupId>
    <artifactId>VaultAPI</artifactId>
    <version>1.7.1</version>
    <scope>provided</scope>
</dependency>
```

---

## EconomyManager 核心骨架

```java
public class EconomyManager {

    private Economy economy;

    public boolean setupEconomy(Plugin plugin) {
        if (plugin.getServer().getPluginManager().getPlugin("Vault") == null) return false;
        RegisteredServiceProvider<Economy> rsp =
            plugin.getServer().getServicesManager().getRegistration(Economy.class);
        if (rsp == null) return false;
        economy = rsp.getProvider();
        return true;
    }

    public double getBalance(OfflinePlayer player) { return economy.getBalance(player); }
    public boolean has(OfflinePlayer player, double amount) { return economy.has(player, amount); }
    public EconomyResponse deposit(OfflinePlayer player, double amount) { return economy.depositPlayer(player, amount); }
    public EconomyResponse withdraw(OfflinePlayer player, double amount) { return economy.withdrawPlayer(player, amount); }
    public boolean isAvailable() { return economy != null; }
}
```

---

## 支援功能

- Vault Economy API 整合（`setupEconomy()` 初始化）
- 餘額查詢（`getBalance`）與餘額判斷（`has`）
- 存款（`depositPlayer`）與扣款（`withdrawPlayer`）
- 軟依賴模式（Vault 未安裝時降級，不停用插件）
- `EconomyResponse` 交易結果處理
