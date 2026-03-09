# Storage Skill — Paper

## Purpose
Reference this skill to choose the right storage mechanism for a Paper plugin. Covers when to use config files, PersistentDataContainer (PDC), or a full database, and links to detailed implementation guides for each.

## When to Use This Skill
- Deciding where to persist plugin data
- Storing per-entity or per-block metadata
- Managing plugin configuration that users can edit
- Setting up a database for large-scale or cross-server data

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `JavaPlugin#saveDefaultConfig()` | Write bundled `config.yml` to disk if not present | Call in `onEnable` |
| `JavaPlugin#getConfig()` | Get the in-memory `FileConfiguration` | Cached after first load |
| `JavaPlugin#reloadConfig()` | Re-read `config.yml` from disk | For `/reload` support |
| `JavaPlugin#saveConfig()` | Write in-memory config back to disk | After modifying values |
| `ConfigurationSection` | Section of a YAML config | Nested key grouping |
| `PersistentDataContainer` | NBT-backed key-value store on entities/blocks | Persists across restarts |
| `NamespacedKey` | Key for PDC entries | `new NamespacedKey(plugin, "key_name")` |
| `PersistentDataType` | Type descriptor for PDC values | `STRING`, `INTEGER`, `DOUBLE`, `BYTE_ARRAY`, etc. |
| `HikariDataSource` | HikariCP connection pool | For MySQL / SQLite |

## Storage Decision Guide

| Data Type | Recommended Storage | Reason |
|-----------|-------------------|--------|
| Plugin configuration (user-editable) | `config.yml` / `FileConfiguration` | Human-readable, easy to edit |
| Per-entity or per-block metadata | `PersistentDataContainer` | Tied to entity lifetime, no separate DB needed |
| Per-player persistent data (small) | PDC on `OfflinePlayer` | Stored in player data files |
| Per-player persistent data (large / queried) | Database (HikariCP) | Enables cross-server queries, bulk operations |
| Cross-server shared state | Database (HikariCP + MySQL) | Single source of truth across instances |
| Temporary runtime state | Plain Java `Map<UUID, T>` | Discarded on restart — for caches only |

## Code Pattern

```java
package com.yourorg.myplugin.storage;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public class StorageExamples {

    private final JavaPlugin plugin;

    // --- Config ---

    public void loadConfig() {
        plugin.saveDefaultConfig();                    // write defaults if absent
        FileConfiguration config = plugin.getConfig();
        String greeting = config.getString("messages.greeting", "Welcome!");
        int maxPlayers = config.getInt("limits.max-players", 50);
    }

    // --- PersistentDataContainer ---

    private final NamespacedKey killKey;

    public StorageExamples(JavaPlugin plugin) {
        this.plugin = plugin;
        this.killKey = new NamespacedKey(plugin, "kill_count");
    }

    public void incrementKills(Player player) {
        PersistentDataContainer pdc = player.getPersistentDataContainer();
        int current = pdc.getOrDefault(killKey, PersistentDataType.INTEGER, 0);
        pdc.set(killKey, PersistentDataType.INTEGER, current + 1);
        // No manual save needed — persisted automatically with the player data
    }

    public int getKills(Player player) {
        return player.getPersistentDataContainer()
            .getOrDefault(killKey, PersistentDataType.INTEGER, 0);
    }
}
```

## Common Pitfalls

- **Not calling `saveConfig()` after `set()`**: `getConfig().set(key, value)` modifies only the in-memory object. Call `saveConfig()` to persist to disk, or data is lost on restart.

- **Creating `NamespacedKey` with plugin-unrelated namespaces**: Always use `new NamespacedKey(plugin, "name")`. Using `NamespacedKey.minecraft("name")` will create keys in the `minecraft:` namespace, which may conflict with vanilla data or other plugins.

- **Reading PDC on async threads**: PDC reads/writes are technically possible off the main thread, but the entity must not be modified concurrently. Safest: always access PDC on the main thread.

- **Using raw Java `HashMap` for persistent data**: In-memory maps are cleared on restart. Use PDC for entity-bound data or a database for anything that must survive restarts.

- **Blocking the main thread with database queries**: All SQL calls must run asynchronously. See [database-hikari.md](database-hikari.md) for the async pattern.

## Version Notes

- **1.21**: `PersistentDataType` added `LIST` and `TAG_CONTAINER` compound types for nested structured data.
- **1.21.1**: No breaking changes to storage API.
- **Both**: `config.yml` + YAML API is unchanged from older Paper versions.

## Related Skills

- [config-yml.md](config-yml.md) — Full FileConfiguration and multi-file config setup
- [pdc.md](pdc.md) — PersistentDataContainer deep dive including custom types
- [database-hikari.md](database-hikari.md) — HikariCP setup, async queries, SQLite/MySQL
- [../OVERVIEW.md](../OVERVIEW.md) — Platform setup and Gradle template
