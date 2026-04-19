# MPS — Minecraft Plugin Studio (Claude Code Guide)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What is This Repository

MPS (Minecraft Plugin Studio) has two distinct parts:

1. **Skills Library** — Agent Skills for automating Minecraft plugin development across Paper, Purpur, Velocity, and Waterfall. Canonical source: `Skills/`. Cursor runtime copy: `.cursor/skills/`.

2. **Web App** — A Next.js 16 documentation site for browsing the skills library, located in `web/`.

### Repository Layout

```
MPS/
├── CLAUDE.md                            ← This file (Claude Code entry point)
├── README.md / README.zh-TW.md
├── .github/workflows/nextjs.yml          ← CI/CD (typecheck + build + GitHub Pages deploy)
├── .cursor/
│   ├── rules/                           ← Cursor Agent rule files (.mdc)
│   └── skills/                          ← Cursor Agent runtime (19 skills)
│       └── skills-registry.yml          ← Authoritative superset (19 entries)
├── Skills/                              ← Canonical public source (18 skills)
│   ├── README.md
│   ├── skills-registry.yml              ← Public registry (18 entries, excl. Cursor-only)
│   ├── _shared/                         ← Cross-platform shared patterns
│   │   ├── async-patterns.md
│   │   └── cross-server-messaging.md
│   ├── paper/                           ← Paper platform
│   │   └── PLATFORM.md
│   ├── purpur/                          ← Purpur platform
│   │   ├── PLATFORM.md
│   │   └── purpur-api-caller/SKILL.md
│   ├── velocity/                        ← Velocity proxy platform
│   │   ├── PLATFORM.md
│   │   ├── generate-velocity-plugin-skeleton/SKILL.md
│   │   ├── generate-proxy-event-listener/SKILL.md
│   │   └── generate-plugin-message-handler/SKILL.md
│   ├── waterfall/                       ← Waterfall/BungeeCord proxy platform
│   │   ├── PLATFORM.md
│   │   ├── generate-waterfall-plugin-skeleton/SKILL.md
│   │   └── generate-bungeecord-channel/SKILL.md
│   └── [12 legacy flat skills]          ← Paper/Spigot skills (flat layout, pre-v4)
├── docs/                                ← Supplementary API reference docs (read-only reference)
│   ├── CONVENTIONS.md                   ← Cross-platform coding conventions
│   ├── paper/                           ← Detailed Paper API reference
│   ├── purpur/                          ← Detailed Purpur API reference
│   ├── velocity/                        ← Detailed Velocity API reference
│   └── waterfall/                       ← Detailed Waterfall API reference
└── web/                                 ← Next.js documentation site
```

> **Note**: `docs/` contains detailed API reference guides (scheduling, events, storage, messaging sub-skills). These are supplementary reading — not the authoritative Skill definitions. The authoritative definitions are in `Skills/`.

---

## How to Use This Skills Library

When asked to generate Minecraft plugin code, always follow this order:

1. **Check `Skills/skills-registry.yml`** first — find the skill whose `trigger_keywords` match the request
2. **Read the corresponding `SKILL.md`** before generating any code
3. **Check the platform's `PLATFORM.md`** for the correct build.gradle, plugin descriptor, and API patterns
4. **For cross-platform work**, read `Skills/_shared/` for async patterns and messaging conventions
5. **For deep API reference**, consult `docs/<platform>/` sub-skill files (scheduling, events, storage, etc.)

Never generate Minecraft plugin code from memory — always read the relevant SKILL.md and PLATFORM.md first.

---

## Platform Reference

| Platform | Version | PLATFORM.md | Javadoc |
|----------|---------|-------------|---------|
| Paper | 1.21–1.21.1 | `Skills/paper/PLATFORM.md` | https://jd.papermc.io/paper/1.21/ |
| Purpur | 1.21–1.21.1 | `Skills/purpur/PLATFORM.md` | https://purpurmc.org/docs/purpur/ |
| Velocity | 3.3.x | `Skills/velocity/PLATFORM.md` | https://jd.papermc.io/velocity/3.3.0/ |
| Waterfall | 1.21 | `Skills/waterfall/PLATFORM.md` | https://jd.papermc.io/waterfall/1.21/ |

