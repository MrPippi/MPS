# Global Conventions for Multi-Platform Minecraft Plugin Development

Applies to all plugins targeting Paper, Purpur, Velocity, and Waterfall.

---

## 1. Package Naming

```
com.<org>.<pluginname>.<feature>
```

| Segment | Convention | Example |
|---------|-----------|---------|
| `<org>` | Lowercase, no hyphens | `mynetwork` |
| `<pluginname>` | Lowercase, no hyphens | `lobbysystem` |
| `<feature>` | Lowercase, descriptive | `events`, `commands`, `storage`, `messaging` |

### Standard Package Layout

```
com.mynetwork.lobbysystem/
├── LobbyPlugin.java           ← Main class (extends JavaPlugin / Plugin)
├── commands/
│   └── HubCommand.java
├── events/
│   └── PlayerJoinListener.java
├── storage/
│   ├── ConfigManager.java
│   └── DatabaseManager.java
├── messaging/
│   └── MessagingHandler.java
└── util/
    └── ComponentUtils.java
```

For proxy plugins (Velocity / Waterfall), replace `JavaPlugin` with the proxy main class and keep the same package structure.

---

## 2. Cross-Platform Shared Code Strategy (Shared-Lib Pattern)

When code must run on both Paper backends and Velocity/Waterfall proxies, extract platform-agnostic logic into a separate shared library module.

### Gradle Multi-Module Layout

```
my-network-plugin/
├── settings.gradle          ← declares subprojects
├── shared/                  ← platform-agnostic code
│   ├── build.gradle
│   └── src/main/java/com/mynetwork/shared/
│       ├── model/           ← data classes (records preferred)
│       ├── util/            ← pure utility methods
│       └── protocol/        ← plugin message payload serialization
├── paper-plugin/            ← Paper / Purpur backend plugin
│   ├── build.gradle
│   └── src/main/java/...
└── velocity-plugin/         ← Velocity proxy plugin
    ├── build.gradle
    └── src/main/java/...
```

**settings.gradle:**
```groovy
rootProject.name = 'my-network-plugin'
include 'shared', 'paper-plugin', 'velocity-plugin'
```

**paper-plugin/build.gradle (depends on shared):**
```groovy
dependencies {
    implementation(project(':shared'))
    compileOnly("io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT")
}
```

**shared/build.gradle (no platform APIs):**
```groovy
plugins {
    id 'java-library'
}
java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }
// No Paper / Velocity / BungeeCord dependencies here
```

### What Belongs in Shared
- Packet/payload record definitions for plugin messaging
- Pure data models (player data, rank definitions)
- Serialization utilities (JSON via Gson/Jackson, NBT-independent)
- String formatting helpers

### What Stays Platform-Specific
- Anything that imports `org.bukkit.*`, `io.papermc.*`, `com.velocitypowered.*`, or `net.md_5.bungee.*`
- Scheduler / task submission
- Event registration and handling
- Command registration

---

## 3. Async vs Sync API Principles

### Paper (Bukkit/Paper API)

**Rule**: Bukkit objects are NOT thread-safe. All object mutations must happen on the main server thread.

| Action | Thread |
|--------|--------|
| Read/write `Player`, `World`, `Entity`, `ItemStack` | Main thread only |
| Database queries (SELECT, INSERT, UPDATE) | Async thread |
| HTTP requests | Async thread |
| File I/O | Async thread |
| Sending packets / calling `player.sendMessage()` | Main thread |
| Calling Paper's `Chunk` API (most methods) | Main thread |

**Switching threads:**

```java
// From main → async
plugin.getServer().getScheduler().runTaskAsynchronously(plugin, () -> {
    String result = database.query("SELECT ...");         // safe: async
    // Switch back to main to use Bukkit objects
    plugin.getServer().getScheduler().runTask(plugin, () -> {
        player.sendMessage(result);                       // safe: main thread
    });
});

// Modern Java: CompletableFuture pattern
CompletableFuture.supplyAsync(() -> database.fetchData())
    .thenAccept(data -> {
        // Still async here — schedule back to main if needed
        Bukkit.getScheduler().runTask(plugin, () -> applyData(player, data));
    });
```

**Paper async events** (`io.papermc.paper.event.*`):
- `AsyncChatEvent` fires on an async thread — do NOT call Bukkit methods from its handler
- Read event data (e.g., `event.message()`) is safe; modifying world/entities is not

### Velocity (Velocity API)

Velocity's event system is **fully async by default**. All `@Subscribe` methods run on Velocity's event thread pool.

| Action | Thread |
|--------|--------|
| Reading `Player` objects (immutable views) | Any thread safe |
| `proxyServer.getScheduler()` tasks | Velocity scheduler thread |
| Sending plugin messages | Any thread (via `ChannelMessageSink`) |
| Database / HTTP calls | Use `proxyServer.getScheduler().buildTask()` or `CompletableFuture` |

