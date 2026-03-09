# Multi-Platform Minecraft Skills Library

A reference library for building Minecraft server plugins and proxy plugins across Paper, Purpur, Velocity, and Waterfall platforms. Designed for use by Claude Code as a code-generation guide and by human developers as technical reference.

---

## Directory Structure

```
skills/
├── README.md                        ← This file
├── CONVENTIONS.md                   ← Global naming, package structure, Gradle templates
│
├── paper/
│   ├── OVERVIEW.md                  ← Paper setup: deps, plugin.yml, main class, API diff
│   ├── events/
│   │   ├── SKILL.md                 ← Event system overview & Claude Code guide
│   │   ├── player-events.md         ← PlayerJoinEvent, PlayerQuitEvent, PlayerMoveEvent, etc.
│   │   ├── world-events.md          ← ChunkLoadEvent, BlockBreakEvent, EntityDamageEvent, etc.
│   │   ├── custom-events.md         ← Creating & firing custom events
│   │   └── async-events.md          ← AsyncChatEvent, threading rules
│   ├── commands/
│   │   ├── SKILL.md                 ← Commands overview, Brigadier vs legacy
│   │   ├── brigadier-commands.md    ← Paper 1.21 native Brigadier system
│   │   └── command-completion.md    ← Tab completion & SuggestionProvider
│   ├── storage/
│   │   ├── SKILL.md                 ← Storage overview, when to use each approach
│   │   ├── config-yml.md            ← FileConfiguration, ConfigurationSection
│   │   ├── pdc.md                   ← PersistentDataContainer full usage
│   │   └── database-hikari.md       ← HikariCP + MySQL/SQLite connection pooling
│   └── messaging/
│       ├── SKILL.md                 ← Plugin messaging overview
│       └── plugin-channels.md       ← PluginMessageChannel & BungeeCord communication
│
├── purpur/
│   ├── OVERVIEW.md                  ← Purpur-specific APIs, extends Paper
│   ├── events/
│   │   └── SKILL.md                 ← Purpur-only events
│   ├── commands/
│   │   └── SKILL.md                 ← Purpur command extensions
│   └── storage/
│       └── SKILL.md                 ← Purpur config extensions
│
├── velocity/
│   ├── OVERVIEW.md                  ← Velocity setup: deps, plugin.json, main class, API diff
│   ├── events/
│   │   ├── SKILL.md                 ← Velocity event system overview
│   │   ├── connection-events.md     ← LoginEvent, ServerConnectedEvent, PreLoginEvent
│   │   └── proxy-events.md          ← PostLoginEvent, DisconnectEvent, initial server selection
│   ├── commands/
│   │   ├── SKILL.md                 ← Velocity commands overview
│   │   └── velocity-commands.md     ← SimpleCommand, RawCommand, BrigadierCommand
│   ├── storage/
│   │   └── SKILL.md                 ← Velocity storage (no Bukkit APIs)
│   └── messaging/
│       ├── SKILL.md                 ← Plugin messaging overview
│       └── plugin-messages.md       ← PluginMessageEvent & backend communication
│
└── waterfall/
    ├── OVERVIEW.md                  ← Waterfall setup & comparison with Velocity
    ├── events/
    │   └── SKILL.md                 ← BungeeCord event system
    └── messaging/
        ├── SKILL.md                 ← Waterfall plugin messaging overview
        └── bungeecord-channels.md   ← BungeeCord channel protocol & SubChannels
```

---

## How Claude Code Uses This Library

When generating Minecraft plugin code, Claude Code should:

| Task | Consult |
|------|---------|
| Setting up a new Paper plugin | `paper/OVERVIEW.md` |
| Handling player or world events | `paper/events/SKILL.md` → specific event file |
| Registering commands (Paper 1.21+) | `paper/commands/brigadier-commands.md` |
| Tab completion logic | `paper/commands/command-completion.md` |
| Saving plugin config | `paper/storage/config-yml.md` |
| Persisting data on entities/blocks | `paper/storage/pdc.md` |
| MySQL/SQLite with connection pooling | `paper/storage/database-hikari.md` |
| Cross-server communication | `paper/messaging/plugin-channels.md` |
| Using Purpur-specific APIs | `purpur/OVERVIEW.md` + `purpur/events/SKILL.md` |
| Setting up a Velocity proxy plugin | `velocity/OVERVIEW.md` |
| Velocity event handling | `velocity/events/connection-events.md` or `proxy-events.md` |
| Velocity proxy commands | `velocity/commands/velocity-commands.md` |
| Velocity ↔ backend messaging | `velocity/messaging/plugin-messages.md` |
| Setting up a Waterfall plugin | `waterfall/OVERVIEW.md` |
| BungeeCord channel protocol | `waterfall/messaging/bungeecord-channels.md` |
| Naming conventions / package structure | `CONVENTIONS.md` |

---

## Version Compatibility Matrix

| Feature | Paper 1.21 | Paper 1.21.1 | Purpur 1.21.1 |
|---------|-----------|--------------|---------------|
| Brigadier Commands (native) | ✓ `LifecycleEvents.COMMANDS` | ✓ same | ✓ inherits Paper |
| `AsyncChatEvent` | ✓ | ✓ | ✓ |
| `AsyncPlayerChatEvent` | Deprecated | Deprecated | Deprecated |
| `PlayerMoveEvent` (fine-grained) | ✓ `hasExplicitlyMoved()` | ✓ | ✓ |
| `PersistentDataContainer` custom types | ✓ | ✓ | ✓ |
| Folia compatibility | Partial | Partial | ✗ |

| Feature | Velocity 3.3 | Waterfall 1.21 |
|---------|-------------|---------------|
| Modern forwarding | ✓ (recommended) | ✗ (BungeeCord forwarding only) |
| Native Brigadier | ✓ `BrigadierCommand` | Partial |
| Plugin channels | ✓ `PluginMessageEvent` | ✓ `PluginMessageEvent` |
| Adventure API | ✓ native | Partial (via adapter) |
| Event cancellation | `ResultedEvent` pattern | `Cancellable` pattern |

---

## Contributing a New Skill File

1. **SKILL.md** — every topic directory must have one. Follow this structure exactly:

   ```markdown
   # [Topic] Skill — [Platform]

   ## Purpose
   One sentence explaining what this skill covers and when to reference it.

   ## When to Use This Skill
   - Condition one
   - Condition two

   ## API Quick Reference
   | Class / Method | Purpose | Notes |
   |---------------|---------|-------|

   ## Code Pattern
   ```java
   // Complete runnable example with imports and edge case handling
   ```

   ## Common Pitfalls
   - Pitfall (cause + correct approach)

   ## Version Notes
   - 1.21: ...
   - 1.21.1: ...

   ## Related Skills
   - [relative link to related SKILL.md]
   ```

2. **Topic files** (e.g., `player-events.md`) — detailed reference for a specific API area. Include:
   - Full class/method signatures
   - At least one complete, runnable Java 21 example
   - Thread-safety notes where applicable

3. **Java code rules**:
   - Java 21 syntax (records, sealed classes, pattern matching where appropriate)
   - Correct import statements included
   - Thread safety respected: main thread for Bukkit objects, async for IO/DB
   - Gradle Groovy DSL for all build file examples (not Kotlin DSL)

4. **Naming**: file names use kebab-case (e.g., `player-events.md`)