---

## Skills Index

All skills are indexed in `Skills/skills-registry.yml`. Quick reference:

### Paper / Spigot Skills (flat layout)

| Skill ID | Category | Purpose |
|----------|----------|---------|
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
| `spigot-paper-api-caller` | integration | Paper API code generation |
| `integrate-vault` | integration | Vault economy/permissions |

### Platform-Specific Skills (nested layout)

| Skill ID | Platform | Purpose |
|----------|----------|---------|
| `purpur-api-caller` | purpur | Purpur-specific API code generation |
| `generate-velocity-plugin-skeleton` | velocity | Velocity plugin boilerplate |
| `generate-proxy-event-listener` | velocity | @Subscribe event listener |
| `generate-plugin-message-handler` | velocity | PluginMessageEvent handler |
| `generate-waterfall-plugin-skeleton` | waterfall | Waterfall/BungeeCord boilerplate |
| `generate-bungeecord-channel` | waterfall | BungeeCord channel handler |

---

## Workflow Rules

- **MC version target**: 1.21 to 1.21.1
- **Build tool**: Gradle (Groovy DSL) — never Maven for new skills
- **Language**: Java 21 (toolchain)
- **Never mix** Bukkit sync API with Velocity async patterns in the same class
- **Purpur extends Paper** — always check if Paper API already covers the need before using Purpur-specific API
- **Plugin Messaging format differs** between Waterfall and Velocity — check `Skills/<platform>/PLATFORM.md` before generating messaging code
- **Proxy plugins have no world/entity access** — Velocity and Waterfall only see network-level player info

### Thread Safety (All Platforms)

| Platform | Main-thread operations | Async operations |
|----------|----------------------|-----------------|
| Paper | All Bukkit object mutations (Player, World, Entity, ItemStack) | IO, DB queries, HTTP |
| Velocity | Event handlers run async by default | `@Subscribe` is already async |
| Waterfall | Same sync model as Bukkit/Paper | `getProxy().getScheduler().runAsync()` |

**Paper — switching threads:**
```java
// Async → main thread
Bukkit.getScheduler().runTask(plugin, () -> player.sendMessage(result));

// Main → async
Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> database.query(...));
```

**Velocity — scheduling:**
```java
proxyServer.getScheduler().buildTask(plugin, () -> { /* async work */ }).schedule();
```

---

## Web App (`web/`)

### Dev Commands

```bash
cd web
npm run dev           # start dev server (http://localhost:3000)
npx tsc --noEmit      # TypeScript type-check only
npm run build         # generate sitemap/robots + next build → outputs to web/out/
```

> `npm run build` runs `tsx scripts/generate-static-metadata.ts` first (generates `public/robots.txt` and `public/sitemap.xml`), then `next build`. The site uses `output: 'export'` (static HTML to `web/out/`), so `next start` does not work — serve `web/out/` with any static file server for local preview.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19.2.3, TypeScript (strict mode) |
| Styling | Tailwind CSS v4, Tailwind Typography v0.5.19 |
| Markdown | gray-matter, remark, remark-gfm, remark-html |
| Search | Fuse.js v7.1.0 (client-side fuzzy) |
| Deployment | GitHub Pages via static export (`output: 'export'`) |

### Architecture

- **Data source**: Skill content is read at build/request time from `web/data/skills/*.md` (Markdown with YAML frontmatter) via `features/skills/api/skills.ts` — no database
- **Search**: Client-side fuzzy search via Fuse.js; search index built in `features/skills/api/skills.ts:getSearchIndex()` and passed through the layout
- **i18n**: Full bilingual support — English + Traditional Chinese (繁體中文) throughout all data and UI

