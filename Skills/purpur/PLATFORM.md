# Purpur Platform Overview

Purpur is a Minecraft server fork that extends Paper with additional configuration options, extra game mechanics, and a small set of additional API. It is API-compatible with Paper — all Paper skills apply to Purpur as well.

- **Javadoc**: https://purpurmc.org/docs/purpur/
- **Repository**: https://repo.purpurmc.org/snapshots

---

## 1. `build.gradle` Template

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
    // NOTE: purpur-api includes paper-api. Do NOT add paper-api separately.
    compileOnly("org.purpurmc.purpur:purpur-api:1.21.1-R0.1-SNAPSHOT")

    // HikariCP if needed (shade it)
    implementation("com.zaxxer:HikariCP:5.1.0")
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.pluginname.libs.hikari'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

> `purpur-api` transitively includes `paper-api`. Do **not** add `paper-api` separately — only declare `purpur-api`.

---

## 2. `plugin.yml` Template

Identical to Paper — Purpur uses the same `plugin.yml` format:

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
import org.purpurmc.purpur.event.player.PlayerAFKEvent;
import org.slf4j.Logger;

public final class MyPlugin extends JavaPlugin {

    private final Logger logger = getSLF4JLogger();

    @Override
    public void onEnable() {
        logger.info("MyPlugin (Purpur) enabling...");

        saveDefaultConfig();

        // Register both Paper and Purpur event listeners
        getServer().getPluginManager().registerEvents(new PurpurEventListener(this), this);

        // Check if Purpur API is available at runtime (for Paper/Purpur dual-compatibility)
        if (isPurpurAvailable()) {
            getServer().getPluginManager().registerEvents(new PurpurAfkListener(this), this);
        }

        // Brigadier commands (same as Paper)
        this.getLifecycleManager().registerEventHandler(
            io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents.COMMANDS,
            event -> { /* register commands here */ }
        );

        logger.info("MyPlugin enabled.");
    }

    @Override
    public void onDisable() {
        logger.info("MyPlugin disabled.");
    }

    /** Runtime check — lets the same JAR run on Paper without crashing. */
    public static boolean isPurpurAvailable() {
        try {
            Class.forName("org.purpurmc.purpur.event.player.PlayerAFKEvent");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }
}
```

---

## 4. Key Differences from Paper

### Purpur-Specific Events

| Event | Package | Fires When |
|-------|---------|-----------|
| `PlayerAFKEvent` | `org.purpurmc.purpur.event.player` | Player goes AFK (configurable timeout) |
| `PlayerNotAFKEvent` | same | Player returns from AFK |
| `EntityAirChangeEvent` | `org.purpurmc.purpur.event.entity` | Entity's air supply changes |

### Purpur-Only Configuration (`purpur.yml`)

```yaml
mobs:
  zombie:
    ridable: false
    ridable-in-water: false
    takes-damage-from-water: false
    max-health: 20.0
gameplay-mechanics:
  use-better-mending: false
  afk-timeout: 300    # seconds until PlayerAFKEvent fires
```

### API Quick Reference

| Feature | Paper 1.21 | Purpur 1.21 |
|---------|-----------|------------|
| API base | Paper API | Extends Paper API |
| Extra events package | — | `org.purpurmc.purpur.event.*` |
| AFK detection | Manual | `PlayerAFKEvent` |
| Entity ridability | Not exposed | `purpur.yml` per-entity config |
| Build artifact | `paper-api` | `purpur-api` (superset) |

> **Design rule**: Purpur's primary value is server-side configuration. The additional API surface is small. Always check if Paper API already handles your use case before reaching for Purpur-specific classes.

---

## 5. Skills for Purpur

| Skill | File |
|-------|------|
| Purpur API caller | `Skills/purpur/purpur-api-caller/SKILL.md` |
| All Paper skills | Apply unchanged — Purpur is API-compatible with Paper |

For Paper API reference (which also applies to Purpur): see `Skills/paper/PLATFORM.md` and `skills/purpur/`.
