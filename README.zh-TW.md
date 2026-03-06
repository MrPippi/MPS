# MPS — Minecraft Plugin Studio

**專為 Spigot / Paper 插件開發設計的 AI 輔助開發工具包。**

MPS 是一個精心整理的 [Cursor Agent Skills](https://docs.cursor.com/agent/skills) 函式庫，自動化 Bukkit / Spigot / Paper 插件的常見開發任務，涵蓋從專案骨架建立到 CI/CD 部署的完整開發生命週期。

> English documentation: [README.md](README.md)

---

## 功能特色

- **骨架生成** — 產生完整 Maven 插件專案（pom.xml、plugin.yml、主類）
- **指令處理** — 產生含子指令路由與權限檢查的 `CommandExecutor` + `TabCompleter`
- **事件監聽** — 產生含 `EventPriority`、欄位存取範例的 `@EventHandler` 骨架
- **設定管理** — 產生結構化 `config.yml` + `ConfigManager` 類別
- **訊息系統** — 產生支援 MiniMessage / Legacy 格式的 `messages.yml` + `MessageManager`
- **權限系統** — 產生 `PermissionManager` + `plugin.yml` 權限節點繼承樹宣告
- **資料庫管理** — 產生 SQLite / MySQL 雙模式 `DatabaseManager`（HikariCP 連線池）
- **整合擴充** — 產生 PlaceholderAPI `Expansion` 類別；產生正確的 Spigot / Paper API 調用代碼
- **單元測試** — 產生 JUnit 5 + MockBukkit 測試套件骨架
- **自動化部署** — 產生 GitHub Actions CI/CD workflow（build → test → 自動發布 JAR）

---

## Skills 總覽

Skills 依功能類別分組，每個 Skill 均可生成即用的 Java 代碼與設定檔。

### 骨架生成（Scaffold）

| Skill | 說明 |
|-------|------|
| [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | 完整 Maven 插件專案：`pom.xml`、`plugin.yml`、主類骨架 |

### 指令與事件（Commands & Events）

| Skill | 說明 |
|-------|------|
| [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | 含子指令路由、權限節點、參數驗證的 `CommandExecutor` + `TabCompleter` |
| [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | 含 `@EventHandler`、`EventPriority`、`ignoreCancelled`、欄位存取範例的 `Listener` 骨架 |

### 設定、訊息與權限（Config, Messages & Permissions）

| Skill | 說明 |
|-------|------|
| [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | 含預設值與繁體中文註解的 `config.yml` + `ConfigManager` 類別 |
| [`generate-message-system`](Skills/generate-message-system/SKILL.md) | `messages.yml` + `MessageManager`，支援 MiniMessage / Legacy 格式與 PlaceholderAPI |
| [`generate-permission-system`](Skills/generate-permission-system/SKILL.md) | `PermissionManager` + `plugin.yml` 權限節點宣告，含繼承樹設計 |

### 資料庫（Database）

| Skill | 說明 |
|-------|------|
| [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | SQLite / MySQL 雙模式 `DatabaseManager`，使用 HikariCP 連線池，含非同步查詢與 CRUD 範例 |

### 整合擴充（Integration）

| Skill | 說明 |
|-------|------|
| [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | PlaceholderAPI `Expansion` 類別，含 placeholder 路由邏輯 |
| [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | 正確的 Spigot / Paper Java API 調用：事件、排程器、NBT、Adventure API |

### 單元測試（Testing）

| Skill | 說明 |
|-------|------|
| [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | JUnit 5 + MockBukkit 測試套件：`pom.xml` 依賴、伺服器初始化、玩家 / 事件 / 指令測試範例 |

### 自動化部署（DevOps）

| Skill | 說明 |
|-------|------|
| [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | GitHub Actions workflow：build、test，並在推送 Tag 時自動發布 JAR |

---

## 快速開始

在 Cursor Agent 對話中，直接用自然語言描述需求，Agent 會自動載入對應的 Skill：

```
建立名為 MyPlugin 的插件骨架，目標 MC 版本 1.21.4
→ 自動套用 generate-plugin-skeleton

產生監聽 PlayerJoinEvent 的 Listener 類
→ 自動套用 generate-event-listener

建立 /shop buy sell list 三個子指令
→ 自動套用 generate-command-handler

產生 config.yml，需要 economy 和 cooldown 設定
→ 自動套用 generate-config-yml

建立 MiniMessage 格式的訊息系統
→ 自動套用 generate-message-system

建立 myplugin.admin 和 myplugin.use 權限節點
→ 自動套用 generate-permission-system

寫 MockBukkit 單元測試
→ 自動套用 generate-test-suite

設定 GitHub Actions 自動發布 JAR
→ 自動套用 generate-cicd-workflow

建立支援 SQLite 和 MySQL 的 DatabaseManager
→ 自動套用 generate-database-manager

撰寫 %myplugin_balance% PlaceholderAPI 擴充
→ 自動套用 generate-placeholder-expansion
```

---

## 目錄結構

```
MPS/
├── README.md                          ← 英文說明（主文件）
├── README.zh-TW.md                    ← 繁體中文說明（本文件）
├── Skills/                            ← Skills 對外可讀文件（GitHub 瀏覽用）
│   ├── README.md
│   ├── skills-registry.yml            ← Skills 索引（含 category / inputs / outputs）
│   ├── spigot-paper-api-caller/
│   │   ├── SKILL.md
│   │   └── api-reference.md
│   ├── generate-plugin-skeleton/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-command-handler/
│   │   ├── SKILL.md
│   │   └── examples.md
│   └── ...（每個 Skill 一個目錄）
└── .cursor/
    ├── rules/
    │   └── minecraft-plugin-agent-skills.mdc   ← Agent 行為規範
    └── skills/                                 ← Cursor Agent 實際載入目錄
        ├── skills-registry.yml
        └── ...（結構同 Skills/）
```

---

## 貢獻指南

1. Fork 本專案
2. 在 `Skills/` 與 `.cursor/skills/` 同步建立新 Skill 目錄
3. 撰寫 `SKILL.md`（含 YAML frontmatter）與 `examples.md`（至少 2 個具體範例）
4. 更新 `.cursor/skills/skills-registry.yml`（填入 `category`、`inputs`、`outputs`）
5. 送出 Pull Request

詳細規範請見 [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc)。

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

## 授權

本專案採用 [LICENSE](LICENSE) 授權。
