---
id: generate-config-yml
title: Generate Config YAML
titleZh: 配置檔生成器
description: Generate a structured config.yml with default values and Traditional Chinese comments based on a feature list.
descriptionZh: 依功能清單產生結構完整的 config.yml，含預設值與繁體中文註解。
version: "1.0.0"
status: active
category: configuration
categoryLabel: 配置管理
categoryLabelEn: Configuration
tags: [config, yaml, bukkit, configuration]
triggerKeywords:
  - "config.yml"
  - "產生配置"
  - "配置檔"
updatedAt: "2026-03-05"
githubPath: Skills/generate-config-yml/SKILL.md
featured: false
---

# Generate Config YAML Skill


## 目標

依使用者提供的功能清單，自動產生結構完整的 `config.yml`，包含預設值、繁體中文註解與型別提示。

---

## 預計功能

- 自動根據功能描述推斷合理的設定欄位
- 產生 YAML 階層結構（messages、settings、database 等區塊）
- 每個欄位附繁體中文說明註解
- 搭配 Java 讀取代碼片段
