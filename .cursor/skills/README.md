# MPS Agent Skills

此資料夾存放 MPS 專案的所有 Cursor Agent Skills。

## 目錄結構

```
.cursor/skills/
├── README.md                        ← 本文件
├── skills-registry.yml              ← Skill 總覽索引（新增 Skill 時必須更新）
│
├── spigot-paper-api-caller/         ✅ 已建立
│   ├── SKILL.md                     ← 主技能指引
│   └── api-reference.md             ← 詳細 API 參考
│
├── generate-plugin-skeleton/        ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-config-yml/             ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-command-handler/        ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-event-listener/         ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-message-system/         ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-permission-system/      ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-test-suite/             ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-cicd-workflow/          ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-database-manager/       ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── generate-placeholder-expansion/  ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
├── integrate-vault/                 ✅ 已建立
│   ├── SKILL.md
│   └── examples.md
│
└── sync-website-skill/              ✅ 已建立
    ├── SKILL.md
    └── examples.md
```

## SKILL.md 標準結構

每個 `SKILL.md` 必須遵守以下格式：

```markdown
---
name: your-skill-name
description: 第三人稱說明此 Skill 的功能與觸發時機。
---

# Generate XXX Skill

## 目標

一兩句說明此 Skill 的產出物與用途。

---

## 使用流程

1. **詢問必要資訊**：...
2. **產生主要產出物**：...
3. **說明整合方式**：...

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| ... | ... | ... |

---

## 代碼範本

（程式碼區塊）

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| ... | ... | ... |
```

> **注意**：`## 更多範例` 區塊可選，若有 `examples.md` 則在末尾加上 `詳見 [examples.md](examples.md)`。

---

## 新增 Skill 流程

1. 在此資料夾下建立新目錄（小寫英文 + 連字號命名）
2. 在目錄內建立 `SKILL.md`，依上方標準結構填寫
3. 如有使用範例，另建 `examples.md`
4. 在 `skills-registry.yml` 新增對應條目（含 `id`、`version`、`status`、`tags`、`trigger_keywords`）
5. 執行 sync-website-skill 同步更新網頁展示內容

---

## 快速呼叫方式

在 Cursor Agent 對話框中，直接用自然語言描述需求，Agent 會依 `description` 中的觸發關鍵字自動載入對應 Skill。

範例：
```
幫我產生 Spigot 插件的 PlayerJoinEvent 監聽器
→ 自動載入 generate-event-listener

幫我新建一個插件骨架，名稱 MyPlugin，MC 版本 1.20.4
→ 自動載入 generate-plugin-skeleton

幫我建立 Vault 整合
→ 自動載入 integrate-vault
```

---

## Skill 狀態說明

| 狀態 | 說明 |
|------|------|
| `active` | 已建立且可使用 |
| `planned` | 規劃中，尚未建立 |
| `deprecated` | 已棄用，請改用替代 Skill |
