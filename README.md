# MPS — Minecraft Plugin Studio

**AI-powered development toolkit for Minecraft plugin development across Paper, Purpur, Velocity, and Waterfall.**

MPS is a curated library of [Cursor Agent Skills](https://docs.cursor.com/agent/skills) that automate common Minecraft plugin development tasks — from project scaffolding to CI/CD deployment — across all major server and proxy platforms.

> 繁體中文說明請見 [README.zh-TW.md](README.zh-TW.md)

---

## Features

**Paper / Spigot (Backend)**
- **Scaffold** — Generate a complete Maven plugin project (pom.xml, plugin.yml, main class)
- **Commands** — Generate `CommandExecutor` + `TabCompleter` with sub-command routing and permission checks
- **Events** — Generate `@EventHandler` listener skeletons with `EventPriority` and field access examples
- **Config** — Generate structured `config.yml` + `ConfigManager` class
- **Messages** — Generate `messages.yml` + `MessageManager` supporting MiniMessage / Legacy formats
- **Permissions** — Generate `PermissionManager` + `plugin.yml` permission node declarations
- **Database** — Generate SQLite / MySQL dual-mode `DatabaseManager` with HikariCP connection pool
- **Integration** — Generate PlaceholderAPI `Expansion` class; produce correct Paper API call code; integrate Vault economy API
- **Testing** — Generate JUnit 5 + MockBukkit test suite skeleton
- **DevOps** — Generate GitHub Actions CI/CD workflow (build → test → release JAR)

**Platform-Specific**
- **Purpur** — Purpur-specific API code generation (PlayerAFKEvent, purpur.yml, runtime guards)
- **Velocity** — Velocity proxy plugin scaffold, `@Subscribe` event listeners, PluginMessageEvent handler
- **Waterfall** — Waterfall/BungeeCord proxy plugin scaffold, BungeeCord channel handler

---

## Skills

### Paper / Spigot Skills

| Skill | Category | Description |
|-------|----------|-------------|
| [`generate-plugin-skeleton`](Skills/generate-plugin-skeleton/SKILL.md) | scaffold | Complete Maven plugin project: `pom.xml`, `plugin.yml`, main class |
| [`generate-command-handler`](Skills/generate-command-handler/SKILL.md) | command | `CommandExecutor` + `TabCompleter` with sub-command routing, permissions, argument validation |
| [`generate-event-listener`](Skills/generate-event-listener/SKILL.md) | event | `Listener` skeleton with `@EventHandler`, `EventPriority`, `ignoreCancelled`, field access examples |
| [`generate-config-yml`](Skills/generate-config-yml/SKILL.md) | config | Structured `config.yml` with defaults and `ConfigManager` class |
| [`generate-message-system`](Skills/generate-message-system/SKILL.md) | config | `messages.yml` + `MessageManager` — MiniMessage and Legacy format, PlaceholderAPI support |
| [`generate-permission-system`](Skills/generate-permission-system/SKILL.md) | permission | `PermissionManager` + `plugin.yml` permission nodes with inheritance tree |
| [`generate-database-manager`](Skills/generate-database-manager/SKILL.md) | database | SQLite / MySQL dual-mode `DatabaseManager` with HikariCP, async queries, CRUD examples |
| [`generate-placeholder-expansion`](Skills/generate-placeholder-expansion/SKILL.md) | integration | PlaceholderAPI `Expansion` class with placeholder routing logic |
| [`spigot-paper-api-caller`](Skills/spigot-paper-api-caller/SKILL.md) | integration | Correct Paper Java API usage — events, schedulers, NBT, Adventure API |
| [`integrate-vault`](Skills/integrate-vault/SKILL.md) | integration | Vault economy API integration — `EconomyManager`, deposit/withdraw, balance query |
| [`generate-test-suite`](Skills/generate-test-suite/SKILL.md) | testing | JUnit 5 + MockBukkit test suite: `pom.xml` dependencies, server init, player/event/command tests |
| [`generate-cicd-workflow`](Skills/generate-cicd-workflow/SKILL.md) | devops | GitHub Actions workflow: build, test, and auto-release JAR on tag push |

### Platform-Specific Skills

| Skill | Platform | Category | Description |
|-------|----------|----------|-------------|
| [`purpur-api-caller`](Skills/purpur/purpur-api-caller/SKILL.md) | Purpur | integration | Purpur-specific API code — `PlayerAFKEvent`, `purpur.yml`, runtime platform guards |
| [`generate-velocity-plugin-skeleton`](Skills/velocity/generate-velocity-plugin-skeleton/SKILL.md) | Velocity | scaffold | Velocity proxy plugin Gradle skeleton — `@Plugin`, Guice injection, `velocity-plugin.json` |
| [`generate-proxy-event-listener`](Skills/velocity/generate-proxy-event-listener/SKILL.md) | Velocity | event | `@Subscribe` event listener — `LoginEvent`, `ServerConnectedEvent`, `PlayerChooseInitialServerEvent` |
| [`generate-plugin-message-handler`](Skills/velocity/generate-plugin-message-handler/SKILL.md) | Velocity | integration | `PluginMessageEvent` handler — `MinecraftChannelIdentifier`, `ByteStreams`, proxy-to-backend messaging |
| [`generate-waterfall-plugin-skeleton`](Skills/waterfall/generate-waterfall-plugin-skeleton/SKILL.md) | Waterfall | scaffold | Waterfall/BungeeCord proxy plugin Gradle skeleton — extends `Plugin`, `plugin.yml` |
| [`generate-bungeecord-channel`](Skills/waterfall/generate-bungeecord-channel/SKILL.md) | Waterfall | integration | BungeeCord channel handler — custom channels, built-in sub-channels, `ByteStreams` serialization |

---

## Quick Start

Open a Cursor Agent chat and describe your need in natural language. The agent will automatically load the matching Skill:

```
Create a plugin skeleton named MyPlugin targeting MC 1.21
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

Integrate Vault economy API
→ applies integrate-vault

Create a Velocity proxy plugin for my network
→ applies generate-velocity-plugin-skeleton

Listen for LoginEvent and ServerConnectedEvent on Velocity
→ applies generate-proxy-event-listener

Handle plugin messaging between Velocity and backend servers
→ applies generate-plugin-message-handler

Create a Waterfall/BungeeCord proxy plugin
→ applies generate-waterfall-plugin-skeleton

Set up a BungeeCord plugin messaging channel
→ applies generate-bungeecord-channel
```

---

## Repository Structure

```
MPS/
├── README.md                            ← This file (English)
├── README.zh-TW.md                      ← Traditional Chinese version
├── Skills/                              ← Canonical Skill definitions (18 skills)
│   ├── README.md
│   ├── skills-registry.yml              ← Skills index (category / inputs / outputs)
│   ├── _shared/                         ← Cross-platform shared patterns
│   │   ├── async-patterns.md
│   │   └── cross-server-messaging.md
│   ├── paper/PLATFORM.md                ← Paper build setup and API reference
│   ├── purpur/
│   │   ├── PLATFORM.md                  ← Purpur build setup and API reference
│   │   └── purpur-api-caller/SKILL.md
│   ├── velocity/
│   │   ├── PLATFORM.md                  ← Velocity build setup and API reference
│   │   ├── generate-velocity-plugin-skeleton/SKILL.md
│   │   ├── generate-proxy-event-listener/SKILL.md
│   │   └── generate-plugin-message-handler/SKILL.md
│   ├── waterfall/
│   │   ├── PLATFORM.md                  ← Waterfall build setup and API reference
│   │   ├── generate-waterfall-plugin-skeleton/SKILL.md
│   │   └── generate-bungeecord-channel/SKILL.md
│   └── [12 legacy flat skills]          ← Paper/Spigot skills (flat layout)
├── docs/                                ← Supplementary API reference (read-only)
│   ├── CONVENTIONS.md
│   ├── paper/
│   ├── purpur/
│   ├── velocity/
│   └── waterfall/
├── .cursor/
│   ├── rules/
│   │   └── minecraft-plugin-agent-skills.mdc   ← Agent behavior rules
│   └── skills/                                 ← Cursor Agent runtime (19 skills)
│       └── skills-registry.yml
└── web/                                 ← Next.js documentation site
```

---

## Contributing

1. Fork this repository
2. Create a new Skill directory under both `Skills/<platform>/<slug>/` and `.cursor/skills/<platform>/<slug>/`
3. Write `SKILL.md` (with YAML frontmatter `name` and `description`) and `examples.md` (at least 2 examples)
4. Add an entry to both `Skills/skills-registry.yml` and `.cursor/skills/skills-registry.yml` with `status: active`
5. Open a Pull Request

See [`.cursor/rules/minecraft-plugin-agent-skills.mdc`](.cursor/rules/minecraft-plugin-agent-skills.mdc) for the full contribution specification.

---

## License

This project is released under the [LICENSE](LICENSE).
