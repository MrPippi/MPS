---
name: generate-velocity-plugin-skeleton
description: 依輸入參數產生完整的 Velocity proxy plugin 骨架，包含 build.gradle、@Plugin 主類、velocity-plugin.json（由 annotation processor 自動生成）。當使用者說「建立 Velocity 插件」、「Velocity plugin skeleton」、「proxy plugin」、「generate velocity plugin」時自動應用。
---

# Generate Velocity Plugin Skeleton / 產生 Velocity 插件骨架

## 技能名稱 / Skill Name
generate-velocity-plugin-skeleton

## 目的 / Purpose
依使用者提供的基本參數，產生一個可直接 `./gradlew build` 編譯的 Velocity proxy plugin 骨架。

## 觸發條件 / Triggers
- 「建立 Velocity 插件」
- 「Velocity plugin skeleton」
- 「proxy plugin 骨架」
- 「generate velocity plugin」
- 「新建代理插件」

## 輸入參數 / Inputs

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_id` | `myhubplugin` | Plugin ID（小寫，英數 + 連字號，用於 `@Plugin(id=...)` 和 JAR 檔名） |
| `plugin_name` | `MyHubPlugin` | Plugin 顯示名稱（大駝峰） |
| `group_id` | `com.mynetwork` | Java 套件 group |
| `description` | `A hub plugin for my network` | Plugin 說明（英文） |
| `authors` | `["YourName"]` | 作者列表 |

## 輸出產物 / Outputs

- `build.gradle`
- `settings.gradle`
- `src/main/java/{package_path}/{PluginName}.java` — 主類（含 `@Plugin`、Guice 注入、lifecycle handlers）
- `src/main/java/{package_path}/listeners/ConnectionListener.java` — 連線事件監聽範例
- `src/main/java/{package_path}/commands/HubCommand.java` — `SimpleCommand` 範例

> `velocity-plugin.json` 由 annotation processor 自動生成，**不需手動建立**。

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
    maven { url = 'https://repo.papermc.io/repository/maven-public/' }
    mavenCentral()
}

dependencies {
    compileOnly("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
    annotationProcessor("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
}

shadowJar {
    archiveClassifier.set('')
}
build.dependsOn shadowJar
```

### Main Class (`{PluginName}.java`)

```java
package {group_id}.{plugin_id};

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
    id          = "{plugin_id}",
    name        = "{PluginName}",
    version     = "1.0.0-SNAPSHOT",
    description = "{description}",
    authors     = {"{author}"}
)
public final class {PluginName} {

    private final ProxyServer server;
    private final Logger logger;
    private final Path dataDirectory;

    @Inject
    public {PluginName}(ProxyServer server, Logger logger, @DataDirectory Path dataDirectory) {
        this.server        = server;
        this.logger        = logger;
        this.dataDirectory = dataDirectory;
    }

    @Subscribe
    public void onProxyInitialize(ProxyInitializeEvent event) {
        logger.info("{PluginName} enabling on Velocity {}...",
            server.getVersion().getVersion());

        server.getEventManager().register(this, new ConnectionListener(server, logger));

        server.getCommandManager().register(
            server.getCommandManager().metaBuilder("hub")
                .plugin(this)
                .build(),
            new HubCommand(server)
        );

        logger.info("{PluginName} enabled.");
    }

    @Subscribe
    public void onProxyShutdown(ProxyShutdownEvent event) {
        logger.info("{PluginName} shutting down.");
    }

    public ProxyServer getServer()     { return server; }
    public Logger getLogger()          { return logger; }
    public Path getDataDirectory()     { return dataDirectory; }
}
```

### Connection Listener (`listeners/ConnectionListener.java`)

```java
package {group_id}.{plugin_id}.listeners;

import com.velocitypowered.api.event.PostOrder;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.event.connection.DisconnectEvent;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.slf4j.Logger;

public class ConnectionListener {

    private final ProxyServer server;
    private final Logger logger;

    public ConnectionListener(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    @Subscribe(order = PostOrder.NORMAL)
    public void onPostLogin(PostLoginEvent event) {
        Player player = event.getPlayer();
        logger.info("{} ({}) connected to the proxy.",
            player.getUsername(), player.getUniqueId());
    }

    @Subscribe(order = PostOrder.NORMAL)
    public void onDisconnect(DisconnectEvent event) {
        logger.info("{} disconnected.", event.getPlayer().getUsername());
    }
}
```

### Hub Command (`commands/HubCommand.java`)

```java
package {group_id}.{plugin_id}.commands;

import com.velocitypowered.api.command.SimpleCommand;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

import java.util.Optional;

public class HubCommand implements SimpleCommand {

    private final ProxyServer server;

    public HubCommand(ProxyServer server) {
        this.server = server;
    }

    @Override
    public void execute(Invocation invocation) {
        if (!(invocation.source() instanceof Player player)) {
            invocation.source().sendMessage(Component.text("Players only.", NamedTextColor.RED));
            return;
        }

        Optional<com.velocitypowered.api.proxy.server.RegisteredServer> hub =
            server.getServer("hub");

        if (hub.isEmpty()) {
            player.sendMessage(Component.text("Hub server not found.", NamedTextColor.RED));
            return;
        }

        player.createConnectionRequest(hub.get()).fireAndForget();
        player.sendMessage(Component.text("Connecting to hub...", NamedTextColor.GREEN));
    }

    @Override
    public boolean hasPermission(Invocation invocation) {
        return true;   // allow everyone; restrict with invocation.source().hasPermission("...")
    }
}
```

## 推薦目錄結構 / Recommended Directory Structure

```
{plugin_id}/
├── build.gradle
├── settings.gradle
└── src/main/java/{group_id}/{plugin_id}/
    ├── {PluginName}.java          ← Main class with @Plugin
    ├── commands/
    │   └── HubCommand.java
    └── listeners/
        └── ConnectionListener.java
```

## 失敗回退 / Fallback

- 若 `annotationProcessor` 未加入 build.gradle，`velocity-plugin.json` 不會生成，Velocity 將拒絕載入插件。
- Plugin `id` 必須全小寫英數 + 連字號，否則 annotation processor 報錯。
- 若找不到 hub server，請確認 `velocity.toml` 中 `[servers]` 有對應的 server 名稱。
