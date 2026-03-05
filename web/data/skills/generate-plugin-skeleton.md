---
id: generate-plugin-skeleton
title: Generate Plugin Skeleton
titleZh: 插件骨架生成器
description: Generate a complete Maven-based Bukkit/Paper plugin project scaffold including pom.xml, plugin.yml, and main class.
descriptionZh: 依輸入參數產生完整的 Bukkit/Paper 插件 Maven 專案骨架，包含 pom.xml、plugin.yml 與主類。
version: "1.0.0"
status: active
category: scaffolding
categoryLabel: 骨架生成
categoryLabelEn: Scaffolding
tags: [scaffold, maven, bukkit, paper, plugin-yml, pom]
triggerKeywords:
  - "新建插件"
  - "plugin skeleton"
  - "插件骨架"
  - "建立專案"
updatedAt: "2026-03-05"
githubPath: Skills/generate-plugin-skeleton/SKILL.md
featured: false
---

# Generate Plugin Skeleton Skill

> **狀態：規劃中** — 此 Skill 尚未完成，內容為預覽草稿。

## 目標

依使用者提供的插件名稱、目標 MC 版本與功能清單，自動產生完整的 Maven 插件專案骨架。

---

## 預計產生的檔案

```
MyPlugin/
├── pom.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/myplugin/
│       │       └── MyPlugin.java
│       └── resources/
│           ├── plugin.yml
│           └── config.yml
└── .gitignore
```

---

## 輸入參數

| 參數 | 範例 | 說明 |
|------|------|------|
| 插件名稱 | `MyPlugin` | Java 類別名稱 |
| Group ID | `com.example` | Maven Group ID |
| 目標版本 | `1.20.4` | 最低支援 MC 版本 |
| API 類型 | `paper` / `spigot` | 目標伺服器類型 |

---

## 產生內容預覽

此 Skill 完成後將自動產生：

- `pom.xml`：含 PaperMC / SpigotMC repository 與正確 API dependency
- `plugin.yml`：含 name、version、main、api-version
- 主類骨架：繼承 `JavaPlugin`，包含 `onEnable()` / `onDisable()`
- `config.yml`：基礎設定結構
