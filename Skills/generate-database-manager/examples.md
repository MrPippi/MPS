# examples — generate-database-manager

## 範例 1：玩家資料表（SQLite 為主）

**Input:**
```
plugin_name: EconomyPlugin
db_type: sqlite_primary
table_schemas:
  - player_data (uuid VARCHAR, name VARCHAR, balance DOUBLE, last_seen BIGINT)
```

**Output — DatabaseManager.java（節錄）:**
```java
public class DatabaseManager {

    private final EconomyPlugin plugin;
    private HikariDataSource dataSource;

    public DatabaseManager(EconomyPlugin plugin) {
        this.plugin = plugin;
    }

    public void init() throws SQLException {
        HikariConfig config = new HikariConfig();
        String dbType = plugin.getConfig().getString("database.type", "sqlite");

        if (dbType.equalsIgnoreCase("mysql")) {
            config.setJdbcUrl("jdbc:mysql://" +
                plugin.getConfig().getString("database.mysql.host") + ":" +
                plugin.getConfig().getInt("database.mysql.port") + "/" +
                plugin.getConfig().getString("database.mysql.database"));
            config.setUsername(plugin.getConfig().getString("database.mysql.username"));
            config.setPassword(plugin.getConfig().getString("database.mysql.password"));
            config.setMaximumPoolSize(plugin.getConfig().getInt("database.mysql.pool-size", 10));
        } else {
            File dbFile = new File(plugin.getDataFolder(), "data.db");
            config.setJdbcUrl("jdbc:sqlite:" + dbFile.getAbsolutePath());
            config.setMaximumPoolSize(1);
        }

        config.setPoolName("EconomyPlugin-Pool");
        dataSource = new HikariDataSource(config);
        createTables();
    }

    private void createTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS player_data (
                    uuid      VARCHAR(36)  NOT NULL PRIMARY KEY,
                    name      VARCHAR(16)  NOT NULL,
                    balance   DOUBLE       NOT NULL DEFAULT 0.0,
                    last_seen BIGINT       NOT NULL DEFAULT 0
                )
            """);
        }
    }

    // 非同步查詢封裝
    public CompletableFuture<Double> getBalance(UUID uuid) {
        return CompletableFuture.supplyAsync(() -> {
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                     "SELECT balance FROM player_data WHERE uuid = ?")) {
                ps.setString(1, uuid.toString());
                ResultSet rs = ps.executeQuery();
                return rs.next() ? rs.getDouble("balance") : 0.0;
            } catch (SQLException e) {
                plugin.getLogger().severe("查詢餘額失敗：" + e.getMessage());
                return 0.0;
            }
        });
    }

    public CompletableFuture<Void> setBalance(UUID uuid, double balance) {
        return CompletableFuture.runAsync(() -> {
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                     "INSERT INTO player_data (uuid, balance) VALUES (?, ?) " +
                     "ON CONFLICT(uuid) DO UPDATE SET balance = excluded.balance")) {
                ps.setString(1, uuid.toString());
                ps.setDouble(2, balance);
                ps.executeUpdate();
            } catch (SQLException e) {
                plugin.getLogger().severe("更新餘額失敗：" + e.getMessage());
            }
        });
    }
}
```

---

## 範例 2：MySQL 優先（多表）

**Input:**
```
plugin_name: GuildPlugin
db_type: mysql_primary
table_schemas:
  - guilds (id INT AUTO_INCREMENT, name VARCHAR, owner_uuid VARCHAR, created_at BIGINT)
  - guild_members (guild_id INT, member_uuid VARCHAR, role VARCHAR, joined_at BIGINT)
```

**Output — createTables() 方法:**
```java
private void createTables() throws SQLException {
    try (Connection conn = dataSource.getConnection();
         Statement stmt = conn.createStatement()) {

        stmt.execute("""
            CREATE TABLE IF NOT EXISTS guilds (
                id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(32)  NOT NULL UNIQUE,
                owner_uuid  VARCHAR(36)  NOT NULL,
                created_at  BIGINT       NOT NULL
            )
        """);

        stmt.execute("""
            CREATE TABLE IF NOT EXISTS guild_members (
                guild_id    INT          NOT NULL,
                member_uuid VARCHAR(36)  NOT NULL,
                role        VARCHAR(16)  NOT NULL DEFAULT 'member',
                joined_at   BIGINT       NOT NULL,
                PRIMARY KEY (guild_id, member_uuid),
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
            )
        """);
    }
}
```

---

## 範例 3：在主類中初始化與關閉

```java
private DatabaseManager databaseManager;

@Override
public void onEnable() {
    try {
        databaseManager = new DatabaseManager(this);
        databaseManager.init();
        getLogger().info("資料庫連線成功！");
    } catch (SQLException e) {
        getLogger().severe("資料庫初始化失敗：" + e.getMessage());
        getServer().getPluginManager().disablePlugin(this);
    }
}

@Override
public void onDisable() {
    if (databaseManager != null) {
        databaseManager.close();
    }
}
```
