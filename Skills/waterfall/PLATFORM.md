# Waterfall Platform Overview

Waterfall is a BungeeCord fork by PaperMC with stability and performance improvements. It serves as a proxy between players and backend Minecraft servers. While Velocity is recommended for new projects, Waterfall is widely used and required for networks that need BungeeCord compatibility.

- **Javadoc**: https://jd.papermc.io/waterfall/1.21/
- **Repository**: https://oss.sonatype.org/content/repositories/snapshots

---

## When to Use Waterfall vs Velocity

| Factor | Choose Waterfall | Choose Velocity |
|--------|-----------------|----------------|
| Existing BungeeCord plugins | Yes — drop-in compatible | No — requires porting |
| Modern forwarding | No (BungeeCord IP forwarding only) | Yes (recommended) |
| Performance at scale | Good | Better |
| Adventure API | Via adapter | Native |
| API maturity | Stable, older API | Modern, actively developed |

---

## 1. `build.gradle` Template

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

    // Optional: Adventure adapter for rich text (shade it)
    implementation("net.kyori:adventure-platform-bungeecord:4.3.2")
}

shadowJar {
    relocate 'net.kyori.adventure', 'com.yourorg.waterfallplugin.libs.adventure'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

---

## 2. `plugin.yml` Template

Waterfall uses a `plugin.yml` placed in `src/main/resources/plugin.yml` inside the JAR:

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

> Unlike Paper, Waterfall's `plugin.yml` does **not** support `api-version`.

---

## 3. Main Class Template

```java
package com.yourorg.waterfallplugin;

import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.api.plugin.PluginManager;
import java.util.logging.Logger;

public final class MyPlugin extends Plugin {

    // Waterfall uses java.util.logging, NOT SLF4J
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
        getProxy().unregisterChannel("myplugin:network");
    }
}
```

---

## 4. Key Differences from Velocity

### Waterfall vs Velocity

| Feature | Waterfall | Velocity |
|---------|---------|---------|
| Base | BungeeCord fork | Independent rewrite |
| Main class extends | `net.md_5.bungee.api.plugin.Plugin` | `@Plugin` annotated class + Guice |
| Event annotation | `@EventHandler` (Bukkit-like) | `@Subscribe` |
| Event system | Mostly sync | Fully async |
| Command interface | `Command` / `TabExecutor` | `SimpleCommand`, `RawCommand`, `BrigadierCommand` |
| Adventure | Via `adventure-platform-bungeecord` | Native |
| Player type | `net.md_5.bungee.api.connection.ProxiedPlayer` | `com.velocitypowered.api.proxy.Player` |
| Proxy type | `net.md_5.bungee.api.ProxyServer` | `com.velocitypowered.api.proxy.ProxyServer` |
| Plugin descriptor | `plugin.yml` | `velocity-plugin.json` (auto-generated) |
| Logging | `java.util.logging.Logger` | SLF4J `Logger` |
| Forwarding | BungeeCord IP forwarding (plain) | Modern (HMAC signed) |

### `ProxyServer` — Core Methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `getPlayers()` | `Collection<ProxiedPlayer>` | All connected players |
| `getPlayer(String)` | `ProxiedPlayer` (nullable) | Player by name |
| `getServerInfo(String)` | `ServerInfo` (nullable) | Backend server by name |
| `getServers()` | `Map<String, ServerInfo>` | All registered backends |
| `getPluginManager()` | `PluginManager` | Register listeners/commands |
| `getScheduler()` | `TaskScheduler` | Schedule tasks |
| `getOnlineCount()` | `int` | Total connected players |
| `registerChannel(String)` | `void` | Register plugin message channel |
| `broadcast(BaseComponent)` | `void` | Broadcast to all connected players |

### Event Listener Pattern

```java
import net.md_5.bungee.api.event.PostLoginEvent;
import net.md_5.bungee.api.plugin.Listener;
import net.md_5.bungee.event.EventHandler;

public class ConnectionListener implements Listener {

    private final MyPlugin plugin;

    public ConnectionListener(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPostLogin(PostLoginEvent event) {
        plugin.getLogger().info(event.getPlayer().getName() + " connected.");
    }
}
```

Register in main class: `getProxy().getPluginManager().registerListener(this, new ConnectionListener(this));`

### Async Scheduling

```java
// BungeeCord: async task
getProxy().getScheduler().runAsync(plugin, () -> {
    // database / IO work — runs off the main thread
});

// Delayed task (20 ticks = 1 second)
getProxy().getScheduler().schedule(plugin, () -> {
    // runs once after delay
}, 1, java.util.concurrent.TimeUnit.SECONDS);
```

---

## 5. Plugin Messaging

Waterfall uses plain string channel names (NOT `MinecraftChannelIdentifier`):

```java
// Register channel
getProxy().registerChannel("myplugin:network");

// Handle in event listener
@EventHandler
public void onPluginMessage(PluginMessageEvent event) {
    if (!"myplugin:network".equals(event.getTag())) return;
    // process event.getData() ...
    event.setCancelled(true);   // prevent forwarding
}
```

See `Skills/waterfall/generate-bungeecord-channel/SKILL.md` for the full pattern.

---

## 6. Skills for Waterfall

| Skill | File |
|-------|------|
| Plugin skeleton | `Skills/waterfall/generate-waterfall-plugin-skeleton/SKILL.md` |
| BungeeCord channel | `Skills/waterfall/generate-bungeecord-channel/SKILL.md` |

Deep API reference: `skills/waterfall/` (events, messaging sub-skills)
