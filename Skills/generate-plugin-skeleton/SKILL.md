---
name: generate-plugin-skeleton
description: 依輸入參數（插件名稱、主類包名、目標 MC 版本、API 種類）產生完整的 Bukkit/Paper 插件 Maven 專案骨架，包含 pom.xml、plugin.yml、主類 Java 檔案。當使用者說「幫我建立插件骨架」、「新建插件專案」、「plugin skeleton」、「建立 Maven 插件」時自動應用。
---

# Generate Plugin Skeleton Skill

## 目標

依使用者提供的基本參數，產生一個可直接 `mvn package` 編譯的 Bukkit/Paper 插件 Maven 專案骨架。

---

## 使用流程

1. **詢問必要資訊**（若未提供則詢問）：
   - 插件名稱（`PluginName`，大駝峰）
   - Java 套件名（`com.example.myplugin`）
   - 目標 Minecraft 版本（例：`1.21.4`）
   - API 種類：`paper`（推薦）或 `spigot`
   - Java 版本：`21`（推薦）或 `17`
2. **產生以下三個檔案**：
   - `pom.xml`
   - `src/main/resources/plugin.yml`
   - `src/main/java/{package_path}/{PluginName}.java`
3. **說明編譯與安裝方式**

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_name` | `MyPlugin` | 插件名稱（大駝峰），用於主類命名 |
| `group_id` | `com.example` | Maven groupId |
| `artifact_id` | `myplugin` | Maven artifactId（小寫） |
| `package` | `com.example.myplugin` | Java 套件名 |
| `mc_version` | `1.21.4` | 目標 Minecraft 版本 |
| `api` | `paper` / `spigot` | 使用的 API 種類 |
| `java_version` | `21` | Java 版本（17 或 21） |

---

## 代碼範本

### pom.xml（Paper 1.21.4 + Java 21）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myplugin</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>MyPlugin</name>
    <description>A Minecraft plugin</description>

    <properties>
        <java.version>21</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>1.21.4-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.3</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals><goal>shade</goal></goals>
                        <configuration>
                            <createDependencyReducedPom>false</createDependencyReducedPom>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
</project>
```

---

### plugin.yml

```yaml
name: MyPlugin
version: '${project.version}'
main: com.example.myplugin.MyPlugin
api-version: '1.21'
description: A Minecraft plugin
authors: [YourName]
website: https://github.com/you/myplugin

commands:
  myplugin:
    description: MyPlugin 主指令
    usage: /myplugin
    permission: myplugin.use

permissions:
  myplugin.use:
    description: 允許使用 MyPlugin 指令
    default: op
  myplugin.admin:
    description: MyPlugin 管理員權限
    default: op
```

---

### 主類 Java 檔（MyPlugin.java）

```java
package com.example.myplugin;

import org.bukkit.plugin.java.JavaPlugin;
import java.util.logging.Logger;

public final class MyPlugin extends JavaPlugin {

    private static MyPlugin instance;

    @Override
    public void onEnable() {
        instance = this;
        Logger logger = getLogger();

        saveDefaultConfig();

        logger.info("MyPlugin 已啟動！版本：" + getDescription().getVersion());

        // 註冊指令
        // var cmd = getCommand("myplugin");
        // if (cmd != null) {
        //     var handler = new MyPluginCommand(this);
        //     cmd.setExecutor(handler);
        //     cmd.setTabCompleter(handler);
        // }

        // 註冊事件監聽器
        // getServer().getPluginManager().registerEvents(new MyListener(this), this);
    }

    @Override
    public void onDisable() {
        getLogger().info("MyPlugin 已停用。");
    }

    public static MyPlugin getInstance() {
        return instance;
    }
}
```

---

## 推薦目錄結構

```
myplugin/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/myplugin/
        │       ├── MyPlugin.java          ← 主類
        │       ├── commands/
        │       │   └── MyPluginCommand.java
        │       ├── listeners/
        │       │   └── PlayerListener.java
        │       └── managers/
        │           └── ConfigManager.java
        └── resources/
            ├── plugin.yml
            └── config.yml
```

---

## 常見版本對照表

| MC 版本 | api-version | Paper API 依賴版本 |
|---------|-------------|-------------------|
| 1.21.4  | 1.21        | 1.21.4-R0.1-SNAPSHOT |
| 1.20.6  | 1.20        | 1.20.6-R0.1-SNAPSHOT |
| 1.20.4  | 1.20        | 1.20.4-R0.1-SNAPSHOT |
| 1.19.4  | 1.19        | 1.19.4-R0.1-SNAPSHOT |

---

## 編譯與安裝

```bash
# 編譯並打包
mvn clean package

# 輸出位置
target/myplugin-1.0.0-SNAPSHOT.jar

# 複製到伺服器
cp target/myplugin-1.0.0-SNAPSHOT.jar /path/to/server/plugins/
```

---

## 注意事項

- `api-version` 設定為 `'1.21'` 而非 `'1.21.4'`（只取主次版本）
- Paper API 需要 `papermc` repository，Spigot 則使用 Spigot BuildTools
- `maven-shade-plugin` 建議加入以支援未來打包第三方依賴
- 主類名稱必須與 `plugin.yml` 中的 `main` 欄位完全一致
