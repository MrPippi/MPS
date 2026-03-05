# MPS — Minecraft Plugin Skills

**MPS**（Minecraft Plugin Skills）是一個專為 Minecraft Java Edition 插件開發設計的 **Cursor Agent Skills 函式庫**，提供可復用的 AI 輔助開發技能，協助開發者自動化 Bukkit/Spigot/Paper 插件的常見開發任務。

---

## 專案目標

- 建立高品質、可立即使用的 Cursor Agent Skills
- 涵蓋插件開發全生命週期：骨架生成 → API 調用 → 事件監聽 → 指令處理 → 資料庫 → CI/CD
- 統一繁體中文開發規範，降低學習曲線

---

## Skills 總覽

| # | Skill ID | 功能說明 | 狀態 |
|---|----------|----------|------|
| 01 | [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | 產生正確的 Spigot/Paper Java API 調用代碼 | ✅ 已建立 |
| 02 | [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | 產生完整 Maven 插件骨架（pom.xml、plugin.yml、主類） | ✅ 已建立 |
| 03 | [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | 依功能清單產生結構化 config.yml + ConfigManager | ✅ 已建立 |
| 04 | [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | 產生 Command + TabCompleter 處理類 | ✅ 已建立 |
| 05 | [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | 產生 Event Listener 骨架 | ✅ 已建立 |
| 06 | [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | 產生 JUnit5 + MockBukkit 測試套件 | ✅ 已建立 |
| 07 | [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | 產生 GitHub Actions CI/CD workflow | ✅ 已建立 |
| 08 | [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | 產生 SQLite/MySQL + HikariCP DatabaseManager 類 | ✅ 已建立 |
| 09 | [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | 產生 PlaceholderAPI Expansion 類 | ✅ 已建立 |

完整 Skills 文件見 [`Skills/`](Skills/) 目錄。

---

## 目錄結構

```
MPS/
├── README.md                          ← 本文件
├── Skills/                            ← Skills 對外可讀文件（GitHub 瀏覽用）
│   ├── README.md
│   ├── spigot-paper-api-caller/
│   ├── generate-plugin-skeleton/
│   ├── generate-config-yml/
│   ├── generate-command-handler/
│   ├── generate-event-listener/
│   ├── generate-test-suite/
│   ├── generate-cicd-workflow/
│   ├── generate-database-manager/
│   └── generate-placeholder-expansion/
└── .cursor/
    ├── rules/
    │   └── minecraft-plugin-agent-skills.mdc   ← Cursor Agent 規格指引
    └── skills/                                 ← Cursor Agent 實際載入目錄
        ├── skills-registry.yml
        ├── spigot-paper-api-caller/
        ├── generate-plugin-skeleton/
        ├── generate-config-yml/
        ├── generate-command-handler/
        ├── generate-event-listener/
        ├── generate-test-suite/
        ├── generate-cicd-workflow/
        ├── generate-database-manager/
        └── generate-placeholder-expansion/
```

---

## 快速使用

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

## 開發里程碑

| 里程碑 | 內容 | 狀態 |
|--------|------|------|
| M1 MVP | Skill 01–04 完成，Registry 建立 | ✅ 完成 |
| M2 擴充 | Skill 05–07，單元測試自動化 | ✅ 完成 |
| M3 完整 | Skill 08–09，整合測試（javac 驗證） | ✅ 完成 |
| M4 維護 | Folia 支援、Skill 市集、多語言 prompt | 🔲 規劃中 |

---

## 貢獻指南

1. Fork 本專案
2. 在 `Skills/` 與 `.cursor/skills/` 同步建立新 Skill 目錄
3. 撰寫 `SKILL.md`（含 YAML frontmatter）
4. 更新 `.cursor/skills/skills-registry.yml`
5. 送出 Pull Request

詳細規範見 [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc)。

---

## 授權

本專案採用 [LICENSE](LICENSE) 授權。
