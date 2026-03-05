# examples — generate-test-suite

## 範例 1：基本插件啟動測試

**Input:**
```
plugin_main_class: com.example.myplugin.MyPlugin
test_scenarios:
  - 插件能正常啟動/關閉
  - onEnable 後 instance 不為 null
```

**Output — MyPluginTest.java:**
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
    void testPluginLoads() {
        assertNotNull(plugin);
        assertTrue(plugin.isEnabled());
    }

    @Test
    void testInstanceIsSet() {
        assertNotNull(MyPlugin.getInstance());
        assertEquals(plugin, MyPlugin.getInstance());
    }
}
```

**Output — pom.xml test dependencies:**
```xml
<dependency>
  <groupId>com.github.seeseemelk</groupId>
  <artifactId>MockBukkit-v1.21</artifactId>
  <version>3.133.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.10.2</version>
  <scope>test</scope>
</dependency>
```

---

## 範例 2：指令測試

**Input:**
```
plugin_main_class: com.example.myplugin.MyPlugin
test_scenarios:
  - 玩家執行 /myplugin reload 成功
  - 無權限玩家執行 /myplugin reload 被拒絕
```

**Output — CommandTest.java:**
```java
class CommandTest {

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
    void testReloadCommandWithPermission() {
        PlayerMock player = server.addPlayer();
        player.addAttachment(plugin, "myplugin.admin", true);

        server.dispatchCommand(player, "myplugin reload");

        player.assertSaid("§a設定檔已重新載入。");
    }

    @Test
    void testReloadCommandWithoutPermission() {
        PlayerMock player = server.addPlayer();

        server.dispatchCommand(player, "myplugin reload");

        player.assertSaid("§c你沒有執行此指令的權限。");
    }
}
```

---

## 範例 3：事件測試

**Input:**
```
plugin_main_class: com.example.welcomeplugin.WelcomePlugin
test_scenarios:
  - 玩家加入伺服器時收到歡迎訊息
```

**Output — EventTest.java:**
```java
@Test
void testPlayerReceivesWelcomeOnJoin() {
    PlayerMock player = server.addPlayer("TestPlayer");

    // addPlayer() 會觸發 PlayerJoinEvent
    player.assertSaid("§a歡迎來到伺服器，TestPlayer！");
}

@Test
void testJoinMessageIsNull() {
    PlayerJoinEvent event = new PlayerJoinEvent(server.addPlayer(), "join message");
    server.getPluginManager().callEvent(event);

    assertNull(event.getJoinMessage());
}
```
