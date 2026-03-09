# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MPS (Minecraft Plugin Studio) has two distinct parts:

1. **Skills Library** — Cursor Agent Skills for automating Bukkit/Spigot/Paper plugin development. Stored under `Skills/` (public mirror) and `.cursor/skills/` (Cursor runtime). **Both paths must always be kept in sync.**

2. **Web App** — A Next.js 16 documentation site for browsing the skills library, located in `web/`.

### Repository Layout

```
MPS/
├── CLAUDE.md                        ← This file
├── README.md                        ← English overview
├── README.zh-TW.md                  ← Traditional Chinese overview
├── MPS.code-workspace               ← VS Code workspace config
├── .github/workflows/deploy.yml     ← CI/CD (typecheck + build + Vercel deploy)
├── .cursor/
│   ├── rules/                       ← Cursor Agent rule files (.mdc)
│   └── skills/                      ← Cursor Agent runtime (15 skills)
│       └── skills-registry.yml      ← Agent skill registry (v3.0.0)
├── Skills/                          ← Public GitHub mirror (12 skills)
│   ├── README.md
│   └── skills-registry.yml          ← Must stay identical to .cursor version
└── web/                             ← Next.js documentation site
```

---

## Web App (`web/`)

### Dev Commands

```bash
cd web
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build (also runs type-check)
npm start        # run production server
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19.2.3, TypeScript (strict mode) |
| Styling | Tailwind CSS v4, Tailwind Typography v0.5.19 |
| Markdown | gray-matter, remark, remark-gfm, remark-html |
| Search | Fuse.js v7.1.0 (client-side fuzzy) |
| Analytics | Upstash Redis (optional view counter) |
| Deployment | Vercel (via GitHub Actions) |

### Architecture

- **Data source**: Skill content is read at build/request time from `web/data/skills/*.md` (Markdown with YAML frontmatter) via `lib/skills.ts` — no database
- **View counter**: Optional Upstash Redis (`lib/redis.ts`). Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars; degrades gracefully if absent. View key format: `mps:views:{slug}`
- **Search**: Client-side fuzzy search via Fuse.js; search index built in `lib/skills.ts:getSearchIndex()` and passed through the layout
- **i18n**: Full bilingual support — English + Traditional Chinese (繁體中文) throughout all data and UI

### Key Paths

| Path | Purpose |
|------|---------|
| `web/data/skills/` | One `.md` per skill; YAML frontmatter drives all metadata |
| `web/lib/skills.ts` | All skill data access functions (single source of truth) |
| `web/lib/redis.ts` | Upstash Redis wrapper for view counting |
| `web/lib/search.ts` | Fuse.js configuration |
| `web/lib/utils.ts` | Shared utilities |
| `web/types/skill.ts` | TypeScript interfaces: `SkillMeta`, `SkillFull`, `Category`, `SearchIndex` |
| `web/app/skills/[slug]/` | Dynamic skill detail page |
| `web/app/categories/[category]/` | Category browsing page |
| `web/app/guide/` | Documentation/guide pages |
| `web/app/api/views/[slug]/` | API route for Upstash Redis view counts |
| `web/components/layout/` | Header, footer, navigation |
| `web/components/skills/` | Skill-related UI components |
| `web/components/search/` | Search modal and input |
| `web/components/ui/` | Base UI components |
| `web/components/icons/` | Icon components |

### Data Model (`web/types/skill.ts`)

```typescript
type SkillStatus = 'active' | 'deprecated';

interface SkillMeta {
  id, slug, title, titleZh, description, descriptionZh,
  version, status, category, categoryLabel, categoryLabelEn,
  tags[], triggerKeywords[], updatedAt, githubPath, featured
}

interface SkillFull extends SkillMeta {
  content       // raw markdown
  contentHtml   // rendered HTML
}

interface Category {
  id, label, labelEn, count
}

interface SearchIndex {
  id, slug, title, titleZh, description, descriptionZh,
  tags[], category, status
}
```

### Data Access Functions (`web/lib/skills.ts`)

| Function | Returns |
|----------|---------|
| `getAllSkills()` | `SkillMeta[]` sorted by updatedAt desc |
| `getSkillBySlug(slug)` | `SkillFull` with rendered HTML |
| `getSkillsByCategory(categoryId)` | `SkillMeta[]` |
| `getCategories()` | `Category[]` derived from skills metadata |
| `getFeaturedSkills()` | `SkillMeta[]` filtered by `featured: true` |
| `getSearchIndex()` | Fuse.js-ready index array |

### Environment Variables

```bash
# web/.env.local (copy from .env.local.example)
NEXT_PUBLIC_SITE_URL=https://mps.vercel.app
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io   # optional
UPSTASH_REDIS_REST_TOKEN=your_token_here          # optional
```

### Adding a New Skill Page

Add `web/data/skills/<slug>.md` with all required frontmatter:

```yaml
id: skill-id
title: "Skill Title"
titleZh: "技能標題"
description: "English description"
descriptionZh: "繁體中文說明"
version: "1.0.0"
status: active        # active | planned
category: scaffold    # scaffold | config | command | event | integration | testing | devops | database | permission
categoryLabel: "分類標籤"
categoryLabelEn: "Category Label"
tags: [tag1, tag2]
triggerKeywords: ["keyword1"]
updatedAt: "2026-01-01"
githubPath: "Skills/skill-slug/SKILL.md"
featured: false
```

The markdown body after the frontmatter becomes the skill detail page content.

### Deployment Pipeline

1. Push to `main` triggers `.github/workflows/deploy.yml`
2. Node 20 setup → `npm ci` in `web/` → TypeScript type-check → `npm run build`
3. If `VERCEL_ENABLED == 'true'` and branch is `main`, deploy to Vercel production
4. Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Skills Library (`.cursor/skills/` and `Skills/`)

### Registry Overview

Both `Skills/skills-registry.yml` and `.cursor/skills/skills-registry.yml` must always be **identical**. Current registry version: **3.0.0** (updated 2026-03-05).

### Active Skills (13 total)

| Skill ID | Category | Description |
|----------|----------|-------------|
| `generate-plugin-skeleton` | scaffold | Maven pom.xml, plugin.yml, main class |
| `generate-command-handler` | command | CommandExecutor + TabCompleter |
| `generate-event-listener` | event | @EventHandler, EventPriority |
| `generate-config-yml` | config | config.yml + ConfigManager |
| `generate-message-system` | config | messages.yml + MessageManager |
| `generate-permission-system` | permission | PermissionManager + plugin.yml |
| `generate-database-manager` | database | SQLite/MySQL + HikariCP |
| `generate-placeholder-expansion` | integration | PlaceholderAPI Expansion |
| `generate-test-suite` | testing | JUnit 5 + MockBukkit |
| `generate-cicd-workflow` | devops | GitHub Actions workflow |
| `spigot-paper-api-caller` | integration | External HTTP API integration |
| `sync-website-skill` | devops | Web data sync (.cursor/ only) |
| `integrate-vault` | integration | Vault economy/permissions (.cursor/ only) |

### Registry Entry Schema

```yaml
- id: skill-id
  version: "1.0.0"
  status: active           # active | planned | deprecated
  category: scaffold
  description: "繁體中文說明"
  skill_file: skill-id/SKILL.md
  examples_file: skill-id/examples.md   # optional
  reference_files: []                   # optional additional references
  inputs:
    - name: param_name
      description: "說明"
      required: true
  outputs:
    - name: "FileName.java"
      description: "說明"
  tags: [tag1, tag2]
  trigger_keywords: ["觸發關鍵字1", "觸發關鍵字2"]
```

### Adding a New Skill (5 Steps)

1. Create `Skills/<slug>/` **and** `.cursor/skills/<slug>/` directories simultaneously
2. Write `SKILL.md` (with YAML frontmatter `name`, `description`) in **both** directories
3. Write `examples.md` with **at least 2 examples** in **both** directories
4. Add an entry to **both** `Skills/skills-registry.yml` and `.cursor/skills/skills-registry.yml` with `status: active`
5. Add `web/data/skills/<slug>.md` with the frontmatter schema above

### SKILL.md Structure

```markdown
---
name: skill-id
description: "繁體中文說明"
---

# 技能標題

## 技能名稱
[slug]

## 目的（1 行）
[核心功能說明 — one sentence]

## 觸發條件
[觸發關鍵字 / trigger keywords]

## 輸入參數
[Table or list of required inputs]

## 輸出產物
[List of generated files]

## 代碼範本
[Full annotated code examples]

## 推薦目錄結構
[Directory layout diagram]

## 失敗回退
[Error handling and fallback guidance]
```

### examples.md Structure

```markdown
## 範例 1: [Scenario title]

**Input:**
(parameter values or user request)

**Output — [FileName.java]:**
```java
// full generated file
```

## 範例 2: [Another scenario]
...
```

At least 2 complete examples per skill showing realistic inputs and full generated output.

### Thread-Safety Rules for All Generated Java Code

- **Main thread**: all Bukkit object operations (`Player`, `World`, `ItemStack`, etc.)
- **Async threads**: IO, database queries, HTTP calls
- Always switch back to main thread with:

```java
Bukkit.getScheduler().runTask(plugin, runnable);
```

- Use `runTaskAsynchronously` for async work, never block the main thread with IO.

---

## Cursor Agent Rules (`.cursor/rules/`)

Two rule files govern agent behavior:

- **`minecraft-plugin-agent-skills.mdc`** (`alwaysApply: true`): Registers all skills, enforces dual-path sync, defines 5-step new-skill workflow, thread-safety requirements.
- **`Front-End Developer.mdc`**: Front-end development conventions for the web app.

When modifying agent behavior or adding skills, update the `.mdc` rule files as well as the registry.

---

## Git Workflow

- Default development branch: `master`
- CI/CD deploys from: `main`
- Feature work: use `claude/*` or descriptive branch names
- Commit messages: use imperative mood, reference skill IDs or component names where relevant
- Never push directly to `main` without passing the CI build

---

## Key Invariants

1. **Dual-path sync**: Every change to `Skills/<slug>/` must be mirrored in `.cursor/skills/<slug>/` and vice versa.
2. **Registry parity**: `Skills/skills-registry.yml` and `.cursor/skills/skills-registry.yml` must always be identical.
3. **Frontmatter completeness**: All 14 required frontmatter fields must be present in `web/data/skills/*.md`.
4. **Thread safety**: All generated Java code must respect Bukkit main-thread / async boundaries.
5. **Bilingual**: All skill titles, descriptions, and categories must have both English and Traditional Chinese (繁體中文) values.
6. **No database**: The web app reads directly from the filesystem; do not introduce a database dependency.
7. **Graceful degradation**: Redis view counting is optional — the app must work without it.
