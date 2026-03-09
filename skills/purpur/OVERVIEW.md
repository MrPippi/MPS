# Purpur Platform Overview

Purpur is a Minecraft server fork that extends Paper with additional configuration options, extra game mechanics, and a small set of additional API. It is API-compatible with Paper — all Paper skills apply to Purpur as well.

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
    // Purpur repository
    maven { url = 'https://repo.purpurmc.org/snapshots' }
    // Paper repository (Purpur API depends on it transitively)
    maven { url = 'https://repo.papermc.io/repository/maven-public/' }
    mavenCentral()
}

dependencies {
    // Purpur API — compileOnly: provided by the server
    compileOnly("org.purpurmc.purpur:purpur-api:1.21.1-R0.1-SNAPSHOT")

    // HikariCP if needed
    implementation("com.zaxxer:HikariCP:5.1.0")
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.pluginname.libs.hikari'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

> **Note**: `purpur-api` transitively includes `paper-api`. You do NOT need to add `paper-api` separately — only use `purpur-api` in your dependencies.

---

## 2. `plugin.yml` Template

Identical to Paper `plugin.yml`:

```yaml
name: MyPurpurPlugin
version: '${version}'
main: com.yourorg.myplugin.MyPlugin
api-version: '1.21'
description: A Purpur plugin
author: YourName

commands:
  mycommand:
    description: My command
    usage: /<command>
    permission: myplugin.command

permissions:
  myplugin.command:
    description: Allows /mycommand
    default: op
```

---

## 3. Main Class Template

Purpur's main class extends `JavaPlugin` exactly like Paper:

```java
package com.yourorg.myplugin;

import org.bukkit.plugin.java.JavaPlugin;
import org.purpurmc.purpur.event.entity.EntityAirChangeEvent;
import org.slf4j.Logger;

public final class MyPlugin extends JavaPlugin {

    private final Logger logger = getSLF4JLogger();

    @Override
    public void onEnable() {
        logger.info("MyPlugin (Purpur) enabling...");

        saveDefaultConfig();

        // Register both Paper and Purpur event listeners
        getServer().getPluginManager().registerEvents(new PurpurEventListener(this), this);

        // Brigadier commands (same as Paper)
        this.getLifecycleManager().registerEventHandler(
            io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents.COMMANDS,
            event -> {
                // register commands here
            }
        );

        logger.info("MyPlugin enabled.");
    }

    @Override
    public void onDisable() {
        logger.info("MyPlugin disabled.");
    }
}
```

---

## 4. API Difference Table

### Purpur vs Paper

| Feature | Paper 1.21 | Purpur 1.21 |
|---------|-----------|------------|
| API base | Paper API | Extends Paper API |
| Purpur events package | — | `org.purpurmc.purpur.event.*` |
| Entity AFK events | — | `PlayerAFKEvent` |
| Rideable mob config | — | `purpur.yml` per-entity rideable settings |
| Entity leap / attack events | Limited | Extended via Purpur events |
| Spectral arrow config | Standard | Configurable duration, range in `purpur.yml` |
| Mob brain API | — | Extended mob AI config via `purpur.yml` |
| Sleep mechanic tweaks | Standard | Configurable via `purpur.yml` |
| Build artifacts | `paper-api` | `purpur-api` (includes `paper-api`) |

### Purpur-Specific Configuration (`purpur.yml`)

Purpur adds `purpur.yml` alongside `paper.yml` and `bukkit.yml`. Key sections:

```yaml
mobs:
  zombie:
    ridable: false
    ridable-in-water: false
    takes-damage-from-water: false
    max-health: 20.0
    scale: 1.0
  # ... per-entity settings
gameplay-mechanics:
  use-better-mending: false
  afk-timeout: 300    # seconds until PlayerAFKEvent fires
  # ...
```

> Purpur's primary value is in server-side configuration. The API additions are relatively small — most Purpur plugins still use Paper API for the vast majority of their code.

### Purpur-Only Events

| Event | Package | Fires When |
|-------|---------|-----------|
| `PlayerAFKEvent` | `org.purpurmc.purpur.event.player` | Player goes AFK (configurable timeout) |
| `PlayerNotAFKEvent` | same | Player returns from AFK |
| `EntityAirChangeEvent` | `org.purpurmc.purpur.event.entity` | Entity's air supply changes |
| `EntityDamageByBlockEvent` extensions | same | Purpur-extended damage causes |

See [events/SKILL.md](events/SKILL.md) for full Purpur event reference.

---

## Targeting Purpur-Only Features Safely

If your plugin should work on both Paper and Purpur, use reflection or a feature-detection guard:

```java
// Check if Purpur API is available at runtime
boolean isPurpur;
try {
    Class.forName("org.purpurmc.purpur.event.player.PlayerAFKEvent");
    isPurpur = true;
} catch (ClassNotFoundException e) {
    isPurpur = false;
}

if (isPurpur) {
    getServer().getPluginManager().registerEvents(new PurpurAfkListener(this), this);
}
```

---

## Related Skills

- [events/SKILL.md](events/SKILL.md) — Purpur events overview
- [commands/SKILL.md](commands/SKILL.md) — Commands (same as Paper Brigadier)
- [storage/SKILL.md](storage/SKILL.md) — Storage (same as Paper)
- [../paper/OVERVIEW.md](../paper/OVERVIEW.md) — Paper platform overview
- [../CONVENTIONS.md](../CONVENTIONS.md) — Global conventions
