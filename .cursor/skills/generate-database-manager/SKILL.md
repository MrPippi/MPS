---
name: generate-database-manager
description: 為 Bukkit/Paper 插件產生 SQLite/MySQL 雙模式 DatabaseManager 類別，使用 HikariCP 連線池，含非同步查詢封裝、資料表初始化、CRUD 操作範例，以及 pom.xml 依賴設定。當使用者說「幫我建立資料庫管理器」、「DatabaseManager」、「SQLite 插件」、「MySQL HikariCP」時自動應用。
---

# Generate Database Manager Skill

## 目標

產生支援 SQLite（單機）與 MySQL（伺服器）雙模式切換的 `DatabaseManager` 類別，使用 HikariCP 連線池管理資料庫連線，並提供非同步查詢包裝以避免阻塞主執行緒。

---

## 使用流程

1. **詢問基本資訊**：插件名稱、套件名、是否需要範例資料表
2. **更新 pom.xml**：加入 HikariCP 與 SQLite/MySQL 驅動依賴
3. **產生 DatabaseManager.java**：含連線池初始化、資料表建立、CRUD 操作
4. **說明設定方式**：`config.yml` 中的 `storage-type` 切換

---

## pom.xml 依賴

```xml
<!-- HikariCP 連線池 -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.1.0</version>
    <scope>compile</scope>
</dependency>

<!-- SQLite 驅動（單機模式） -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.46.1.3</version>
    <scope>compile</scope>
</dependency>

<!-- MySQL 驅動（伺服器模式，可選） -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>9.0.0</version>
    <scope>compile</scope>
</dependency>
```

注意：HikariCP 與 JDBC 驅動需透過 `maven-shade-plugin` 打包進 JAR。

---

## 代碼範本

### DatabaseManager.java

```java
package com.example.myplugin.managers;

import com.example.myplugin.MyPlugin;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.bukkit.scheduler.BukkitRunnable;

import java.io.File;
import java.sql.*;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;

public class DatabaseManager {

    private final MyPlugin plugin;
    private HikariDataSource dataSource;

    public DatabaseManager(MyPlugin plugin) {
        this.plugin = plugin;
    }

    // ---- 初始化 ----

    public void initialize() throws SQLException {
        String storageType = plugin.getConfigManager().getStorageType();

        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(plugin.getConfigManager().getPoolSize());
        config.setConnectionTimeout(plugin.getConfigManager().getConnectionTimeout());
        config.setLeakDetectionThreshold(60000);

        if ("mysql".equalsIgnoreCase(storageType)) {
            configureMySql(config);
        } else {
            configureSqlite(config);
        }

        dataSource = new HikariDataSource(config);
        createTables();
        plugin.getLogger().info("資料庫連線成功（" + storageType + "）");
    }

    private void configureSqlite(HikariConfig config) {
        File dbFile = new File(plugin.getDataFolder(), "data.db");
        config.setDriverClassName("org.sqlite.JDBC");
        config.setJdbcUrl("jdbc:sqlite:" + dbFile.getAbsolutePath());
        config.setConnectionTestQuery("SELECT 1");
        config.setMaximumPoolSize(1);
    }

    private void configureMySql(HikariConfig config) {
        var cfg = plugin.getConfigManager();
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setJdbcUrl(String.format(
            "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=utf8",
            cfg.getDbHost(), cfg.getDbPort(), cfg.getDbName()
        ));
        config.setUsername(cfg.getDbUsername());
        config.setPassword(cfg.getDbPassword());
    }

    // ---- 建立資料表 ----

    private void createTables() throws SQLException {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate("""
                CREATE TABLE IF NOT EXISTS player_data (
                    uuid        VARCHAR(36)  NOT NULL PRIMARY KEY,
                    name        VARCHAR(16)  NOT NULL,
                    balance     DOUBLE       NOT NULL DEFAULT 0.0,
                    last_seen   BIGINT       NOT NULL DEFAULT 0,
                    created_at  BIGINT       NOT NULL DEFAULT 0
                )
            """);
        }
    }

    // ---- 取得連線 ----

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    // ---- 非同步執行包裝 ----

    /**
     * 在非同步執行緒執行資料庫操作，完成後回主執行緒回調。
     *
     * @param query    非同步執行的資料庫操作（Lambda）
     * @param callback 主執行緒回調（可為 null）
     */
    public <T> CompletableFuture<T> queryAsync(DatabaseQuery<T> query) {
        return CompletableFuture.supplyAsync(() -> {
            try (Connection conn = getConnection()) {
                return query.execute(conn);
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "資料庫查詢失敗", e);
                throw new RuntimeException(e);
            }
        });
    }

    @FunctionalInterface
    public interface DatabaseQuery<T> {
        T execute(Connection conn) throws SQLException;
    }

    // ---- CRUD 操作範例 ----

    public CompletableFuture<Double> getBalance(String uuid) {
        return queryAsync(conn -> {
            String sql = "SELECT balance FROM player_data WHERE uuid = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, uuid);
                ResultSet rs = ps.executeQuery();
                return rs.next() ? rs.getDouble("balance") : 0.0;
            }
        });
    }

    public CompletableFuture<Void> setBalance(String uuid, String name, double balance) {
        return queryAsync(conn -> {
            String sql = """
                INSERT INTO player_data (uuid, name, balance, last_seen, created_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(uuid) DO UPDATE SET
                    name = excluded.name,
                    balance = excluded.balance,
                    last_seen = excluded.last_seen
            """;
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                long now = System.currentTimeMillis();
                ps.setString(1, uuid);
                ps.setString(2, name);
                ps.setDouble(3, balance);
                ps.setLong(4, now);
                ps.setLong(5, now);
                ps.executeUpdate();
            }
            return null;
        });
    }

    public CompletableFuture<Boolean> playerExists(String uuid) {
        return queryAsync(conn -> {
            String sql = "SELECT 1 FROM player_data WHERE uuid = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, uuid);
                return ps.executeQuery().next();
            }
        });
    }

    // ---- 關閉連線池 ----

    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            plugin.getLogger().info("資料庫連線池已關閉。");
        }
    }
}
```

