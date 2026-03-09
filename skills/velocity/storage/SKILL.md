# Storage Skill — Velocity

## Purpose
Reference this skill when implementing storage in a Velocity proxy plugin. Velocity has no Bukkit APIs — storage is handled via standard Java file I/O, TOML/YAML/JSON libraries, or databases. No `FileConfiguration`, `PersistentDataContainer`, or Bukkit scheduler exists on Velocity.

## When to Use This Skill
- Storing proxy-level player data (network ranks, mute status, connected server history)
- Reading plugin configuration on Velocity
- Connecting to a shared database accessible from both proxy and backend servers

## API Quick Reference

| Approach | Library | Notes |
|---------|---------|-------|
| YAML config | SnakeYAML or Configurate | Configurate is bundled with Velocity API |
| TOML config | Configurate TOML | Velocity uses TOML for its own `velocity.toml` |
| JSON | Gson (bundled with Velocity) or Jackson | For data serialization |
| Database | HikariCP + MySQL/SQLite | Must be shaded into the plugin JAR |
| File I/O | `java.nio.file.*` | Use `@DataDirectory Path` for the plugin data folder |

## Code Pattern

### Reading Config (Configurate / YAML)

Velocity ships Configurate as a bundled library:

```java
package com.yourorg.proxyplugin.storage;

import org.spongepowered.configurate.CommentedConfigurationNode;
import org.spongepowered.configurate.yaml.YamlConfigurationLoader;
import org.slf4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

public class ProxyConfig {

    private final Path dataDirectory;
    private final Logger logger;

    private String databaseHost;
    private int databasePort;
    private String databaseName;
    private int afkTimeoutSeconds;

    public ProxyConfig(Path dataDirectory, Logger logger) {
        this.dataDirectory = dataDirectory;
        this.logger = logger;
    }

    public void load() {
        Path configFile = dataDirectory.resolve("config.yml");

        // Copy default config from JAR if absent
        if (!Files.exists(configFile)) {
            try {
                Files.createDirectories(dataDirectory);
                InputStream defaultConfig = getClass().getResourceAsStream("/config.yml");
                if (defaultConfig != null) {
                    Files.copy(defaultConfig, configFile);
                }
            } catch (IOException e) {
                logger.error("Failed to create default config", e);
            }
        }

        // Load with Configurate
        try {
            YamlConfigurationLoader loader = YamlConfigurationLoader.builder()
                .path(configFile)
                .build();

            CommentedConfigurationNode root = loader.load();

            databaseHost = root.node("database", "host").getString("localhost");
            databasePort = root.node("database", "port").getInt(3306);
            databaseName = root.node("database", "name").getString("proxy");
            afkTimeoutSeconds = root.node("afk-timeout").getInt(300);

            logger.info("Config loaded from {}", configFile);
        } catch (IOException e) {
            logger.error("Failed to load config", e);
        }
    }

    public String getDatabaseHost()    { return databaseHost; }
    public int getDatabasePort()       { return databasePort; }
    public String getDatabaseName()    { return databaseName; }
    public int getAfkTimeoutSeconds()  { return afkTimeoutSeconds; }
}
```

**`src/main/resources/config.yml`:**
```yaml
database:
  host: localhost
  port: 3306
  name: proxy

afk-timeout: 300   # seconds
```

### HikariCP on Velocity

```groovy
// build.gradle — add database dependencies
dependencies {
    compileOnly("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
    annotationProcessor("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")

    implementation("com.zaxxer:HikariCP:5.1.0")
    implementation("com.mysql:mysql-connector-j:8.3.0")
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.proxyplugin.libs.hikari'
    relocate 'com.mysql',         'com.yourorg.proxyplugin.libs.mysql'
    archiveClassifier.set('')
}
```

```java
package com.yourorg.proxyplugin.storage;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class ProxyDatabase {

    private final Logger logger;
    private HikariDataSource dataSource;

    public ProxyDatabase(Logger logger) {
        this.logger = logger;
    }

    public void init(String host, int port, String name, String user, String password) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://" + host + ":" + port + "/" + name +
            "?useSSL=false&serverTimezone=UTC");
        config.setUsername(user);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setConnectionTimeout(10_000);
        dataSource = new HikariDataSource(config);

        createTables();
        logger.info("Database connected to {}:{}/{}", host, port, name);
    }

    private void createTables() {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("""
                 CREATE TABLE IF NOT EXISTS player_data (
                     uuid     VARCHAR(36) PRIMARY KEY,
                     username VARCHAR(16) NOT NULL,
                     rank     VARCHAR(32) NOT NULL DEFAULT 'default',
                     muted    BOOLEAN NOT NULL DEFAULT FALSE
                 )
                 """)) {
            stmt.execute();
        } catch (SQLException e) {
            logger.error("Failed to create tables", e);
        }
    }

    public CompletableFuture<Void> upsertPlayer(UUID uuid, String username) {
        return CompletableFuture.runAsync(() -> {
            String sql = """
                INSERT INTO player_data (uuid, username) VALUES (?, ?)
                ON DUPLICATE KEY UPDATE username = VALUES(username)
                """;
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, uuid.toString());
                stmt.setString(2, username);
                stmt.executeUpdate();
            } catch (SQLException e) {
                logger.error("Failed to upsert player {}", uuid, e);
            }
        });
    }

    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
    }
}
```

## Common Pitfalls

- **Using `FileConfiguration` (Bukkit) on Velocity**: This class does not exist in Velocity. Use Configurate (bundled) or plain SnakeYAML.

- **Using `Bukkit.getScheduler()` for async tasks**: Bukkit doesn't exist in Velocity. Use `CompletableFuture.runAsync()` or `proxyServer.getScheduler().buildTask(plugin, task).schedule()`.

- **Not shading HikariCP**: Velocity does not bundle HikariCP. Always relocate it with the Shadow plugin.

- **Accessing `@DataDirectory` path without `Files.createDirectories()`**: The data directory may not exist on first run. Always create it before writing files.

- **Reading Velocity's own `velocity.toml`**: The file is in the server working directory, not in your plugin's data folder. Use `proxyServer.getConfiguration()` to read Velocity's own settings if available, rather than parsing the TOML file manually.

## Version Notes

- **Velocity 3.3**: Configurate 4.x is bundled. `SpongePowered Configurate` classes are available at runtime.
- Velocity does NOT bundle SnakeYAML separately — use Configurate's YAML support.

## Related Skills

- [../OVERVIEW.md](../OVERVIEW.md) — Velocity setup and Gradle template
- [../../paper/storage/database-hikari.md](../../paper/storage/database-hikari.md) — HikariCP patterns (same concept, Paper context)
- [../messaging/plugin-messages.md](../messaging/plugin-messages.md) — Sync data between proxy and backend
