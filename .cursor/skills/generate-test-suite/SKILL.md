---
name: generate-test-suite
description: 依插件主類與功能描述，產生 JUnit 5 + MockBukkit 單元測試套件骨架，含 pom.xml 依賴設定、MockBukkit 伺服器初始化樣板、常見的玩家/事件/指令測試範例。當使用者說「幫我寫測試」、「MockBukkit 怎麼用」、「JUnit 5 插件測試」、「單元測試骨架」時自動應用。
---

# Generate Test Suite Skill

## 目標

為 Bukkit/Paper 插件產生可直接執行的 JUnit 5 + MockBukkit 測試套件，涵蓋插件啟用/停用、事件觸發、指令執行、設定讀取等常見測試情境。

---

## 使用流程

1. **確認 MockBukkit 版本**：依 MC 版本選擇對應的 MockBukkit
2. **更新 pom.xml**：加入測試依賴
3. **產生測試類別**：依功能需求產生對應的測試骨架
4. **說明執行方式**：`mvn test`

---

## MockBukkit 版本對照

| Minecraft 版本 | MockBukkit 版本 |
|---------------|----------------|
| 1.21.x        | MockBukkit:v1.21:3.x.x |
| 1.20.x        | MockBukkit:v1.20:3.x.x |
| 1.19.x        | MockBukkit:v1.19:3.x.x |

---

## pom.xml 測試依賴

在 `pom.xml` 的 `<dependencies>` 區段加入：

```xml
<!-- JUnit 5 -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>

<!-- MockBukkit（依 MC 版本調整） -->
<dependency>
    <groupId>com.github.seeseemelk</groupId>
    <artifactId>MockBukkit-v1.21</artifactId>
    <version>3.131.0</version>
    <scope>test</scope>
</dependency>
```

在 `<build><plugins>` 區段加入 Surefire 插件以執行 JUnit 5：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.5.0</version>
</plugin>
```

MockBukkit 需要 JitPack repository：

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```

---

## 代碼範本

### 基礎插件生命週期測試

```java
package com.example.myplugin;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MyPluginTest {

    private ServerMock server;
    private MyPlugin plugin;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();
    }

    @Test
    void testPluginEnables() {
        assertTrue(plugin.isEnabled(), "插件應成功啟用");
    }

    @Test
    void testPluginHasCorrectName() {
        assertEquals("MyPlugin", plugin.getName());
    }

    @Test
    void testDefaultConfigLoaded() {
        assertNotNull(plugin.getConfig());
        assertFalse(plugin.getConfig().getBoolean("general.debug"));
    }
}
```

---

### 事件觸發測試

```java
package com.example.myplugin.listeners;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import be.seeseemelk.mockbukkit.entity.PlayerMock;
import com.example.myplugin.MyPlugin;
import org.bukkit.event.player.PlayerJoinEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PlayerListenerTest {

    private ServerMock server;
    private MyPlugin plugin;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();
    }

    @Test
    void testPlayerJoinSendsWelcomeMessage() {
        PlayerMock player = server.addPlayer("TestPlayer");

        // 觸發加入事件
        PlayerJoinEvent event = new PlayerJoinEvent(player, null);
        server.getPluginManager().callEvent(event);

        // 驗證玩家收到訊息（如有）
        // player.assertSaid("歡迎加入！");
        assertTrue(player.isOnline());
    }

    @Test
    void testNewPlayerReceivesWelcome() {
        PlayerMock player = server.addPlayer();

        // 模擬首次登入（MockBukkit 預設 hasPlayedBefore = false）
        assertFalse(player.hasPlayedBefore());

        PlayerJoinEvent event = new PlayerJoinEvent(player, null);
        server.getPluginManager().callEvent(event);

        player.assertSaid("歡迎首次加入！");
    }
}
```

---

### 指令執行測試

```java
package com.example.myplugin.commands;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import be.seeseemelk.mockbukkit.entity.PlayerMock;
import com.example.myplugin.MyPlugin;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MyPluginCommandTest {

    private ServerMock server;
    private MyPlugin plugin;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();
    }

    @Test
    void testCommandNoPermission() {
        PlayerMock player = server.addPlayer();
        // 確保沒有權限
        player.addAttachment(plugin, "myplugin.use", false);

        boolean result = server.dispatchCommand(player, "myplugin");

        player.assertSaid("你沒有權限執行此操作。");
    }

    @Test
    void testCommandWithPermission() {
        PlayerMock player = server.addPlayer();
        player.setOp(true);

        boolean result = server.dispatchCommand(player, "myplugin");
        assertTrue(result);
    }

    @Test
    void testReloadCommand() {
        PlayerMock player = server.addPlayer();
        player.setOp(true);

        server.dispatchCommand(player, "myplugin reload");
        player.assertSaid("配置已重新載入。");
    }

    @Test
    void testConsoleCannotUsePlayerOnlyCommand() {
        // 測試控制台執行限玩家指令
        var console = server.getConsoleSender();
        server.dispatchCommand(console, "myplugin");
        // 控制台應收到提示
        // console.assertSaid("此指令僅限玩家使用。");
    }
}
```

---

### ConfigManager 測試

```java
package com.example.myplugin.managers;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import com.example.myplugin.MyPlugin;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ConfigManagerTest {

    private ServerMock server;
    private MyPlugin plugin;
    private ConfigManager configManager;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
        configManager = plugin.getConfigManager();
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();
    }

    @Test
    void testDefaultDebugIsFalse() {
        assertFalse(configManager.isDebug());
    }

    @Test
    void testDefaultStartingBalance() {
        assertEquals(1000.0, configManager.getStartingBalance(), 0.01);
    }

    @Test
    void testDefaultLanguage() {
        assertEquals("zh-tw", configManager.getLanguage());
    }
}
```

---

## 測試目錄結構

```
src/
└── test/
    └── java/
        └── com/example/myplugin/
            ├── MyPluginTest.java           ← 主類生命週期
            ├── commands/
            │   └── MyPluginCommandTest.java
            ├── listeners/
            │   └── PlayerListenerTest.java
            └── managers/
                └── ConfigManagerTest.java
```

---

## 執行測試

```bash
# 執行所有測試
mvn test

# 執行特定測試類
mvn test -Dtest=MyPluginTest

# 執行含特定關鍵字的測試
mvn test -Dtest="*Command*"
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `IllegalStateException: MockBukkit is not running` | 未呼叫 `MockBukkit.mock()` | 確認 `@BeforeEach` 有 `MockBukkit.mock()` |
| `@AfterEach` 未呼叫 `unmock()` 導致下個測試失敗 | 伺服器狀態殘留 | 每個測試類的 `@AfterEach` 必須呼叫 `MockBukkit.unmock()` |
| `NoSuchCommandException` | 指令未在 plugin.yml 宣告 | 確認 plugin.yml 有對應的 `commands:` 節點 |
| `player.assertSaid()` 失敗 | 訊息格式不符（MiniMessage 標籤未渲染） | 比對原始 MiniMessage 字串或使用 `assertSaidRaw()` |
| Maven 找不到 MockBukkit | 未加入 JitPack repository | 在 pom.xml 加入 `https://jitpack.io` |
