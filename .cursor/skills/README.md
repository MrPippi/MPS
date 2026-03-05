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
├── generate-plugin-skeleton/        🔲 待建立
├── generate-config-yml/             🔲 待建立
├── generate-command-handler/        🔲 待建立
├── generate-event-listener/         🔲 待建立
├── generate-test-suite/             🔲 待建立
├── generate-cicd-workflow/          🔲 待建立
├── generate-database-manager/       🔲 待建立
└── generate-placeholder-expansion/  🔲 待建立
```

## 新增 Skill 流程

1. 在此資料夾下建立新目錄（小寫英文 + 連字號命名）
2. 在目錄內建立 `SKILL.md`，格式如下：

```markdown
---
name: your-skill-name
description: 第三人稱說明此 Skill 的功能與觸發時機。
---

# Skill 標題

## 使用流程
...

## 代碼範本
...
```

3. 如有詳細參考資料，另建 `reference.md` 或 `examples.md`
4. 在 `skills-registry.yml` 新增對應條目（含 `id`、`version`、`status`、`tags`、`trigger_keywords`）

## 快速呼叫方式

在 Cursor Agent 對話框中，直接用自然語言描述需求，Agent 會依 `description` 中的觸發關鍵字自動載入對應 Skill。

範例：
```
幫我產生 Spigot 插件的 PlayerJoinEvent 監聽器
→ 自動載入 spigot-paper-api-caller

幫我新建一個插件骨架，名稱 MyPlugin，MC 版本 1.20.4
→ 自動載入 generate-plugin-skeleton（建立後）
```

## Skill 狀態說明

| 狀態 | 說明 |
|------|------|
| `active` | 已建立且可使用 |
| `planned` | 規劃中，尚未建立 |
| `deprecated` | 已棄用，請改用替代 Skill |
