# MPS — Minecraft Plugin Studio

**專為 Minecraft 插件開發設計的 AI 輔助開發工具包，支援 Paper、Purpur、Velocity 與 Waterfall 四大平台。**

MPS 是一個精心整理的 [Cursor Agent Skills](https://docs.cursor.com/agent/skills) 函式庫，自動化 Minecraft 插件的常見開發任務，涵蓋從專案骨架建立到 CI/CD 部署的完整開發生命週期，適用於後端伺服器與代理伺服器插件開發。

> English documentation: [README.md](README.md)

---

## 功能特色

**Paper / Spigot（後端伺服器）**
- **骨架生成** — 產生完整 Maven 插件專案（pom.xml、plugin.yml、主類）
- **指令處理** — 產生含子指令路由與權限檢查的 `CommandExecutor` + `TabCompleter`
- **事件監聽** — 產生含 `EventPriority`、欄位存取範例的 `@EventHandler` 骨架
- **設定管理** — 產生結構化 `config.yml` + `ConfigManager` 類別
- **訊息系統** — 產生支援 MiniMessage / Legacy 格式的 `messages.yml` + `MessageManager`
- **權限系統** — 產生 `PermissionManager` + `plugin.yml` 權限節點繼承樹宣告
- **資料庫管理** — 產生 SQLite / MySQL 雙模式 `DatabaseManager`（HikariCP 連線池）
- **整合擴充** — 產生 PlaceholderAPI `Expansion` 類別；產生正確的 Paper API 調用代碼；整合 Vault 經濟 API
- **單元測試** — 產生 JUnit 5 + MockBukkit 測試套件骨架
- **自動化部署** — 產生 GitHub Actions CI/CD workflow（build → test → 自動發布 JAR）

**平台特定技能**
- **Purpur** — Purpur 特有 API 代碼生成（PlayerAFKEvent、purpur.yml 設定、執行平台守衛）
- **Velocity** — Velocity 代理插件骨架、`@Subscribe` 事件監聽器、PluginMessageEvent 處理器
- **Waterfall** — Waterfall/BungeeCord 代理插件骨架、BungeeCord 頻道處理器

---

## Skills 總覽

### Paper / Spigot Skills

| Skill | 類別 | 說明 |
|-------|------|------|
| [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | scaffold | 完整 Maven 插件專案：`pom.xml`、`plugin.yml`、主類骨架 |
| [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | command | 含子指令路由、權限節點、參數驗證的 `CommandExecutor` + `TabCompleter` |
| [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | event | 含 `@EventHandler`、`EventPriority`、`ignoreCancelled`、欄位存取範例的 `Listener` 骨架 |
| [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | config | 含預設值與繁體中文註解的 `config.yml` + `ConfigManager` 類別 |
| [`generate-message-system`](Skills/generate-message-system/SKILL.md) | config | `messages.yml` + `MessageManager`，支援 MiniMessage / Legacy 格式與 PlaceholderAPI |
| [`generate-permission-system`](Skills/generate-permission-system/SKILL.md) | permission | `PermissionManager` + `plugin.yml` 權限節點宣告，含繼承樹設計 |
| [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | database | SQLite / MySQL 雙模式 `DatabaseManager`，使用 HikariCP 連線池，含非同步查詢與 CRUD 範例 |
| [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | integration | PlaceholderAPI `Expansion` 類別，含 placeholder 路由邏輯 |
| [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | integration | 正確的 Paper Java API 調用：事件、排程器、NBT、Adventure API |
| [`integrate-vault`](Skills/integrate-vault/SKILL.md) | integration | Vault 經濟 API 整合：`EconomyManager`、存款扣款、餘額查詢 |
| [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | testing | JUnit 5 + MockBukkit 測試套件：`pom.xml` 依賴、伺服器初始化、玩家 / 事件 / 指令測試範例 |
| [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | devops | GitHub Actions workflow：build、test，並在推送 Tag 時自動發布 JAR |

### 平台特定 Skills

| Skill | 平台 | 類別 | 說明 |
|-------|------|------|------|
| [`purpur-api-caller`](Skills/purpur/purpur-api-caller/SKILL.md) | Purpur | integration | Purpur 特有 API 代碼：`PlayerAFKEvent`、`purpur.yml`、執行平台守衛 |
| [`generate-velocity-plugin-skeleton`](Skills/velocity/generate-velocity-plugin-skeleton/SKILL.md) | Velocity | scaffold | Velocity 代理插件 Gradle 骨架：`@Plugin`、Guice 注入、`velocity-plugin.json` |
| [`generate-proxy-event-listener`](Skills/velocity/generate-proxy-event-listener/SKILL.md) | Velocity | event | `@Subscribe` 事件監聽器：`LoginEvent`、`ServerConnectedEvent`、`PlayerChooseInitialServerEvent` |
| [`generate-plugin-message-handler`](Skills/velocity/generate-plugin-message-handler/SKILL.md) | Velocity | integration | `PluginMessageEvent` 處理器：`MinecraftChannelIdentifier`、`ByteStreams`、proxy 向後端傳訊 |
| [`generate-waterfall-plugin-skeleton`](Skills/waterfall/generate-waterfall-plugin-skeleton/SKILL.md) | Waterfall | scaffold | Waterfall/BungeeCord 代理插件 Gradle 骨架：繼承 `Plugin`、`plugin.yml` |
| [`generate-bungeecord-channel`](Skills/waterfall/generate-bungeecord-channel/SKILL.md) | Waterfall | integration | BungeeCord 頻道處理器：自訂頻道、內建 sub-channel、`ByteStreams` 序列化 |

---

## 快速開始

在 Cursor Agent 對話中，直接用自然語言描述需求，Agent 會自動載入對應的 Skill：

```
建立名為 MyPlugin 的插件骨架，目標 MC 版本 1.21
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

整合 Vault 經濟 API
→ 自動套用 integrate-vault

建立 Velocity proxy 插件
→ 自動套用 generate-velocity-plugin-skeleton

監聽 Velocity 的 LoginEvent 和 ServerConnectedEvent
→ 自動套用 generate-proxy-event-listener

處理 Velocity 與後端伺服器的 plugin messaging
→ 自動套用 generate-plugin-message-handler

建立 Waterfall/BungeeCord 代理插件
→ 自動套用 generate-waterfall-plugin-skeleton

設定 BungeeCord plugin messaging 頻道
→ 自動套用 generate-bungeecord-channel
```

---

## 目錄結構

```
MPS/
├── README.md                            ← 英文說明（主文件）
├── README.zh-TW.md                      ← 繁體中文說明（本文件）
├── Skills/                              ← Skill 定義（18 個技能，canonical source）
│   ├── README.md
│   ├── skills-registry.yml              ← Skills 索引（含 category / inputs / outputs）
│   ├── _shared/                         ← 跨平台共用模式
│   │   ├── async-patterns.md
│   │   └── cross-server-messaging.md
│   ├── paper/PLATFORM.md                ← Paper 構建設定與 API 參考
│   ├── purpur/
│   │   ├── PLATFORM.md                  ← Purpur 構建設定與 API 參考
│   │   └── purpur-api-caller/SKILL.md
│   ├── velocity/
│   │   ├── PLATFORM.md                  ← Velocity 構建設定與 API 參考
│   │   ├── generate-velocity-plugin-skeleton/SKILL.md
│   │   ├── generate-proxy-event-listener/SKILL.md
│   │   └── generate-plugin-message-handler/SKILL.md
│   ├── waterfall/
│   │   ├── PLATFORM.md                  ← Waterfall 構建設定與 API 參考
│   │   ├── generate-waterfall-plugin-skeleton/SKILL.md
│   │   └── generate-bungeecord-channel/SKILL.md
│   └── [12 個舊版 flat 技能]             ← Paper/Spigot 技能（flat 路徑）
├── docs/                                ← 補充 API 參考文件（唯讀）
│   ├── CONVENTIONS.md
│   ├── paper/
│   ├── purpur/
│   ├── velocity/
│   └── waterfall/
├── .cursor/
│   ├── rules/
│   │   └── minecraft-plugin-agent-skills.mdc   ← Agent 行為規範
│   └── skills/                                 ← Cursor Agent 實際載入目錄（19 個技能）
│       └── skills-registry.yml
└── web/                                 ← Next.js 文件網站
```

---

## 貢獻指南

1. Fork 本專案
2. 在 `Skills/<platform>/<slug>/` 與 `.cursor/skills/<platform>/<slug>/` 同步建立新 Skill 目錄
3. 撰寫 `SKILL.md`（含 YAML frontmatter `name` 與 `description`）與 `examples.md`（至少 2 個具體範例）
4. 在 `Skills/skills-registry.yml` 與 `.cursor/skills/skills-registry.yml` 新增條目（`status: active`）
5. 送出 Pull Request

詳細規範請見 [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc)。

---

## 授權

本專案採用 [LICENSE](LICENSE) 授權。
