# examples — generate-plugin-skeleton

## 範例 1：Paper 1.21.4 基本插件

**Input:**
```
plugin_name: MyPlugin
group_id: com.example
main_class: MyPlugin
mc_version: 1.21.4
api_type: paper
```

**Output — pom.xml（節錄）:**
```xml
<groupId>com.example</groupId>
<artifactId>MyPlugin</artifactId>
<version>1.0.0-SNAPSHOT</version>

<dependencies>
  <dependency>
    <groupId>io.papermc.paper</groupId>
    <artifactId>paper-api</artifactId>
    <version>1.21.4-R0.1-SNAPSHOT</version>
    <scope>provided</scope>
  </dependency>
</dependencies>
```

**Output — plugin.yml:**
```yaml
name: MyPlugin
version: '${project.version}'
main: com.example.myplugin.MyPlugin
api-version: '1.21'
description: A Minecraft plugin
author: YourName
```

**Output — MyPlugin.java:**
```java
package com.example.myplugin;

import org.bukkit.plugin.java.JavaPlugin;

public final class MyPlugin extends JavaPlugin {

    private static MyPlugin instance;

    @Override
    public void onEnable() {
        instance = this;
        getLogger().info("MyPlugin 已啟動！");
    }

    @Override
    public void onDisable() {
        getLogger().info("MyPlugin 已關閉！");
    }

    public static MyPlugin getInstance() {
        return instance;
    }
}
```

---

## 範例 2：Spigot 1.20.4 插件（含指令與事件）

**Input:**
```
plugin_name: ShopPlugin
group_id: com.myserver
main_class: ShopPlugin
mc_version: 1.20.4
api_type: spigot
```

**Output — plugin.yml（含指令宣告）:**
```yaml
name: ShopPlugin
version: '${project.version}'
main: com.myserver.shopplugin.ShopPlugin
api-version: '1.20'
description: Server shop plugin
author: YourName

commands:
  shop:
    description: 開啟商店介面
    usage: /<command>
    permission: shopplugin.use

permissions:
  shopplugin.use:
    description: 允許使用商店
    default: true
  shopplugin.admin:
    description: 商店管理員權限
    default: op
```

---

## 範例 3：多作者、帶有 depend 的插件

**Input:**
```
plugin_name: EconomyBridge
group_id: org.myproject
main_class: EconomyBridge
mc_version: 1.21.1
api_type: paper
depend: [Vault]
soft_depend: [PlaceholderAPI]
```

**Output — plugin.yml:**
```yaml
name: EconomyBridge
version: '${project.version}'
main: org.myproject.economybridge.EconomyBridge
api-version: '1.21'
description: Vault economy bridge plugin
authors: [YourName, Contributor]
depend: [Vault]
softdepend: [PlaceholderAPI]
```