```java
// Velocity: schedule async work
proxyServer.getScheduler()
    .buildTask(plugin, () -> {
        // runs off the event thread
        String data = database.fetch();
    })
    .schedule();
```

### Waterfall (BungeeCord API)

Follows the same **main thread** model as Bukkit for most operations.

```java
// BungeeCord: async task
getProxy().getScheduler().runAsync(plugin, () -> {
    // database / IO work
});
```

---

## 4. Error Handling and Logging Conventions

### Use SLF4J (Not `java.util.logging`)

Paper 1.18+ and Velocity provide a SLF4J logger. Always prefer it over `Bukkit.getLogger()` or `getLogger()` directly.

**Paper:**
```java
import org.slf4j.Logger;

public class MyPlugin extends JavaPlugin {
    private static final Logger log = LoggerFactory.getLogger(MyPlugin.class);
    // Or use the injected logger:
    // private final Logger logger = getSLF4JLogger();

    @Override
    public void onEnable() {
        log.info("Plugin enabled");
        log.warn("Something unexpected: {}", detail);
        log.error("Critical failure", exception);
    }
}
```

**Velocity:**
```java
// Injected via @Inject in constructor
@Inject
public MyPlugin(ProxyServer server, Logger logger) {
    this.server = server;
    this.logger = logger;
}
```

### Logging Levels

| Level | When to Use |
|-------|------------|
| `TRACE` | Detailed debug (disabled in production) |
| `DEBUG` | Development diagnostics |
| `INFO` | Normal lifecycle events (enable, disable, connection counts) |
| `WARN` | Unexpected but recoverable situations |
| `ERROR` | Failures that affect functionality; always include the exception |

### Exception Handling Patterns

```java
// Pattern 1: Log and continue (non-critical path)
try {
    config.load(configFile);
} catch (IOException | InvalidConfigurationException e) {
    logger.error("Failed to load config, using defaults", e);
}

// Pattern 2: Fail fast on startup (critical resource)
try {
    dataSource = createDataSource();
} catch (SQLException e) {
    logger.error("Cannot connect to database — disabling plugin", e);
    getServer().getPluginManager().disablePlugin(this);
    return;
}

// Pattern 3: CompletableFuture error handling
CompletableFuture.supplyAsync(this::fetchData)
    .thenAccept(data -> applyData(player, data))
    .exceptionally(ex -> {
        logger.error("Async data fetch failed for {}", player.getName(), ex);
        return null;
    });
```

### Never Swallow Exceptions

```java
// BAD
try { ... } catch (Exception e) { }

// GOOD
try { ... } catch (Exception e) { logger.error("Context message", e); }
```

---

## 5. Gradle Build Conventions

### Common Settings (all platforms)

```groovy
// build.gradle (root or per-module)
plugins {
    id 'java'
}

group = 'com.mynetwork'
version = '1.0.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

compileJava.options.encoding = 'UTF-8'
```

### Shadow / Fat JAR for Standalone Plugins

When bundling dependencies (e.g., HikariCP) into the plugin JAR:

```groovy
plugins {
    id 'com.github.johnrengelman.shadow' version '8.1.1'
    id 'java'
}

shadowJar {
    // Relocate to avoid conflicts with other plugins
    relocate 'com.zaxxer.hikari', 'com.mynetwork.libs.hikari'
    relocate 'org.slf4j', 'com.mynetwork.libs.slf4j'
    archiveClassifier.set('')          // replace the normal JAR output
}

build.dependsOn shadowJar
```

### Dependency Scopes

| Scope | Usage |
|-------|-------|
| `compileOnly` | Platform API (Paper, Velocity) — provided by server at runtime |
| `implementation` | Bundled dependencies (HikariCP, Gson) |
| `annotationProcessor` | Velocity annotation processor for `@Plugin` metadata |

---

## 6. Adventure API for Text Components

Paper 1.16+ and Velocity both use [Adventure](https://docs.advntr.xyz/) natively. Never use the legacy `ChatColor` API in new code.

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import net.kyori.adventure.text.minimessage.MiniMessage;

// Build components programmatically
Component msg = Component.text("Hello, ")
    .color(NamedTextColor.GOLD)
    .append(Component.text(player.getName()).decorate(TextDecoration.BOLD));
player.sendMessage(msg);

// Parse MiniMessage format (recommended for configurable messages)
Component parsed = MiniMessage.miniMessage().deserialize(
    "<gold>Hello, <bold><player></bold></gold>",
    Placeholder.unparsed("player", player.getName())
);
player.sendMessage(parsed);
```

**Never use:**
```java
player.sendMessage(ChatColor.GOLD + "Hello");   // legacy — avoid
```
