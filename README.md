# MPS — Minecraft Plugin Studio

**AI-powered development toolkit for Spigot / Paper plugins.**

MPS is a curated library of [Cursor Agent Skills](https://docs.cursor.com/agent/skills) that automate common Bukkit / Spigot / Paper plugin development tasks — from project scaffolding to CI/CD deployment.

> 繁體中文說明請見 [README.zh-TW.md](README.zh-TW.md)

---

## Features

- **Scaffold** — Generate a complete Maven plugin project (pom.xml, plugin.yml, main class)
- **Commands** — Generate `CommandExecutor` + `TabCompleter` with sub-command routing and permission checks
- **Events** — Generate `@EventHandler` listener skeletons with `EventPriority` and field access examples
- **Config** — Generate structured `config.yml` + `ConfigManager` class
- **Messages** — Generate `messages.yml` + `MessageManager` supporting MiniMessage / Legacy formats
- **Permissions** — Generate `PermissionManager` + `plugin.yml` permission node declarations
- **Database** — Generate SQLite / MySQL dual-mode `DatabaseManager` with HikariCP connection pool
- **Integration** — Generate PlaceholderAPI `Expansion` class; produce correct Spigot / Paper API call code
- **Testing** — Generate JUnit 5 + MockBukkit test suite skeleton
- **DevOps** — Generate GitHub Actions CI/CD workflow (build → test → release JAR)

---

## Skills

Skills are organized by category. Each skill generates production-ready Java code and configuration files.

### Scaffold

| Skill | Description |
|-------|-------------|
| [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | Complete Maven plugin project: `pom.xml`, `plugin.yml`, main class |

### Commands & Events

| Skill | Description |
|-------|-------------|
| [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | `CommandExecutor` + `TabCompleter` with sub-command routing, permissions, argument validation |
| [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | `Listener` skeleton with `@EventHandler`, `EventPriority`, `ignoreCancelled`, field access examples |

### Config & Messages & Permissions

| Skill | Description |
|-------|-------------|
| [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | Structured `config.yml` with defaults and `ConfigManager` class |
| [`generate-message-system`](Skills/generate-message-system/SKILL.md) | `messages.yml` + `MessageManager` — MiniMessage and Legacy format, PlaceholderAPI support |
| [`generate-permission-system`](Skills/generate-permission-system/SKILL.md) | `PermissionManager` + `plugin.yml` permission nodes with inheritance tree |

### Database

| Skill | Description |
|-------|-------------|
| [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | SQLite / MySQL dual-mode `DatabaseManager` with HikariCP, async queries, CRUD examples |

### Integration

| Skill | Description |
|-------|-------------|
| [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | PlaceholderAPI `Expansion` class with placeholder routing logic |
| [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | Correct Spigot / Paper Java API usage — events, schedulers, NBT, Adventure API |

### Testing

| Skill | Description |
|-------|-------------|
| [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | JUnit 5 + MockBukkit test suite: `pom.xml` dependencies, server init, player/event/command tests |

### DevOps

| Skill | Description |
|-------|-------------|
| [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | GitHub Actions workflow: build, test, and auto-release JAR on tag push |

---

## Quick Start

Open a Cursor Agent chat and describe your need in natural language. The agent will automatically load the matching Skill:

```
Create a plugin skeleton named MyPlugin targeting MC 1.21.4
→ applies generate-plugin-skeleton

Generate a listener for PlayerJoinEvent
→ applies generate-event-listener

Add /shop buy sell list subcommands
→ applies generate-command-handler

Generate config.yml with economy and cooldown sections
→ applies generate-config-yml

Build a message system using MiniMessage format
→ applies generate-message-system

Add permission nodes myplugin.admin and myplugin.use
→ applies generate-permission-system

Write MockBukkit unit tests for my plugin
→ applies generate-test-suite

Set up GitHub Actions to auto-publish the JAR
→ applies generate-cicd-workflow

Build a DatabaseManager supporting SQLite and MySQL
→ applies generate-database-manager

Write a PlaceholderAPI expansion for %myplugin_balance%
→ applies generate-placeholder-expansion
```

---

## Repository Structure

```
MPS/
├── README.md                          ← This file (English)
├── README.zh-TW.md                    ← Traditional Chinese version
├── Skills/                            ← Human-readable Skill docs (GitHub browsing)
│   ├── README.md
│   ├── skills-registry.yml            ← Skills index (category / inputs / outputs)
│   ├── spigot-paper-api-caller/
│   │   ├── SKILL.md
│   │   └── api-reference.md
│   ├── generate-plugin-skeleton/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── generate-command-handler/
│   │   ├── SKILL.md
│   │   └── examples.md
│   └── ... (one directory per skill)
└── .cursor/
    ├── rules/
    │   └── minecraft-plugin-agent-skills.mdc   ← Agent behavior rules
    └── skills/                                 ← Cursor Agent runtime directory
        ├── skills-registry.yml
        └── ... (mirrors Skills/)
```

---

## Contributing

1. Fork this repository
2. Create a new Skill directory under both `Skills/` and `.cursor/skills/`
3. Write `SKILL.md` (with YAML frontmatter) and `examples.md` (at least 2 examples)
4. Update `.cursor/skills/skills-registry.yml` with `category`, `inputs`, and `outputs`
5. Open a Pull Request

See [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc) for the full contribution specification.

---

## Roadmap

| Milestone | Scope | Status |
|-----------|-------|--------|
| M1 MVP | Skills 01–04, Registry setup | ✅ Done |
| M2 Expand | Skills 05–07, automated testing | ✅ Done |
| M3 Complete | Skills 08–09, javac integration tests | ✅ Done |
| M4 Strengthen | Skills 10–11 (Permission / Message), examples.md, Registry schema v3 | ✅ Done |
| M5 Maintain | Folia support, Skill marketplace, multilingual prompts | 🔲 Planned |

---

## License

This project is released under the [LICENSE](LICENSE).
