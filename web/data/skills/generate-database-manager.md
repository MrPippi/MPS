---
id: generate-database-manager
title: Generate Database Manager
titleZh: 資料庫管理器生成器
description: Generate a SQLite/MySQL dual-mode DatabaseManager class with connection pooling and async query wrappers.
descriptionZh: 產生 SQLite/MySQL 雙模式 DatabaseManager 類，含連線池與非同步查詢封裝。
version: "1.0.0"
status: active
category: database
categoryLabel: 資料庫
categoryLabelEn: Database
tags: [database, sqlite, mysql, hikaricp, async]
triggerKeywords:
  - "資料庫"
  - "DatabaseManager"
  - "SQLite"
  - "MySQL"
  - "HikariCP"
updatedAt: "2026-03-05"
githubPath: Skills/generate-database-manager/SKILL.md
featured: false
---

# Generate Database Manager Skill


## 目標

產生支援 SQLite（本地）與 MySQL（遠端）雙模式的 `DatabaseManager` 類別，使用 HikariCP 連線池，並提供非同步查詢封裝。

---

## 依賴設定

```xml
<!-- HikariCP 連線池 -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.1.0</version>
</dependency>
```

---

## 預計產生的類別結構

```java
public class DatabaseManager {
    private final HikariDataSource dataSource;

    public DatabaseManager(Plugin plugin, String type) {
        // 依 type 切換 SQLite / MySQL 連線設定
    }

    public CompletableFuture<Void> executeAsync(String sql, Object... params) {
        return CompletableFuture.runAsync(() -> {
            // 非同步執行 SQL
        });
    }

    public void close() {
        dataSource.close();
    }
}
```

---

## 支援功能

- SQLite 本地檔案資料庫（零設定）
- MySQL / MariaDB 遠端資料庫
- HikariCP 連線池管理
- `CompletableFuture` 非同步查詢 API
- 自動建表（Table initialization）
