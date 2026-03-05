# MPS Web — Minecraft Plugin Skills 網站

MPS 官方網站，提供 Skills 瀏覽、搜尋與詳細頁功能。

## 技術棧

- **Framework**: Next.js 16 (App Router)
- **UI**: TailwindCSS v4 + Tailwind Typography
- **搜尋**: Fuse.js（客戶端模糊搜尋）
- **Markdown**: remark + gray-matter
- **部署**: Vercel

## 本機開發

```bash
cd web
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 環境變數

複製 `.env.local.example` 為 `.env.local` 並填入值：

```bash
cp .env.local.example .env.local
```

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_URL` | 網站正式 URL（SEO 用） | `https://mps.vercel.app` |

## 新增 Skill

1. 在 `data/skills/` 新增 `{skill-id}.md`
2. 填入 YAML frontmatter（參考現有檔案格式）
3. 重新啟動開發伺服器即可看到新 Skill

## 建置

```bash
npm run build
npm run start
```

## 部署

推送至 `main` 分支後，GitHub Actions 自動部署到 Vercel。

需在 GitHub repo Settings > Secrets 設定：
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
