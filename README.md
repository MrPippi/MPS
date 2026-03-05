# MPS — Minecraft Plugin Studio

**AI-powered development toolkit for Spigot / Paper plugins.**

MPS provides a collection of Cursor Agent Skills that help developers
generate high-quality Minecraft plugin code automatically.

---

## Features

- Plugin skeleton generation (Maven, pom.xml, plugin.yml)
- Command handler generation (CommandExecutor + TabCompleter)
- Event listener generation (@EventHandler, EventPriority)
- Config system generation (config.yml + ConfigManager)
- Message system generation (messages.yml + MessageManager, MiniMessage)
- Permission system generation (PermissionManager, plugin.yml nodes)
- Database manager generation (SQLite / MySQL + HikariCP)
- PlaceholderAPI integration (Expansion class, placeholder routing)
- JUnit 5 + MockBukkit test suite generation
- GitHub Actions CI/CD workflow generation (build → test → release)

---

## Architecture

MPS uses Cursor Agent Skills to automate common development tasks.
Skills are organized into modules:

| Module | Skills |
|--------|--------|
| Scaffold | `generate-plugin-skeleton` |
| Commands | `generate-command-handler` |
| Events | `generate-event-listener` |
| Config | `generate-config-yml`, `generate-message-system` |
| Permission | `generate-permission-system` |
| Database | `generate-database-manager` |
| Integration | `generate-placeholder-expansion`, `spigot-paper-api-caller` |
| Testing | `generate-test-suite` |
| DevOps | `generate-cicd-workflow` |

---

## Skills 總覽

| # | Skill ID | 功能說明 | 類別 | 狀態 |
|---|----------|----------|------|------|
| 01 | [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | 產生正確的 Spigot/Paper Java API 調用代碼 | integration | ✅ |
| 02 | [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | 產生完整 Maven 插件骨架（pom.xml、plugin.yml、主類） | scaffold | ✅ |
| 03 | [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | 依功能清單產生結構化 config.yml + ConfigManager | config | ✅ |
| 04 | [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | 產生 CommandExecutor + TabCompleter 處理類 | command | ✅ |
| 05 | [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | 產生 Event Listener 骨架 | event | ✅ |
| 06 | [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | 產生 JUnit5 + MockBukkit 測試套件 | testing | ✅ |
| 07 | [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | 產生 GitHub Actions CI/CD workflow | devops | ✅ |
| 08 | [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | 產生 SQLite/MySQL + HikariCP DatabaseManager 類 | database | ✅ |
| 09 | [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | 產生 PlaceholderAPI Expansion 類 | integration | ✅ |
| 10 | [`generate-permission-system`](Skills/generate-permission-system/SKILL.md) | 產生 PermissionManager + plugin.yml 權限節點宣告 | permission | ✅ |
| 11 | [`generate-message-system`](Skills/generate-message-system/SKILL.md) | 產生 messages.yml + MessageManager（MiniMessage 支援） | config | ✅ |

完整 Skills 文件見 [`Skills/`](Skills/) 目錄。

---

## Quick Start

在 Cursor Agent 對話中，直接以自然語言描述需求，Agent 會自動載入對應的 Skill：

```
幫我建立一個名為 MyPlugin 的插件骨架，目標 MC 版本 1.21.4
→ 自動套用 generate-plugin-skeleton

幫我產生監聽 PlayerJoinEvent 的 Listener 類
→ 自動套用 generate-event-listener

幫我建立 /shop buy sell list 三個子指令
→ 自動套用 generate-command-handler

幫我產生 config.yml，需要 economy 和 cooldown 設定
→ 自動套用 generate-config-yml

幫我建立訊息系統，用 MiniMessage 格式
→ 自動套用 generate-message-system

幫我建立權限節點 myplugin.admin 和 myplugin.use
→ 自動套用 generate-permission-system

幫我寫 MockBukkit 測試
→ 自動套用 generate-test-suite

幫我建立 GitHub Actions 自動發布 JAR
→ 自動套用 generate-cicd-workflow

幫我建立支援 SQLite 和 MySQL 的 DatabaseManager
→ 自動套用 generate-database-manager

幫我寫 PlaceholderAPI 的 %myplugin_balance% placeholder
→ 自動套用 generate-placeholder-expansion
```

---

## 目錄結構

```
MPS/
├── README.md                          ← 本文件
├── Skills/                            ← Skills 對外可讀文件（GitHub 瀏覽用）
│   ├── README.md
│   ├── skills-registry.yml
│   ├── spigot-paper-api-caller/
│   │   ├── SKILL.md
│   │   └── api-reference.md
│   ├── generate-plugin-skeleton/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-config-yml/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-command-handler/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-event-listener/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-test-suite/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-cicd-workflow/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-database-manager/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-placeholder-expansion/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-permission-system/
│   │   ├── SKILL.md
│   │   └── examples.md
│   └── generate-message-system/
│       ├── SKILL.md
│       └── examples.md
└── .cursor/
    ├── rules/
    │   └── minecraft-plugin-agent-skills.mdc   ← Cursor Agent 規格指引
    └── skills/                                 ← Cursor Agent 實際載入目錄
        ├── skills-registry.yml
        └── [各 Skill 目錄，結構同 Skills/]
```

---

## 開發里程碑

| 里程碑 | 內容 | 狀態 |
|--------|------|------|
| M1 MVP | Skill 01–04 完成，Registry 建立 | ✅ 完成 |
| M2 擴充 | Skill 05–07，單元測試自動化 | ✅ 完成 |
| M3 完整 | Skill 08–09，整合測試（javac 驗證） | ✅ 完成 |
| M4 強化 | Skill 10–11（Permission / Message），examples.md，Registry schema v3 | ✅ 完成 |
| M5 維護 | Folia 支援、Skill 市集、多語言 prompt | 🔲 規劃中 |

---

## 貢獻指南

1. Fork 本專案
2. 在 `Skills/` 與 `.cursor/skills/` 同步建立新 Skill 目錄
3. 撰寫 `SKILL.md`（含 YAML frontmatter）及 `examples.md`
4. 更新 `.cursor/skills/skills-registry.yml`（含 category、inputs、outputs）
5. 送出 Pull Request

詳細規範見 [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc)。

---

## 授權

本專案採用 [LICENSE](LICENSE) 授權。
