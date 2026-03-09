# Database with HikariCP — Paper

Setting up a connection pool with HikariCP for MySQL or SQLite in Paper plugins. All database calls must be made asynchronously.

---

## Gradle Dependencies

```groovy
dependencies {
    compileOnly("io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT")

    // HikariCP — connection pool (must be shaded)
    implementation("com.zaxxer:HikariCP:5.1.0")

    // MySQL driver (choose one)
    implementation("com.mysql:mysql-connector-j:8.3.0")

    // OR SQLite driver
    implementation("org.xerial:sqlite-jdbc:3.45.3.0")
}

// Shadow plugin to bundle dependencies into the JAR
plugins {
    id 'com.github.johnrengelman.shadow' version '8.1.1'
    id 'java'
}

shadowJar {
    relocate 'com.zaxxer.hikari', 'com.yourorg.myplugin.libs.hikari'
    relocate 'com.mysql',         'com.yourorg.myplugin.libs.mysql'
    relocate 'org.sqlite',        'com.yourorg.myplugin.libs.sqlite'
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

---

## DatabaseManager Setup

```java
package com.yourorg.myplugin.storage;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.bukkit.plugin.java.JavaPlugin;
import org.slf4j.Logger;

import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class DatabaseManager {

    private final JavaPlugin plugin;
    private final Logger logger;
    private HikariDataSource dataSource;

    public DatabaseManager(JavaPlugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getSLF4JLogger();
    }

    // --- Initialise ---

    public void init(boolean useSqlite) {
        if (useSqlite) {
            initSqlite();
        } else {
            initMysql();
        }
        createTables();
    }

    private void initSqlite() {
        File dbFile = new File(plugin.getDataFolder(), "data.db");
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.sqlite.JDBC");
        config.setJdbcUrl("jdbc:sqlite:" + dbFile.getAbsolutePath());
        // SQLite: single connection only (WAL mode supports concurrent reads)
        config.setMaximumPoolSize(1);
        config.setConnectionTestQuery("SELECT 1");
        dataSource = new HikariDataSource(config);
        logger.info("SQLite database initialised at {}", dbFile.getPath());
    }

    private void initMysql() {
        var cfg = plugin.getConfig();
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setJdbcUrl(String.format(
            "jdbc:mysql://%s:%d/%s?useSSL=false&serverTimezone=UTC&characterEncoding=utf8",
            cfg.getString("database.host", "localhost"),
            cfg.getInt("database.port", 3306),
            cfg.getString("database.name", "myplugin")
        ));
        config.setUsername(cfg.getString("database.user", "root"));
        config.setPassword(cfg.getString("database.password", ""));
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300_000);          // 5 minutes
        config.setMaxLifetime(600_000);           // 10 minutes
        config.setConnectionTimeout(10_000);      // 10 seconds
        config.setLeakDetectionThreshold(15_000); // warn on 15s+ held connections
        dataSource = new HikariDataSource(config);
        logger.info("MySQL pool initialised (host={})", cfg.getString("database.host"));
    }

    // --- Schema ---

    private void createTables() {
        String sql = """
            CREATE TABLE IF NOT EXISTS player_stats (
                uuid        VARCHAR(36) PRIMARY KEY,
                username    VARCHAR(16) NOT NULL,
                kills       INT NOT NULL DEFAULT 0,
                deaths      INT NOT NULL DEFAULT 0,
                last_seen   BIGINT NOT NULL
            )
            """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.execute();
            logger.info("Tables created / verified.");
        } catch (SQLException e) {
            logger.error("Failed to create tables", e);
            plugin.getServer().getPluginManager().disablePlugin(plugin);
        }
    }

    // --- CRUD operations (always async) ---

    public CompletableFuture<Void> savePlayer(UUID uuid, String username, int kills, int deaths) {
        return CompletableFuture.runAsync(() -> {
            String sql = """
                INSERT INTO player_stats (uuid, username, kills, deaths, last_seen)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    kills = VALUES(kills),
                    deaths = VALUES(deaths),
                    last_seen = VALUES(last_seen)
                """;
            // For SQLite, replace ON DUPLICATE KEY with INSERT OR REPLACE
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, uuid.toString());
                stmt.setString(2, username);
                stmt.setInt(3, kills);
                stmt.setInt(4, deaths);
                stmt.setLong(5, System.currentTimeMillis());
                stmt.executeUpdate();
            } catch (SQLException e) {
                logger.error("Failed to save player {}", uuid, e);
            }
        });
    }

    public record PlayerStats(UUID uuid, String username, int kills, int deaths) {}

    public CompletableFuture<Optional<PlayerStats>> loadPlayer(UUID uuid) {
        return CompletableFuture.supplyAsync(() -> {
            String sql = "SELECT username, kills, deaths FROM player_stats WHERE uuid = ?";
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, uuid.toString());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        return Optional.of(new PlayerStats(
                            uuid,
                            rs.getString("username"),
                            rs.getInt("kills"),
                            rs.getInt("deaths")
                        ));
                    }
                }
            } catch (SQLException e) {
                logger.error("Failed to load player {}", uuid, e);
            }
            return Optional.empty();
        });
    }

    // --- Shutdown ---

    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            logger.info("Database connection pool closed.");
        }
    }
}
```

---

## Using the DatabaseManager in Your Plugin

```java
// In main class
private DatabaseManager db;

