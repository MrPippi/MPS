# Velocity Platform Overview

Velocity is a modern, high-performance Minecraft proxy from PaperMC. It routes players between backend servers (Paper, Purpur, etc.) and supports modern forwarding for secure player authentication. It is the recommended proxy for new networks.

- **Javadoc**: https://jd.papermc.io/velocity/3.3.0/
- **Repository**: https://repo.papermc.io/repository/maven-public/

---

## 1. `build.gradle` Template

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

group = 'com.yourorg.proxyplugin'
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
    // Velocity API — compileOnly: provided by the proxy at runtime
    compileOnly("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
    // REQUIRED: generates META-INF/velocity-plugin.json from @Plugin annotation
    annotationProcessor("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.proxyplugin.libs.hikari'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

> The `annotationProcessor` line is **required** — it processes the `@Plugin` annotation on your main class and generates `velocity-plugin.json` inside the JAR at compile time.

---

## 2. Plugin Descriptor

Velocity does NOT use `plugin.yml`. Instead, a `velocity-plugin.json` is **auto-generated** by the annotation processor from the `@Plugin` annotation on your main class. Do not write this file manually.

Example generated `velocity-plugin.json`:
```json
{
  "id": "myplugin",
  "name": "MyPlugin",
  "version": "1.0.0-SNAPSHOT",
  "description": "A Velocity proxy plugin",
  "authors": ["YourName"],
  "dependencies": [],
  "main": "com.yourorg.proxyplugin.MyPlugin"
}
```

---

## 3. Main Class Template

```java
package com.yourorg.proxyplugin;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.ProxyServer;
import org.slf4j.Logger;

import java.nio.file.Path;

@Plugin(
    id          = "myplugin",           // lowercase, alphanumeric + hyphens
    name        = "MyPlugin",
    version     = "1.0.0-SNAPSHOT",
    description = "A Velocity proxy plugin",
    authors     = {"YourName"}
)
public final class MyPlugin {

    private final ProxyServer server;
    private final Logger logger;
    private final Path dataDirectory;

    // Velocity uses Guice for dependency injection — constructor injection required
    @Inject
    public MyPlugin(ProxyServer server, Logger logger, @DataDirectory Path dataDirectory) {
        this.server        = server;
        this.logger        = logger;
        this.dataDirectory = dataDirectory;
    }

    @Subscribe
    public void onProxyInitialize(ProxyInitializeEvent event) {
        logger.info("MyPlugin initialising on Velocity {}...",
            server.getVersion().getVersion());

        // Register event listeners
        server.getEventManager().register(this, new ConnectionListener(server, logger));

        // Register commands
        server.getCommandManager().register(
            server.getCommandManager().metaBuilder("mycommand")
                .plugin(this)
                .build(),
            new MyCommand(server)
        );
    }

    @Subscribe
    public void onProxyShutdown(ProxyShutdownEvent event) {
        logger.info("MyPlugin shutting down.");
        // Close database connections, cancel tasks, etc.
    }

    public ProxyServer getServer()     { return server; }
    public Logger getLogger()          { return logger; }
    public Path getDataDirectory()     { return dataDirectory; }
}
```

---

## 4. Key Differences from Paper

### Velocity vs Waterfall

| Feature | Velocity 3.3 | Waterfall 1.21 |
|---------|-------------|---------------|
| Forwarding | Modern (HMAC-signed) | BungeeCord (IP forwarding, plaintext) |
| Event system | Fully async, `@Subscribe` | Mostly sync, `@EventHandler` |
| Command API | `SimpleCommand`, `RawCommand`, `BrigadierCommand` | `Command` / `TabExecutor` |
| Plugin loading | Guice injection, `@Plugin` annotation | Extends `net.md_5.bungee.api.plugin.Plugin` |
| Adventure | Built-in native | Via `adventure-platform-bungeecord` adapter |
| Plugin descriptor | `velocity-plugin.json` (auto-generated) | `plugin.yml` |
| Logging | SLF4J | `java.util.logging.Logger` |

### Velocity vs Paper

| Feature | Paper (Backend) | Velocity (Proxy) |
|---------|----------------|-----------------|
| Player access | Full game state, inventory, world | Network-level: UUID, name, remote address, current server |
| Event scope | In-game events (block break, chat) | Network events (connect, disconnect, server switch) |
| World access | Full | **None** |
| Scheduling | `BukkitScheduler` | `VelocityScheduledTask` via `Scheduler` |

### `ProxyServer` — Core Methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `getAllPlayers()` | `Collection<Player>` | All connected players |
| `getPlayer(UUID)` | `Optional<Player>` | Player by UUID |
| `getServer(String)` | `Optional<RegisteredServer>` | Backend server by name |
| `getAllServers()` | `Collection<RegisteredServer>` | All registered backends |
| `getEventManager()` | `EventManager` | Register/fire events |
| `getCommandManager()` | `CommandManager` | Register commands |
| `getScheduler()` | `Scheduler` | Schedule tasks |
| `getChannelRegistrar()` | `ChannelRegistrar` | Register plugin message channels |

### Thread Model

Velocity's event system is **fully async** — all `@Subscribe` handlers run on an async thread pool. This means:
- Reading `Player` objects (immutable proxy view) is safe from any thread
- No need to switch to a "main thread" for event handling
- For IO/database work, use `proxyServer.getScheduler().buildTask(...)` or `CompletableFuture`

```java
// Schedule async work from an event handler
proxyServer.getScheduler()
    .buildTask(plugin, () -> {
        String data = database.fetch();    // async IO
    })
    .schedule();
```

---

## 5. Plugin Messaging

Velocity uses `MinecraftChannelIdentifier` (namespaced) for custom channels. Never use `LegacyChannelIdentifier` except for the `BungeeCord` compatibility channel.

```java
// Register the channel
MinecraftChannelIdentifier CHANNEL = MinecraftChannelIdentifier.from("myplugin:proxy");
server.getChannelRegistrar().register(CHANNEL);

// Handle incoming messages
@Subscribe
public void onPluginMessage(PluginMessageEvent event) {
    if (!event.getIdentifier().equals(CHANNEL)) return;
    // process event.getData() ...
    event.setResult(PluginMessageEvent.ForwardResult.handled());
}
```

See `Skills/velocity/generate-plugin-message-handler/SKILL.md` for the full pattern.

---

## 6. Skills for Velocity

| Skill | File |
|-------|------|
| Plugin skeleton | `Skills/velocity/generate-velocity-plugin-skeleton/SKILL.md` |
| Event listener | `Skills/velocity/generate-proxy-event-listener/SKILL.md` |
| Plugin messaging | `Skills/velocity/generate-plugin-message-handler/SKILL.md` |

Deep API reference: `skills/velocity/` (events, commands, messaging, storage sub-skills)