### Key Paths

| Path | Purpose |
|------|---------|
| `web/data/skills/` | One `.md` per skill; YAML frontmatter drives all metadata |
| `web/config/site.ts` | Site-wide constants: `SITE_NAME`, `GITHUB_REPO_URL`, `GITHUB_CONTRIBUTE_URL` |
| `web/shared/types/skill.ts` | TypeScript interfaces: `SkillMeta`, `SkillFull`, `Category`, `SearchIndex` |
| `web/shared/lib/utils.ts` | Utilities: `formatDate`, `statusColor`, `statusLabel`, `statusTextColor`, `cn` |
| `web/shared/ui/` | Brand-level UI components (PickaxeIcon) |
| `web/layout/` | App shell: `AppShell.tsx`, `Header.tsx`, `Footer.tsx` |
| `web/features/skills/` | `api/skills.ts` (data access) + components: SkillCard, SkillDetail, SkillGrid, SkillBadge |
| `web/features/categories/` | `CategoryIcon.tsx`, `Sidebar.tsx` |
| `web/features/search/` | `api/search.ts` (Fuse.js config), `SearchModal.tsx` |
| `web/app/globals.css` | CSS custom properties + utility classes (`.focus-ring`, `.bg-accent-subtle`, `.skill-prose`, etc.) |

### Data Model (`web/shared/types/skill.ts`)

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

### Data Access Functions (`web/features/skills/api/skills.ts`)

| Function | Returns |
|----------|---------|
| `getAllSkills()` | `SkillMeta[]` sorted alphabetically by `title`; result is module-level cached |
| `getSkillBySlug(slug)` | `SkillFull` with rendered HTML |
| `getSkillsByCategory(categoryId)` | `SkillMeta[]` |
| `getCategories()` | `Category[]` derived from skills metadata |
| `getFeaturedSkills()` | `SkillMeta[]` filtered by `featured: true` |
| `getSearchIndex()` | Fuse.js-ready index array |

### Environment Variables

```bash
# web/.env.local (copy from .env.local.example)
NEXT_PUBLIC_SITE_URL=https://mps.vercel.app
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

### Deployment Pipeline

1. Push to `main` triggers `.github/workflows/nextjs.yml`
2. Node 20 setup → `npm ci` in `web/` → `npx tsc --noEmit` → `npx next build`
3. Static output uploaded to GitHub Pages as artifact, then deployed
4. `NEXT_PUBLIC_SITE_URL` is set to the GitHub Pages URL during CI build
5. The CI calls `npx next build` directly (not `npm run build`), so `generate-static-metadata.ts` is NOT run in CI — `web/app/robots.ts` and `web/app/sitemap.ts` handle metadata in Next.js static export instead

---

## Skills Library (`Skills/` and `.cursor/skills/`)

### Registry Overview

| Registry | Entries | Role |
|----------|---------|------|
| `.cursor/skills/skills-registry.yml` | 19 | **Authoritative superset** — includes Cursor-only skills |
| `Skills/skills-registry.yml` | 18 | **Public mirror** — excludes `sync-website-skill` (Cursor-only) |

Both files must be kept in sync for all public skills. Registry version: **4.0.0** (updated 2026-03-10).

### Adding a New Public Skill (7 Steps)

1. **Choose platform directory**: `Skills/<platform>/<slug>/` for new platform-specific skills; `Skills/<slug>/` for legacy Paper skills
2. Create the directory in **both** `Skills/<platform>/<slug>/` and `.cursor/skills/<platform>/<slug>/`
3. Write `SKILL.md` (with YAML frontmatter `name`, `description`) in **both** directories
4. Write `examples.md` with **at least 2 examples** in **both** directories
5. Add an entry to **both** `Skills/skills-registry.yml` and `.cursor/skills/skills-registry.yml` with `status: active`
6. Add `web/data/skills/<slug>.md` with the frontmatter schema above
7. Update `.cursor/rules/minecraft-plugin-agent-skills.mdc` skill count

### Registry Entry Schema

```yaml
- id: skill-id
  version: "1.0.0"
  status: active           # active | planned | deprecated
  platform: paper          # paper | purpur | velocity | waterfall (new field for platform skills)
  category: scaffold
  description: "繁體中文說明 / English description"
  skill_file: platform/skill-id/SKILL.md   # nested for platform skills
  examples_file: platform/skill-id/examples.md
  inputs:
    - name: param_name
      description: "說明"
      required: true
  outputs:
    - name: "FileName.java"
      description: "說明"
  tags: [tag1, tag2]
  trigger_keywords: ["觸發關鍵字1", "trigger keyword 2"]
