# MPS Agent Skills

此資料夾存放 MPS 專案的所有 Cursor Agent Skills（人工智慧輔助開發技能）的**對外可讀版本**。

> **開發者注意**：Cursor Agent 實際載入的 Skill 路徑為 `.cursor/skills/`，本目錄為同步鏡像，供瀏覽器 / GitHub 直接閱讀使用。兩處內容需保持一致。

---

## 目錄結構

```
Skills/
├── README.md                              ← 本文件
│
├── spigot-paper-api-caller/               ✅ 已建立
│   ├── SKILL.md
│   └── api-reference.md
│
├── generate-plugin-skeleton/              ✅ 已建立
│   └── SKILL.md
│
├── generate-config-yml/                   ✅ 已建立
│   └── SKILL.md
│
├── generate-command-handler/              ✅ 已建立
│   └── SKILL.md
│
├── generate-event-listener/               ✅ 已建立
│   └── SKILL.md
│
├── generate-test-suite/                   ✅ 已建立
│   └── SKILL.md
│
├── generate-cicd-workflow/                ✅ 已建立
│   └── SKILL.md
│
├── generate-database-manager/             ✅ 已建立
│   └── SKILL.md
│
└── generate-placeholder-expansion/        ✅ 已建立
    └── SKILL.md
```

---

## Skills 一覽

| # | Skill ID | 功能說明 | 狀態 |
|---|----------|----------|------|
| 01 | [spigot-paper-api-caller](spigot-paper-api-caller/SKILL.md) | 產生正確的 Spigot/Paper Java API 調用代碼 | ✅ 已建立 |
| 02 | [generate-plugin-skeleton](generate-plugin-skeleton/SKILL.md) | 產生完整 Maven 插件骨架（pom.xml、plugin.yml、主類） | ✅ 已建立 |
| 03 | [generate-config-yml](generate-config-yml/SKILL.md) | 依功能清單產生結構化 config.yml + ConfigManager | ✅ 已建立 |
| 04 | [generate-command-handler](generate-command-handler/SKILL.md) | 產生 CommandExecutor + TabCompleter 處理類 | ✅ 已建立 |
| 05 | [generate-event-listener](generate-event-listener/SKILL.md) | 產生 Event Listener 骨架 | ✅ 已建立 |
| 06 | [generate-test-suite](generate-test-suite/SKILL.md) | 產生 JUnit5 + MockBukkit 測試套件 | ✅ 已建立 |
| 07 | [generate-cicd-workflow](generate-cicd-workflow/SKILL.md) | 產生 GitHub Actions CI/CD workflow | ✅ 已建立 |
| 08 | [generate-database-manager](generate-database-manager/SKILL.md) | 產生 SQLite/MySQL + HikariCP DatabaseManager 類 | ✅ 已建立 |
| 09 | [generate-placeholder-expansion](generate-placeholder-expansion/SKILL.md) | 產生 PlaceholderAPI Expansion 類 | ✅ 已建立 |

---

## 新增 Skill 流程

1. 在此資料夾下建立新目錄（小寫英文 + 連字號命名）
2. 同步在 `.cursor/skills/` 建立相同目錄與 `SKILL.md`
3. 在 `SKILL.md` 中撰寫 YAML frontmatter（`name`、`description`）及使用說明
4. 如有詳細參考資料，另建 `api-reference.md` 或 `examples.md`
5. 更新 `.cursor/skills/skills-registry.yml` 新增對應條目

## Skill 狀態說明

| 狀態 | 說明 |
|------|------|
| `active` | 已建立且可使用 |
| `planned` | 規劃中，尚未建立 |
| `deprecated` | 已棄用，請改用替代 Skill |
