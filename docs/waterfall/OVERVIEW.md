# Waterfall Platform Overview

Waterfall is a BungeeCord fork by PaperMC with stability and performance improvements. It serves as a proxy between players and backend Minecraft servers. While Velocity is recommended for new projects, Waterfall is widely used and required for networks that need BungeeCord compatibility.

---

## When to Use Waterfall vs Velocity

| Factor | Choose Waterfall | Choose Velocity |
|--------|-----------------|----------------|
| Existing BungeeCord plugins | Yes — drop-in compatible | No — requires porting |
| Modern forwarding | No (BungeeCord IP forwarding only) | Yes (recommended) |
| Performance at scale | Good | Better |
| API maturity | Stable, older API | Modern, actively developed |
| Adventure API | Via adapter (`adventure-platform-bungeecord`) | Native |
| Reload support | `/breload` (unreliable) | Not supported |

---

## 1. Gradle `build.gradle` Template

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

group = 'com.yourorg.waterfallplugin'
version = '1.0.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

compileJava.options.encoding = 'UTF-8'

repositories {
    // Waterfall API via Sonatype OSS snapshots
    maven { url = 'https://oss.sonatype.org/content/repositories/snapshots' }
    mavenCentral()
}

dependencies {
    // Waterfall API — compileOnly: provided by the proxy at runtime
    compileOnly("io.github.waterfallmc:waterfall-api:1.21-R0.1-SNAPSHOT")
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.waterfallplugin.libs.hikari'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

---

## 2. `plugin.yml` Template

Waterfall uses a `plugin.yml` in the JAR root (different from `velocity-plugin.json`):

```yaml
name: MyWaterfallPlugin
version: '1.0.0-SNAPSHOT'
main: com.yourorg.waterfallplugin.MyPlugin
author: YourName
description: A Waterfall proxy plugin

# Dependencies on other BungeeCord plugins
depends: []
softDepends: []
```

Place this in `src/main/resources/plugin.yml`.

---

## 3. Main Class Template

```java
package com.yourorg.waterfallplugin;

import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.api.plugin.PluginManager;
import java.util.logging.Logger;

public final class MyPlugin extends Plugin {

    // BungeeCord uses java.util.logging, not SLF4J
    private Logger logger;

    @Override
    public void onEnable() {
        this.logger = getLogger();
        logger.info("MyPlugin enabling on Waterfall...");

        PluginManager pm = getProxy().getPluginManager();

        // Register event listeners
        pm.registerListener(this, new ConnectionListener(this));

        // Register commands
        pm.registerCommand(this, new HubCommand(this));

        // Register plugin message channel
        getProxy().registerChannel("myplugin:network");

        logger.info("MyPlugin enabled.");
    }

    @Override
    public void onDisable() {
        logger.info("MyPlugin disabling...");
        // Close resources
        getProxy().unregisterChannel("myplugin:network");
    }
}
```

---

## 4. API Difference Table

### Waterfall vs Velocity

| Feature | Waterfall | Velocity |
|---------|---------|---------|
| Base | BungeeCord fork | Independent rewrite |
| Event system | `@EventHandler` (Bukkit-like), mainly sync | `@Subscribe`, fully async |
| Main class extends | `net.md_5.bungee.api.plugin.Plugin` | `@Plugin` annotated class + Guice |
| Command interface | `Command` (old) / `TabExecutor` | `SimpleCommand`, `RawCommand`, `BrigadierCommand` |
| Adventure | Via `adventure-platform-bungeecord` | Native |
| Player type | `net.md_5.bungee.api.connection.ProxiedPlayer` | `com.velocitypowered.api.proxy.Player` |
| Proxy type | `net.md_5.bungee.api.ProxyServer` | `com.velocitypowered.api.proxy.ProxyServer` |
| Forwarding | BungeeCord IP forwarding (plain) | Modern (HMAC signed) |
| Plugin config | `plugin.yml` in JAR | `velocity-plugin.json` (auto-generated) |
| Logging | `java.util.logging.Logger` | SLF4J `Logger` |
| Data directory | `getDataFolder()` returns `File` | `@DataDirectory` injects `Path` |

### Waterfall vs Paper

| Feature | Paper (Backend) | Waterfall (Proxy) |
|---------|----------------|-----------------|
| Player object | `org.bukkit.entity.Player` | `net.md_5.bungee.api.connection.ProxiedPlayer` |
| Event package | `org.bukkit.event.*` | `net.md_5.bungee.api.event.*` |
| Command base | `CommandExecutor` or Brigadier | `Command` / `TabExecutor` |
| World access | Full | None |
| Plugin messaging | `Player#sendPluginMessage()` | `PluginMessageEvent` |

---

## Related Skills

- [events/SKILL.md](events/SKILL.md) — Waterfall event system
- [messaging/SKILL.md](messaging/SKILL.md) — Plugin messaging on Waterfall
- [messaging/bungeecord-channels.md](messaging/bungeecord-channels.md) — BungeeCord channel protocol
- [../velocity/OVERVIEW.md](../velocity/OVERVIEW.md) — Velocity platform (alternative to Waterfall)
- [../CONVENTIONS.md](../CONVENTIONS.md) — Global conventions
