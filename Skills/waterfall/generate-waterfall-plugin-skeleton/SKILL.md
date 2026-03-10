---
name: generate-waterfall-plugin-skeleton
description: 依輸入參數產生完整的 Waterfall/BungeeCord proxy plugin 骨架，包含 build.gradle、plugin.yml、繼承 net.md_5.bungee.api.plugin.Plugin 的主類、事件監聽器和指令。當使用者說「建立 Waterfall 插件」、「BungeeCord plugin skeleton」、「bungeecord proxy plugin」、「generate waterfall plugin」時自動應用。
---

# Generate Waterfall Plugin Skeleton / 產生 Waterfall 插件骨架

## 技能名稱 / Skill Name
generate-waterfall-plugin-skeleton

## 目的 / Purpose
依使用者提供的基本參數，產生一個可直接 `./gradlew build` 編譯的 Waterfall/BungeeCord proxy plugin 骨架。

## 觸發條件 / Triggers
- 「建立 Waterfall 插件」
- 「BungeeCord plugin skeleton」
- 「bungeecord proxy plugin」
- 「generate waterfall plugin」
- 「新建 BungeeCord 插件」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_name` | `MyHubPlugin` | Plugin 名稱（大駝峰，用於主類和 plugin.yml） |
| `group_id` | `com.mynetwork` | Java 套件 group |
| `description` | `A hub plugin for Waterfall` | Plugin 說明（英文） |
| `author` | `YourName` | 作者名稱 |

## 輸出產物 / Outputs

- `build.gradle`
- `settings.gradle`
- `src/main/resources/plugin.yml`
- `src/main/java/{package_path}/{PluginName}.java` — 主類（繼承 `Plugin`）
- `src/main/java/{package_path}/listeners/ConnectionListener.java` — 連線事件監聽範例
- `src/main/java/{package_path}/commands/HubCommand.java` — `Command` 範例

## 代碼範本 / Code Template

### `build.gradle`

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

group = '{group_id}'
version = '1.0.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

compileJava.options.encoding = 'UTF-8'

repositories {
    maven { url = 'https://oss.sonatype.org/content/repositories/snapshots' }
    mavenCentral()
}

dependencies {
    compileOnly("io.github.waterfallmc:waterfall-api:1.21-R0.1-SNAPSHOT")
}

shadowJar {
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

### `src/main/resources/plugin.yml`

```yaml
name: {PluginName}
version: '1.0.0-SNAPSHOT'
main: {group_id}.{plugin_id}.{PluginName}
author: {author}
description: {description}

depends: []
softDepends: []
```

### Main Class (`{PluginName}.java`)

```java
package {group_id}.{plugin_id};

import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.api.plugin.PluginManager;
import java.util.logging.Logger;

public final class {PluginName} extends Plugin {

    // Waterfall uses java.util.logging, not SLF4J
    private Logger logger;

    @Override
    public void onEnable() {
        this.logger = getLogger();
        logger.info("{PluginName} enabling on Waterfall " +
            getProxy().getVersion() + "...");

        PluginManager pm = getProxy().getPluginManager();

        // Register event listeners
        pm.registerListener(this, new ConnectionListener(this));

        // Register commands
        pm.registerCommand(this, new HubCommand(this));

        // Register plugin message channels (if needed)
        // getProxy().registerChannel("{plugin_id}:network");

        logger.info("{PluginName} enabled.");
    }

    @Override
    public void onDisable() {
        logger.info("{PluginName} disabling...");
        // getProxy().unregisterChannel("{plugin_id}:network");
    }
}
```

### Connection Listener (`listeners/ConnectionListener.java`)

```java
package {group_id}.{plugin_id}.listeners;

import net.md_5.bungee.api.connection.ProxiedPlayer;
import net.md_5.bungee.api.event.PostLoginEvent;
import net.md_5.bungee.api.event.PlayerDisconnectEvent;
import net.md_5.bungee.api.plugin.Listener;
import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.event.EventHandler;

import java.util.logging.Logger;

public class ConnectionListener implements Listener {

    private final Plugin plugin;
    private final Logger logger;

    public ConnectionListener(Plugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getLogger();
    }

    @EventHandler
    public void onPostLogin(PostLoginEvent event) {
        ProxiedPlayer player = event.getPlayer();
        logger.info(player.getName() + " (" + player.getUniqueId() + ") connected.");
    }

    @EventHandler
    public void onDisconnect(PlayerDisconnectEvent event) {
        logger.info(event.getPlayer().getName() + " disconnected.");
    }
}
```

### Hub Command (`commands/HubCommand.java`)

```java
package {group_id}.{plugin_id}.commands;

import net.md_5.bungee.api.CommandSender;
import net.md_5.bungee.api.ProxyServer;
import net.md_5.bungee.api.chat.TextComponent;
import net.md_5.bungee.api.config.ServerInfo;
import net.md_5.bungee.api.connection.ProxiedPlayer;
import net.md_5.bungee.api.plugin.Command;
import net.md_5.bungee.api.plugin.Plugin;

public class HubCommand extends Command {

    private final Plugin plugin;

    public HubCommand(Plugin plugin) {
        super("hub");   // command name; add aliases as extra String args
        this.plugin = plugin;
    }

    @Override
    public void execute(CommandSender sender, String[] args) {
        if (!(sender instanceof ProxiedPlayer player)) {
            sender.sendMessage(new TextComponent("§cPlayers only."));
            return;
        }

        ServerInfo hub = ProxyServer.getInstance().getServerInfo("hub");
        if (hub == null) {
            player.sendMessage(new TextComponent("§cHub server not found."));
            return;
        }

        player.connect(hub);
        player.sendMessage(new TextComponent("§aConnecting to hub..."));
    }
}
```

## 推薦目錄結構 / Recommended Directory Structure

```
{plugin_id}/
├── build.gradle
├── settings.gradle
└── src/main/
    ├── resources/
    │   └── plugin.yml
    └── java/{group_id}/{plugin_id}/
        ├── {PluginName}.java          ← Main class extends Plugin
        ├── commands/
        │   └── HubCommand.java
        └── listeners/
            └── ConnectionListener.java
```

## 失敗回退 / Fallback

- `plugin.yml` 必須放在 `src/main/resources/`（JAR 根目錄），否則 Waterfall 無法識別插件。
- 主類必須繼承 `net.md_5.bungee.api.plugin.Plugin`（不是 `JavaPlugin`，那是 Bukkit/Paper 的）。
- Waterfall 使用 `java.util.logging.Logger`（`getLogger()`），不是 SLF4J。
- 若需要 Adventure API 的富文字支援，加入 `net.kyori:adventure-platform-bungeecord` 並 shade 它。
