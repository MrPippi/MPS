# Config YAML — Paper

Using `FileConfiguration` and `config.yml` for plugin configuration in Paper.

---

## Default Config File

Place `config.yml` in `src/main/resources/config.yml` (bundled with the JAR):

```yaml
# config.yml (default values)
messages:
  join: "<green>Welcome, <player>!</green>"
  quit: "<red><player> has left.</red>"

limits:
  max-homes: 5
  cooldown-seconds: 30

database:
  host: localhost
  port: 3306
  name: myplugin
  user: root
  password: ""

features:
  pvp-protection: true
  spawn-radius: 20
```

---

## Loading Configuration

```java
package com.yourorg.myplugin.storage;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;
import org.slf4j.Logger;

public class ConfigManager {

    private final JavaPlugin plugin;
    private final Logger logger;

    // Cached values
    private String joinMessage;
    private int maxHomes;
    private int cooldown;
    private boolean pvpProtection;
    private int spawnRadius;

    // Database settings
    private String dbHost;
    private int dbPort;
    private String dbName;
    private String dbUser;
    private String dbPassword;

    public ConfigManager(JavaPlugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getSLF4JLogger();
        load();
    }

    public void load() {
        // Write defaults if config.yml does not exist on disk
        plugin.saveDefaultConfig();
        // Reload from disk (picks up changes after /reload)
        plugin.reloadConfig();

        FileConfiguration config = plugin.getConfig();

        joinMessage   = config.getString("messages.join", "<green>Welcome!</green>");
        maxHomes      = config.getInt("limits.max-homes", 5);
        cooldown      = config.getInt("limits.cooldown-seconds", 30);
        pvpProtection = config.getBoolean("features.pvp-protection", true);
        spawnRadius   = config.getInt("features.spawn-radius", 20);

        dbHost     = config.getString("database.host", "localhost");
        dbPort     = config.getInt("database.port", 3306);
        dbName     = config.getString("database.name", "myplugin");
        dbUser     = config.getString("database.user", "root");
        dbPassword = config.getString("database.password", "");

        logger.info("Config loaded. max-homes={}, pvp-protection={}", maxHomes, pvpProtection);
    }

    // Getters
    public String getJoinMessage()   { return joinMessage; }
    public int getMaxHomes()         { return maxHomes; }
    public int getCooldown()         { return cooldown; }
    public boolean isPvpProtection() { return pvpProtection; }
    public int getSpawnRadius()      { return spawnRadius; }

    public String getDbHost()     { return dbHost; }
    public int getDbPort()        { return dbPort; }
    public String getDbName()     { return dbName; }
    public String getDbUser()     { return dbUser; }
    public String getDbPassword() { return dbPassword; }
}
```

---

## Saving Values at Runtime

```java
// Modify in-memory config
plugin.getConfig().set("limits.max-homes", 10);

// Write to disk
plugin.saveConfig();
```

> **Warning**: `saveConfig()` writes the entire config. Any comments in `config.yml` are lost if you overwrite it this way. For comment-preserving edits, consider using a custom YAML library (e.g., `configurate` by Sponge).

---

## Multiple Config Files

For plugins that need more than one YAML file (e.g., `messages.yml`):

```java
package com.yourorg.myplugin.storage;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MessagesConfig {

    private final JavaPlugin plugin;
    private FileConfiguration config;
    private File configFile;

    public MessagesConfig(JavaPlugin plugin) {
        this.plugin = plugin;
        reload();
    }

    public void reload() {
        configFile = new File(plugin.getDataFolder(), "messages.yml");

        if (!configFile.exists()) {
            plugin.saveResource("messages.yml", false);   // copy from JAR
        }

        config = YamlConfiguration.loadConfiguration(configFile);

        // Apply defaults from bundled resource
        InputStream defaultStream = plugin.getResource("messages.yml");
        if (defaultStream != null) {
            config.setDefaults(YamlConfiguration.loadConfiguration(
                new InputStreamReader(defaultStream, StandardCharsets.UTF_8)
            ));
        }
    }

    public String get(String key) {
        return config.getString(key, key);   // fallback to key itself if missing
    }

    public void save() {
        try {
            config.save(configFile);
        } catch (IOException e) {
            plugin.getSLF4JLogger().error("Failed to save messages.yml", e);
        }
    }
}
```

Place `messages.yml` in `src/main/resources/messages.yml` so `plugin.saveResource()` can find it.

---

## ConfigurationSection

For nested YAML structures, use `ConfigurationSection`:

```java
FileConfiguration config = plugin.getConfig();

// Read a section
org.bukkit.configuration.ConfigurationSection dbSection =
    config.getConfigurationSection("database");

if (dbSection != null) {
    String host = dbSection.getString("host", "localhost");
    int port    = dbSection.getInt("port", 3306);
}

// Iterate over all keys in a section
org.bukkit.configuration.ConfigurationSection homesSection =
    config.getConfigurationSection("player-homes");

if (homesSection != null) {
    for (String playerUuid : homesSection.getKeys(false)) {
        // nested keys: player-homes.<uuid>.<home-name>
        org.bukkit.configuration.ConfigurationSection playerHomes =
            homesSection.getConfigurationSection(playerUuid);
        // ...
    }
}
```

---

## Reading Lists

```java
// List<String>
List<String> blockedWorlds = config.getStringList("blocked-worlds");

// List<Integer>
List<Integer> allowedLevels = config.getIntegerList("allowed-levels");

// Default to empty list if key missing
List<String> tags = config.getStringList("tags");   // never null; empty list if absent
```

---

## Common Pitfalls

- **Not calling `saveDefaultConfig()`**: If you only call `getConfig()` without `saveDefaultConfig()`, no `config.yml` is written on first run. Players can't edit a file that doesn't exist.

- **Not calling `saveConfig()` after `set()`**: `set()` modifies only the in-memory `FileConfiguration`. Changes are lost on restart unless `saveConfig()` is called.

- **Null from `getString()` without defaults**: `getString("missing.key")` returns `null` if the key doesn't exist. Always provide a fallback: `getString("key", "defaultValue")`.

- **Hardcoding absolute paths**: Use `plugin.getDataFolder()` for the plugin's directory. Never construct paths like `new File("/plugins/myplugin/config.yml")`.

## Related Skills

- [SKILL.md](SKILL.md) — Storage overview and decision guide
- [pdc.md](pdc.md) — PersistentDataContainer for entity-bound data
- [database-hikari.md](database-hikari.md) — Relational database setup