@Override
public void onEnable() {
    saveDefaultConfig();
    db = new DatabaseManager(this);
    db.init(getConfig().getBoolean("database.use-sqlite", true));
}

@Override
public void onDisable() {
    if (db != null) db.close();
}
```

---

## Async Read + Main Thread Apply Pattern

```java
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public class PlayerLoadHandler {

    private final JavaPlugin plugin;
    private final DatabaseManager db;

    public PlayerLoadHandler(JavaPlugin plugin, DatabaseManager db) {
        this.plugin = plugin;
        this.db = db;
    }

    public void onPlayerJoin(Player player) {
        // Load data async, apply on main thread
        db.loadPlayer(player.getUniqueId())
            .thenAccept(optStats -> {
                // Still on async thread
                optStats.ifPresentOrElse(
                    stats -> applyStats(player, stats),
                    () -> createNewPlayer(player)
                );
            })
            .exceptionally(ex -> {
                plugin.getSLF4JLogger().error("Failed to load {}", player.getName(), ex);
                return null;
            });
    }

    private void applyStats(Player player, DatabaseManager.PlayerStats stats) {
        // Schedule Bukkit object mutations on main thread
        plugin.getServer().getScheduler().runTask(plugin, () -> {
            if (!player.isOnline()) return;
            player.setLevel(stats.kills());   // example use
        });
    }

    private void createNewPlayer(Player player) {
        db.savePlayer(player.getUniqueId(), player.getName(), 0, 0);
    }
}
```

---

## SQLite vs MySQL Decision

| Factor | SQLite | MySQL |
|--------|--------|-------|
| Setup | Zero config | Requires DB server |
| Performance | Single-writer, great for small servers | Connection pool, scales to many writers |
| Cross-server sharing | No | Yes (shared remote host) |
| Backup | Copy the `.db` file | `mysqldump` |
| Transactions | Yes | Yes |
| Best for | Single-server, local storage | Networks, bungeecord setups |

---

## Common Pitfalls

- **Running SQL on the main thread**: Even a 1ms query on the main thread causes TPS drops. ALWAYS use `CompletableFuture.runAsync()` or `supplyAsync()`.

- **Not closing `Connection`, `PreparedStatement`, `ResultSet`**: HikariCP leases connections from the pool. If you don't close them (use try-with-resources), the pool exhausts under load.

- **Using `Statement` instead of `PreparedStatement`**: Direct string concatenation in SQL allows SQL injection. Always use `PreparedStatement` with `?` parameters.

- **Not shading HikariCP**: If another plugin uses a different HikariCP version, class conflicts cause `ClassCastException` or `NoSuchMethodError`. Always relocate with the Shadow plugin.

- **Using `dataSource` after `onDisable`**: Async tasks may still be running when `onDisable` is called. Wait for pending futures or use a flag to reject new DB calls during shutdown.

## Related Skills

- [SKILL.md](SKILL.md) — Storage overview
- [pdc.md](pdc.md) — PersistentDataContainer (no DB needed for small entity data)
- [config-yml.md](config-yml.md) — Reading database credentials from config
