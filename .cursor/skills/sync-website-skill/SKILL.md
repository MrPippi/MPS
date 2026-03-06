---
name: sync-website-skill
description: 在 MPS 專案新增或更新 Cursor Agent Skill 後，同步更新網站展示內容。負責在 web/data/skills/ 建立對應的 .md 資料檔、在必要時更新 CategoryIcon.tsx、以及更新 skills-registry.yml。當使用者說「更新網站」、「更新網頁內容」、「同步 Skill 到網站」、「新增 Skill 後更新網頁」時自動應用。
---

# Sync Website Skill

## 目標

當 `.cursor/skills/` 下新增或修改了一個 Skill 後，同步更新 MPS 網站（`web/` 目錄）的展示內容，確保網頁與 Skill 文件保持一致。

---

## 工作流程

### Step 1：確認 Skill 基本資料

從新增的 `.cursor/skills/<skill-name>/SKILL.md` frontmatter 與內容取得：
- `name`（Skill ID，對應網頁 slug）
- 英文 `title` 與繁中 `titleZh`
- 英文 `description` 與繁中 `descriptionZh`（簡短一句）
- `category`（需對應現有 category id，見下方清單）
- `tags`、`triggerKeywords`
- `version`（預設 `"1.0.0"`）

**現有 category 清單**（對應 `CategoryIcon.tsx` 已定義的圖示）：

| category id | categoryLabel | categoryLabelEn |
|---|---|---|
| `api-integration` | API 整合 | API Integration |
| `scaffolding` | 專案骨架 | Scaffolding |
| `configuration` | 配置管理 | Configuration |
| `commands` | 指令系統 | Commands |
| `events` | 事件監聽 | Events |
| `testing` | 測試 | Testing |
| `devops` | DevOps | DevOps |
| `database` | 資料庫 | Database |
| `integrations` | 整合 | Integrations |
| `permission` | 權限系統 | Permission |

> 若需要全新 category，必須同步更新 `web/components/icons/CategoryIcon.tsx`，加入對應 SVG `case`。

---

### Step 2：建立網頁資料檔

路徑：`web/data/skills/<skill-name>.md`

使用以下 frontmatter 範本：

```markdown
---
id: <skill-name>
title: <英文標題（Title Case）>
titleZh: <繁中標題>
description: <英文一句描述>
descriptionZh: <繁中一句描述>
version: "1.0.0"
status: active
category: <category-id>
categoryLabel: <繁中分類名>
categoryLabelEn: <英文分類名>
tags: [tag1, tag2, ...]
triggerKeywords:
  - "關鍵字1"
  - "關鍵字2"
updatedAt: "<YYYY-MM-DD>"
githubPath: Skills/<skill-name>/SKILL.md
featured: false
---

# <英文標題> Skill

## 目標

<兩三句說明此 Skill 的用途>

---

## 使用流程

（從 SKILL.md 摘錄核心步驟，4-5 項即可）

---

## <核心代碼片段或依賴範本>

（節錄 SKILL.md 中最重要的代碼範本，控制在 40 行以內）

---

## 支援功能

（條列式重點功能清單，5-8 項）
```

---

### Step 3：更新 skills-registry.yml

在 `.cursor/skills/skills-registry.yml` 末尾新增條目：

```yaml
  - id: <skill-name>
    version: "1.0.0"
    status: active
    category: <category-id>
    description: <一行繁中描述>
    skill_file: <skill-name>/SKILL.md
    examples_file: <skill-name>/examples.md
    inputs:
      - plugin_name
      - <其他輸入參數>
    outputs:
      - <主要產出物>
    tags: [tag1, tag2]
    trigger_keywords:
      - "關鍵字1"
      - "關鍵字2"
```

---

### Step 4：若新增了 category，更新 CategoryIcon.tsx

路徑：`web/components/icons/CategoryIcon.tsx`

在 `switch (category)` 的最後一個 `case` 之後（`default:` 之前）插入新的 `case`：

```tsx
case '<new-category-id>':
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="<Heroicons outline path data>" />
    </svg>
  );
```

SVG path 請從 [Heroicons](https://heroicons.com/)（outline 樣式）取得，與現有圖示風格一致。

---

## 完成檢查清單

```
- [ ] web/data/skills/<skill-name>.md 已建立，frontmatter 欄位完整
- [ ] id 與 slug（檔名）一致
- [ ] category 對應現有 CategoryIcon.tsx case 或已新增 case
- [ ] skills-registry.yml 已新增條目
- [ ] updatedAt 為今日日期
- [ ] githubPath 格式為 Skills/<skill-name>/SKILL.md
```

---

## 更多範例

詳見 [examples.md](examples.md)