---

### 在主類中初始化與關閉

```java
private DatabaseManager databaseManager;

@Override
public void onEnable() {
    saveDefaultConfig();
    configManager = new ConfigManager(this);

    databaseManager = new DatabaseManager(this);
    try {
        databaseManager.initialize();
    } catch (SQLException e) {
        getLogger().severe("資料庫初始化失敗，插件停用：" + e.getMessage());
        getServer().getPluginManager().disablePlugin(this);
        return;
    }
}

@Override
public void onDisable() {
    if (databaseManager != null) {
        databaseManager.close();
    }
}

public DatabaseManager getDatabaseManager() {
    return databaseManager;
}
```

---

### 非同步查詢使用範例

```java
// 在事件或指令中讀取餘額（非同步，完成後回主執行緒）
plugin.getDatabaseManager().getBalance(player.getUniqueId().toString())
    .thenAcceptAsync(balance -> {
        // 切回主執行緒更新 UI
        Bukkit.getScheduler().runTask(plugin, () -> {
            player.sendMessage(Component.text(
                "你的餘額：" + balance + " 金幣"
            ).color(NamedTextColor.GOLD));
        });
    })
    .exceptionally(ex -> {
        player.sendMessage(Component.text("查詢失敗，請稍後再試。").color(NamedTextColor.RED));
        return null;
    });
```

---

## MySQL ON CONFLICT 相容性

SQLite 使用 `ON CONFLICT(uuid) DO UPDATE`；MySQL 使用 `ON DUPLICATE KEY UPDATE`。若需雙模式相容，可依 `storageType` 切換 SQL：

```java
private String upsertSql() {
    if ("mysql".equalsIgnoreCase(plugin.getConfigManager().getStorageType())) {
        return """
            INSERT INTO player_data (uuid, name, balance, last_seen, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                balance = VALUES(balance),
                last_seen = VALUES(last_seen)
        """;
    }
    return """
        INSERT INTO player_data (uuid, name, balance, last_seen, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(uuid) DO UPDATE SET
            name = excluded.name,
            balance = excluded.balance,
            last_seen = excluded.last_seen
    """;
}
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `ClassNotFoundException: org.sqlite.JDBC` | 驅動未打包進 JAR | 確認 shade plugin 有包含 `sqlite-jdbc` |
| `HikariPool-1 - Connection is not available` | 連線池耗盡 | 增大 `pool-size` 或檢查連線未關閉洩漏 |
| 主執行緒操作 Bukkit 物件時 `IllegalStateException` | 在 async callback 中操作 | 使用 `Bukkit.getScheduler().runTask()` 切回主執行緒 |
| SQLite 不支援 `ON DUPLICATE KEY UPDATE` | 語法差異 | SQLite 用 `ON CONFLICT DO UPDATE`，MySQL 用 `ON DUPLICATE KEY UPDATE` |
| 插件重啟後資料遺失 | 未呼叫 `close()` | 在 `onDisable()` 中呼叫 `databaseManager.close()` |
