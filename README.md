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
| 02 | `generate-plugin-skeleton` | 產生完整 Maven 插件骨架（pom.xml、plugin.yml、主類） | 🔲 規劃中 |
| 03 | `generate-config-yml` | 依功能清單產生結構化 config.yml | 🔲 規劃中 |
| 04 | [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | 產生 Command + TabCompleter 處理類 | ✅ 已建立 |
| 05 | `generate-event-listener` | 產生 Event Listener 骨架 | 🔲 規劃中 |
| 06 | `generate-test-suite` | 產生 JUnit5 + MockBukkit 測試套件 | 🔲 規劃中 |
| 07 | `generate-cicd-workflow` | 產生 GitHub Actions CI/CD workflow | 🔲 規劃中 |
| 08 | `generate-database-manager` | 產生 SQLite/MySQL DatabaseManager 類 | 🔲 規劃中 |
| 09 | `generate-placeholder-expansion` | 產生 PlaceholderAPI Expansion 類 | 🔲 規劃中 |

完整 Skills 文件見 [`Skills/`](Skills/) 目錄。

---

## 目錄結構

```
MPS/
├── README.md                          ← 本文件
├── Skills/                            ← Skills 對外可讀文件（GitHub 瀏覽用）
│   ├── README.md
│   └── spigot-paper-api-caller/
│       ├── SKILL.md
│       └── api-reference.md
└── .cursor/
    ├── rules/
    │   └── minecraft-plugin-agent-skills.mdc   ← Cursor Agent 規格指引
    └── skills/                                 ← Cursor Agent 實際載入目錄
        ├── skills-registry.yml
        └── spigot-paper-api-caller/
            ├── SKILL.md
            └── api-reference.md
```

---

## 快速使用

在 Cursor Agent 對話中，直接以自然語言描述需求，Agent 會自動載入對應的 Skill：

```
幫我產生監聽 PlayerJoinEvent 的 Listener 類
→ 自動套用 spigot-paper-api-caller

幫我建立一個名為 MyPlugin 的插件骨架，目標 MC 版本 1.20.4
→ 自動套用 generate-plugin-skeleton（建立後）
```

---

## 開發里程碑

| 里程碑 | 內容 | 目標時程 |
|--------|------|----------|
| M1 MVP | Skill 01–04 完成，Registry 建立 | 第 1–2 週 |
| M2 擴充 | Skill 05–07，單元測試自動化 | 第 3–4 週 |
| M3 完整 | Skill 08–09，整合測試（javac 驗證） | 第 5–6 週 |
| M4 維護 | Folia 支援、Skill 市集、多語言 prompt | 第 7 週起 |

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
