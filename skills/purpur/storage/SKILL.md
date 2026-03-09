# Storage Skill — Purpur

## Purpose
Reference this skill when implementing storage in a Purpur-targeted plugin. Purpur does not add new storage APIs — all Paper storage mechanisms work identically. This skill documents the `purpur.yml` config file integration and cross-links to Paper storage guides.

## When to Use This Skill
- Reading Purpur-specific settings from `purpur.yml`
- Storing plugin data on a Purpur server
- Deciding between config, PDC, and database on Purpur

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| Same as Paper | All Paper storage APIs apply | `FileConfiguration`, `PersistentDataContainer`, HikariCP |
| `purpur.yml` | Purpur's server config | Not directly accessible via API — read via `config.yml` or own files |

## Code Pattern

All Paper storage patterns work unchanged on Purpur. See:
- [../../paper/storage/config-yml.md](../../paper/storage/config-yml.md) for YAML config
- [../../paper/storage/pdc.md](../../paper/storage/pdc.md) for PersistentDataContainer
- [../../paper/storage/database-hikari.md](../../paper/storage/database-hikari.md) for HikariCP + MySQL/SQLite

### Reading `purpur.yml` from a Plugin (Advanced)

Purpur does not expose `purpur.yml` values through its API. If you need to read Purpur config values:

```java
import org.bukkit.configuration.file.YamlConfiguration;
import java.io.File;

// NOT recommended for production — Purpur may rename keys without notice
File purpurYml = new File("purpur.yml");   // server root, not plugin folder
YamlConfiguration purpurConfig = YamlConfiguration.loadConfiguration(purpurYml);

int afkTimeout = purpurConfig.getInt("gameplay-mechanics.afk-timeout", 0);
```

> **Warning**: Reading `purpur.yml` directly is fragile and couples your plugin to Purpur's internal config format. Prefer storing your own settings in your plugin's `config.yml` and letting server admins cross-reference `purpur.yml` manually.

## Common Pitfalls

- **Assuming a Purpur-only API for storage**: There is none. Use Paper's APIs.
- **Reading `purpur.yml` directly in production**: The file format may change across Purpur versions. Use your plugin's own `config.yml` for plugin settings.

## Version Notes

- **Purpur 1.21.1**: Storage APIs identical to Paper 1.21.1.
- `PersistentDataType.LIST` (Paper 1.21 addition) is available in Purpur 1.21.1.

## Related Skills

- [../../paper/storage/SKILL.md](../../paper/storage/SKILL.md) — Storage overview and decision guide
- [../../paper/storage/config-yml.md](../../paper/storage/config-yml.md) — YAML configuration
- [../../paper/storage/pdc.md](../../paper/storage/pdc.md) — PersistentDataContainer
- [../../paper/storage/database-hikari.md](../../paper/storage/database-hikari.md) — Database setup
- [../OVERVIEW.md](../OVERVIEW.md) — Purpur platform setup
