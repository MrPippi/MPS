# Paper Platform Overview

Paper is a high-performance Minecraft server platform that extends Spigot/Bukkit with additional API surface, async chunk loading, and performance improvements. It is the recommended backend platform for 1.21+ servers.

---

## 1. Gradle `build.gradle` Template

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '8.1.1'   // only if bundling deps
}

group = 'com.yourorg.pluginname'
version = '1.0.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

compileJava.options.encoding = 'UTF-8'

repositories {
    maven { url = 'https://repo.papermc.io/repository/maven-public/' }
    mavenCentral()
}

dependencies {
    // Paper API — compileOnly: provided by the server at runtime
    compileOnly("io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT")

    // Optional: HikariCP for database connection pooling (must be shaded)
    implementation("com.zaxxer:HikariCP:5.1.0")

    // Optional: SQLite driver (must be shaded)
    implementation("org.xerial:sqlite-jdbc:3.45.3.0")
}

// If using shadowJar:
shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.pluginname.libs.hikari'
    relocate 'org.sqlite',         'com.yourorg.pluginname.libs.sqlite'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

---

## 2. `plugin.yml` Template

```yaml
name: MyPlugin
version: '${version}'
main: com.yourorg.myplugin.MyPlugin
api-version: '1.21'
description: A brief description of your plugin
author: YourName
website: https://example.com

# Declare commands here (for legacy CommandExecutor)
# For Brigadier commands registered via LifecycleEvents, commands block is optional
commands:
  mycommand:
    description: My command description
    usage: /<command> [args]
    permission: myplugin.command

# Permissions
permissions:
  myplugin.command:
    description: Allows using /mycommand
    default: op
  myplugin.admin:
    description: Admin-level access
    default: op

# Plugin dependencies
depend: []        # hard dependencies (plugin won't load without these)
softdepend: []    # soft dependencies (loaded first if present)
```

> **Note**: Set `api-version` to `'1.21'` for Paper 1.21.x. Using an older version disables some Paper-specific API optimizations.

---

## 3. Main Class Template

```java
package com.yourorg.myplugin;

import org.bukkit.plugin.java.JavaPlugin;
import org.slf4j.Logger;

public final class MyPlugin extends JavaPlugin {

    private static MyPlugin instance;

    // Use SLF4J logger (available in Paper 1.18+)
    private final Logger logger = getSLF4JLogger();

    @Override
    public void onLoad() {
        // Called before onEnable, before world loading.
        // Use for: NMS setup, registering custom types.
        instance = this;
    }

    @Override
    public void onEnable() {
        logger.info("MyPlugin enabling...");

        // 1. Save default config
        saveDefaultConfig();

        // 2. Register event listeners
        getServer().getPluginManager().registerEvents(new PlayerJoinListener(this), this);

        // 3. Register commands (Brigadier, Paper 1.21+)
        registerCommands();

        // 4. Initialize storage
        // database = new DatabaseManager(this);

        logger.info("MyPlugin enabled successfully.");
    }

    @Override
    public void onDisable() {
        logger.info("MyPlugin disabling...");
        // Close resources: database connections, schedulers, etc.
        // database.close();
    }

    private void registerCommands() {
        // See paper/commands/brigadier-commands.md
        this.getLifecycleManager().registerEventHandler(
            io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents.COMMANDS,
            event -> {
                // register commands here
            }
        );
    }

    public static MyPlugin getInstance() {
        return instance;
    }
}
```

---

## 4. API Difference Table

### Paper vs Spigot/Bukkit

| Feature | Bukkit/Spigot | Paper 1.21 |
|---------|--------------|------------|
| Chat events | `AsyncPlayerChatEvent` (deprecated) | `AsyncChatEvent` (Adventure) |
| Command system | `CommandExecutor` | Native Brigadier (`LifecycleEvents.COMMANDS`) |
| Chunk API | Synchronous only | Async chunk loading (`getChunkAtAsync`) |
| Adventure API | Optional adapter | Built-in natively |
| Tick scheduling | `BukkitScheduler` | `BukkitScheduler` + `RegionScheduler` (Folia) |
| Component text | `ChatColor` (legacy) | `Component` (Adventure) |
| Entity persistence | `Metadatable` (volatile) | `PersistentDataContainer` (NBT-backed) |
| Packet API | Not exposed | `PacketEvents` / NMS access available |
| Thread model | Main thread | Main thread + async support |

### Paper vs Purpur

| Feature | Paper 1.21 | Purpur 1.21 |
|---------|-----------|------------|
| API base | Paper API | Extends Paper API |
| Extra events | — | `PlayerAFKEvent`, `PlayerFishEvent` extensions, etc. |
| Entity config | Limited | Per-entity-type config in `purpur.yml` |
| Rideable entities | — | Built-in rideable mobs |
| Spectral arrows | Standard | Config-tweakable |
| Build artifacts | `paper-api` | `purpur-api` |

### Paper vs Velocity/Waterfall

| Feature | Paper | Velocity | Waterfall |
|---------|-------|---------|-----------|
| Purpose | Backend game server | Proxy (routing) | Proxy (routing) |
| Player login events | `PlayerJoinEvent` | `PostLoginEvent` | `PostLoginEvent` |
| World/entity access | Full | None (proxy only) | None (proxy only) |
| Plugin messaging source | Server-side | Proxy-side | Proxy-side |
| Command system | Brigadier | SimpleCommand / BrigadierCommand | TabExecutor |
| Async model | Mainly sync (main thread) | Fully async | Mainly sync |
| Forwarding | Accepts forwarding | Sends forwarding headers | Sends forwarding headers |

---

## Related Skills

- [events/SKILL.md](events/SKILL.md) — Event system overview
- [commands/SKILL.md](commands/SKILL.md) — Commands overview
- [storage/SKILL.md](storage/SKILL.md) — Storage overview
- [messaging/SKILL.md](messaging/SKILL.md) — Plugin messaging overview
- [../CONVENTIONS.md](../CONVENTIONS.md) — Global naming and build conventions
