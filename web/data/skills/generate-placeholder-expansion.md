---
id: generate-placeholder-expansion
title: Generate PlaceholderAPI Expansion
titleZh: PlaceholderAPI 擴充生成器
description: Generate a PlaceholderAPI Expansion class with handling logic for a provided list of placeholders.
descriptionZh: 產生 PlaceholderAPI Expansion 類，依輸入的 placeholder 清單產生對應處理邏輯。
version: "1.0.0"
status: active
category: integrations
categoryLabel: 整合擴充
categoryLabelEn: Integrations
tags: [placeholderapi, papi, expansion, integration]
triggerKeywords:
  - "PlaceholderAPI"
  - "PAPI"
  - "placeholder"
  - "變數擴充"
updatedAt: "2026-03-05"
githubPath: Skills/generate-placeholder-expansion/SKILL.md
featured: false
---

# Generate PlaceholderAPI Expansion Skill

> **狀態：規劃中** — 此 Skill 尚未完成，內容為預覽草稿。

## 目標

依使用者提供的 placeholder 名稱清單，產生完整的 `PlaceholderExpansion` 繼承類別，包含每個 placeholder 的處理邏輯骨架。

---

## 依賴設定

```xml
<repositories>
    <repository>
        <id>placeholderapi</id>
        <url>https://repo.extendedclip.com/content/repositories/placeholderapi/</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>me.clip</groupId>
        <artifactId>placeholderapi</artifactId>
        <version>2.11.6</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

---

## 預計產生的代碼結構

```java
public class MyExpansion extends PlaceholderExpansion {

    @Override
    public String getIdentifier() {
        return "myplugin";
    }

    @Override
    public String getAuthor() {
        return "YourName";
    }

    @Override
    public String getVersion() {
        return "1.0.0";
    }

    @Override
    public String onPlaceholderRequest(Player player, String identifier) {
        if (identifier.equals("player_score")) {
            // 回傳玩家分數
            return String.valueOf(0);
        }
        return null;
    }
}
```