```

### SKILL.md Structure

```markdown
---
name: skill-id
description: "說明（支援中英混合）"
---

# Skill Title / 技能標題

## 技能名稱 / Skill Name
[slug]

## 目的（1 行）/ Purpose
[核心功能說明 — one sentence, bilingual]

## 觸發條件 / Triggers
[觸發關鍵字 / trigger keywords — both languages]

## 輸入參數 / Inputs
[Table or list of required inputs]

## 輸出產物 / Outputs
[List of generated files]

## 代碼範本 / Code Template
[Full annotated code examples]

## 推薦目錄結構 / Recommended Directory Structure
[Directory layout diagram]

## 失敗回退 / Fallback
[Error handling and fallback guidance]
```

---

## Cursor Agent Rules (`.cursor/rules/`)

Two rule files govern agent behavior:

- **`minecraft-plugin-agent-skills.mdc`** (`alwaysApply: true`): Registers all skills, enforces dual-path sync, defines skill workflow, thread-safety requirements, and platform-path conventions.
- **`Front-End Developer.mdc`**: Front-end development conventions for the web app.

When modifying agent behavior or adding skills, update the `.mdc` rule files as well as the registry.

---

## Git Workflow

- Default branch: `main` (both development and CI/CD deploy)
- Feature work: use `claude/*` or descriptive branch names
- Commit messages: use imperative mood, reference skill IDs or component names where relevant
- Never push directly to `main` without passing the CI build

---

## Key Invariants

1. **Registry hierarchy** (intentionally asymmetric):
   - `.cursor/skills/skills-registry.yml` is the **authoritative superset** — 19 skills including Cursor-only (`sync-website-skill`)
   - `Skills/skills-registry.yml` is the **public mirror** — 18 skills, excludes `sync-website-skill`
   - `web/data/skills/*.md` is the **web presentation layer** — independently maintained; use `sync-website-skill` Cursor skill to auto-generate

2. **Dual-path sync**: Every public skill in `Skills/<path>/` must have an identical copy in `.cursor/skills/<path>/`. The only exception is `sync-website-skill` (Cursor-only, no `Skills/` entry).

3. **Path convention**:
   - Legacy Paper skills: `Skills/<slug>/` (flat) — preserved for backward compatibility
   - New platform skills: `Skills/<platform>/<slug>/` (nested) — required for all new skills

4. **Frontmatter completeness**: All 14 required frontmatter fields must be present in `web/data/skills/*.md`.

5. **Thread safety**: All generated Java code must respect platform-specific threading rules (see Workflow Rules above).

6. **Bilingual**: All skill titles, descriptions, and trigger keywords must have both English and Traditional Chinese (繁體中文) values.

7. **No database**: The web app reads directly from the filesystem; do not introduce a database dependency.

8. **Feature-driven web structure**: New web features go into `web/features/<name>/` with `components/`, `api/` (if needed), and `index.ts` barrel. Shared cross-feature code belongs in `web/shared/`. App-shell components (Header, Footer, AppShell) belong in `web/layout/`. Site constants belong in `web/config/site.ts`.
