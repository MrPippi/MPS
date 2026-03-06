# Sync Website Skill 使用範例

## 範例 1：新增 `integrate-vault` Skill 後同步網站

**情境**：剛完成 `.cursor/skills/integrate-vault/SKILL.md` 建立，需要同步網頁。

**Step 1 — 從 SKILL.md 取得資料：**
- name: `integrate-vault`
- 英文標題: `Integrate Vault Economy API`
- 繁中標題: `Vault 經濟整合器`
- category: `integrations`（已存在，不需更新 CategoryIcon）

**Step 2 — 建立 `web/data/skills/integrate-vault.md`：**

```markdown
---
id: integrate-vault
title: Integrate Vault Economy API
titleZh: Vault 經濟整合器
description: Integrate the Vault economy API into your Bukkit/Paper plugin...
descriptionZh: 為 Bukkit/Paper 插件整合 Vault 經濟 API...
version: "1.0.0"
status: active
category: integrations
categoryLabel: 整合
categoryLabelEn: Integrations
tags: [vault, economy, bukkit, paper, integration]
triggerKeywords:
  - "Vault 整合"
  - "EconomyManager"
updatedAt: "2026-03-06"
githubPath: Skills/integrate-vault/SKILL.md
featured: false
---
...
```

**Step 3 — 更新 `skills-registry.yml`**（新增條目於末尾）

**Step 4 — 不需要更新 CategoryIcon.tsx**（`integrations` case 已存在）

---

## 範例 2：新增一個全新 category 的 Skill

**情境**：新增了一個 `economy-system` Skill，category 為 `economy`（全新）。

**需要額外執行 Step 4**，在 `web/components/icons/CategoryIcon.tsx` 補上：

```tsx
case 'economy':
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
```

> SVG path 來自 Heroicons outline `currency-dollar`，與專案現有圖示風格（outline, strokeWidth 1.5）一致。

---

## 範例 3：更新現有 Skill 的網頁資料

**情境**：`generate-command-handler` 版本升至 `1.1.0`，新增了 `brigadier` tag。

只需修改 `web/data/skills/generate-command-handler.md` 的 frontmatter：

```yaml
version: "1.1.0"
tags: [command, tabcompleter, bukkit, permission, sub-command, brigadier]
updatedAt: "2026-03-06"
```

不需要動 `skills-registry.yml`（版本資訊不在 registry 中同步管理）。

---

## 常見錯誤

| 錯誤 | 原因 | 修正 |
|------|------|------|
| 網頁分類頁面圖示顯示為預設方框圖示 | category id 未在 `CategoryIcon.tsx` 定義 | 補上對應 `case` |
| `/skills/<slug>` 頁面 404 | `web/data/skills/<slug>.md` 的 `id` 與檔名不一致 | 確保 `id` = 檔名（不含 `.md`）|
| Skill 未出現在列表 | frontmatter 缺少 `id` 或 `title` | `lib/skills.ts` 會跳過缺少這兩個欄位的檔案 |
| `githubPath` 連結 404 | 路徑格式錯誤 | 固定格式為 `Skills/<skill-name>/SKILL.md` |
