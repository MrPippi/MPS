# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MPS (Minecraft Plugin Studio) has two distinct parts:

1. **Skills Library** — Cursor Agent Skills for automating Bukkit/Spigot/Paper plugin development. Stored under `Skills/` (public mirror) and `.cursor/skills/` (Cursor runtime). Both paths must always be kept in sync.

2. **Web App** — A Next.js 15 documentation site for browsing the skills library, located in `web/`.

---

## Web App (`web/`)

### Dev Commands

```bash
cd web
npm run dev      # start dev server
npm run build    # production build
npm start        # run production server
```

### Architecture

- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Data source**: Skill content is read at build/request time from `web/data/skills/*.md` (Markdown with YAML frontmatter) via `lib/skills.ts` — no database
- **View counter**: Optional Upstash Redis integration (`lib/redis.ts`). Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars; degrades gracefully if absent
- **Search**: Client-side fuzzy search via Fuse.js; search index is built in `lib/skills.ts:getSearchIndex()` and passed through the layout

### Key paths

| Path | Purpose |
|------|---------|
| `web/data/skills/` | One `.md` per skill; YAML frontmatter drives all metadata |
| `web/lib/skills.ts` | All skill data access functions |
| `web/app/skills/[slug]/` | Dynamic skill detail page |
| `web/app/api/views/` | API route for Upstash Redis view counts |
| `web/components/` | UI components organized by `layout/`, `skills/`, `search/`, `ui/`, `icons/` |

### Adding a new skill page

Add a new `web/data/skills/<slug>.md` file. Required frontmatter fields:

```yaml
id: skill-id
title: "Skill Title"
titleZh: "技能標題"
description: "English description"
descriptionZh: "繁體中文說明"
version: "1.0.0"
status: active        # active | planned
category: scaffold    # matches categories in web/app/categories/
categoryLabel: "分類標籤"
categoryLabelEn: "Category Label"
tags: [tag1, tag2]
triggerKeywords: ["keyword1"]
updatedAt: "2026-01-01"
githubPath: "Skills/skill-slug/SKILL.md"
featured: false
```

---

## Skills Library (`.cursor/skills/` and `Skills/`)

### Adding a new Skill

1. Create `Skills/<slug>/` and `.cursor/skills/<slug>/` directories simultaneously
2. Write `SKILL.md` with YAML frontmatter (`name`, `description`) in each
3. Write `examples.md` with at least 2 examples
4. Add an entry to both `.cursor/skills/skills-registry.yml` **and** `Skills/skills-registry.yml` with `status: active`
5. Update `web/data/skills/<slug>.md` with the frontmatter schema above

### SKILL.md required sections

```
技能名稱：[slug]
目的（1 行）：[核心功能說明]
觸發條件：[觸發關鍵字]
輸入參數：[required inputs]
輸出產物：[generated files]
失敗回退：[error handling]
```

### Thread-safety rule for all generated Java code

- **Main thread**: all Bukkit object operations (Player, World, ItemStack)
- **Async**: IO, database, HTTP
- Switch back to main thread with `Bukkit.getScheduler().runTask(plugin, runnable)`
