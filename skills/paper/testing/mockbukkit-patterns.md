# MockBukkit Patterns — Paper

Advanced MockBukkit 4.x patterns for Paper 1.21: Gradle setup, config mocking, world mocking, event dispatch, command testing, scheduler simulation, and common test structures.

---

## Gradle Setup

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

group = 'com.yourorg.myplugin'
version = '1.0.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    maven { url = 'https://repo.papermc.io/repository/maven-public/' }
    mavenCentral()
}

dependencies {
    compileOnly("io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT")

    // Test dependencies
    testImplementation("com.github.seeseemelk:MockBukkit-v1.21:4.+")  // MockBukkit v4 for 1.21
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.+")
}

test {
    useJUnitPlatform()
}
```

> The artifact is `MockBukkit-v1.21` (version tag in artifact ID) but the library version is `4.x`. Check [MockBukkit releases](https://github.com/MockBukkit/MockBukkit/releases) for the latest `4.x` version.

---

## Basic Test Lifecycle

```java
import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

class BaseTest {

    protected ServerMock server;
    protected MyPlugin plugin;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();           // starts mock Bukkit server
        plugin = MockBukkit.load(MyPlugin.class);  // triggers onEnable()
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();                  // MUST always call — clears static state
    }
}
```

---

## Player Mocks

```java
import be.seeseemelk.mockbukkit.entity.PlayerMock;
import org.bukkit.GameMode;

@Test
void testPlayerInteraction() {
    PlayerMock player = server.addPlayer("Steve");

    // Permission granting
    player.addAttachment(plugin, "myplugin.use", true);

    assertTrue(player.hasPermission("myplugin.use"));

    // Simulate actions
    player.setHealth(10.0);
    player.setGameMode(GameMode.SURVIVAL);
    player.setOp(false);

    // Assert messages sent to player
    player.simulateChat("Hello");   // triggers AsyncChatEvent

    // Direct message assertion
    plugin.getSomeService().notify(player, "Done!");
    player.assertSaid("Done!");
    player.assertNoMoreSaid();      // asserts no additional messages
}
```

---

## World Mocking

```java
import be.seeseemelk.mockbukkit.WorldMock;
import org.bukkit.Location;
import org.bukkit.Material;

@Test
void testWorldInteraction() {
    // Add a world (required before Bukkit.getWorld("world") returns non-null)
    WorldMock world = server.addSimpleWorld("world");

    Location loc = new Location(world, 0, 64, 0);
    world.getBlockAt(loc).setType(Material.STONE);

    assertEquals(Material.STONE, world.getBlockAt(loc).getType());
}
```

---

## Config Mocking

MockBukkit pre-populates `plugin.getConfig()` from your `src/main/resources/config.yml`. Override values directly in tests:

```java
@Test
void testConfigValue() {
    // Loaded from actual config.yml in resources
    plugin.getConfig().set("greeting", "Hello, {player}!");
    // plugin reloads config internally, or test reads config directly
    String greeting = plugin.getConfig().getString("greeting");
    assertEquals("Hello, {player}!", greeting);
}
```

If your plugin calls `saveDefaultConfig()` in `onEnable()`, MockBukkit serves the file from `src/main/resources/config.yml` during tests.

---

## Event Dispatch

Call events directly to test handlers:

```java
import org.bukkit.event.player.PlayerJoinEvent;
import net.kyori.adventure.text.Component;

@Test
void testJoinEventHandler() {
    PlayerMock player = server.addPlayer("Alex");

    // Fire a join event manually
    PlayerJoinEvent event = new PlayerJoinEvent(player, Component.text("Alex joined."));
    server.getPluginManager().callEvent(event);

    // Handler sends welcome message — assert it was received
    player.assertSaid("Welcome to the server, Alex!");
}
```

---

## Cancellable Event Testing

```java
import org.bukkit.event.block.BlockBreakEvent;

@Test
void testBlockBreakCancellation() {
    WorldMock world = server.addSimpleWorld("world");
    PlayerMock player = server.addPlayer();
    Location loc = new Location(world, 10, 64, 10);
    world.getBlockAt(loc).setType(org.bukkit.Material.BEDROCK);

    BlockBreakEvent event = new BlockBreakEvent(world.getBlockAt(loc), player);
    server.getPluginManager().callEvent(event);

    // Bedrock protection listener should cancel the event
    assertTrue(event.isCancelled(), "Breaking bedrock should be cancelled");
}
```

---

## Custom Event Testing

```java
import com.yourorg.myplugin.event.PlayerLevelUpEvent;

@Test
void testCustomEventFired() {
    PlayerMock player = server.addPlayer();

    // Track whether the custom event was fired
    final boolean[] fired = {false};
    server.getPluginManager().registerEvents(new Listener() {
        @EventHandler
        public void onLevelUp(PlayerLevelUpEvent event) {
            fired[0] = true;
        }
    }, plugin);

    plugin.getLevelService().grantLevel(player);

    assertTrue(fired[0], "PlayerLevelUpEvent should have been fired");
}
```

---

## Scheduler Simulation

```java
import org.bukkit.scheduler.BukkitTask;

@Test
void testDelayedTask() {
    PlayerMock player = server.addPlayer();

    // Plugin schedules a task to run after 100 ticks (5 seconds)
    plugin.scheduleReminder(player);

    // Not fired yet
    player.assertNoMoreSaid();

    // Advance 99 ticks — still not fired
    server.getScheduler().performTicks(99L);
    player.assertNoMoreSaid();

    // Advance 1 more tick — fires now
    server.getScheduler().performOneTick();
    player.assertSaid("Reminder: vote for the server!");
}

@Test
void testRepeatingTask() {
    PlayerMock player = server.addPlayer();
    plugin.startHeartbeatTask(player);   // runs every 20 ticks

    server.getScheduler().performTicks(20L);
    player.assertSaid("Heartbeat 1");

    server.getScheduler().performTicks(20L);
    player.assertSaid("Heartbeat 2");
}
```

---

## Command Testing

```java
import org.bukkit.command.PluginCommand;

@Test
void testBalanceCommand() {
    PlayerMock player = server.addPlayer("Steve");
    player.addAttachment(plugin, "myplugin.balance", true);

    // Dispatch the command as the player
    server.dispatchCommand(player, "balance");

    player.assertSaid("Your balance: $0.00");
}

@Test
void testCommandRequiresPermission() {
    PlayerMock player = server.addPlayer();
    // No permission granted

    server.dispatchCommand(player, "admin reload");

    player.assertSaid("You don't have permission.");
}
```

---

## ItemStack and Inventory Testing

```java
import org.bukkit.Material;
import org.bukkit.inventory.ItemStack;

@Test
void testItemGrant() {
    PlayerMock player = server.addPlayer();

    plugin.getRewardService().giveReward(player);

    // Check inventory contains diamond sword
    boolean found = false;
    for (ItemStack item : player.getInventory().getContents()) {
        if (item != null && item.getType() == Material.DIAMOND_SWORD) {
            found = true;
            break;
        }
    }
    assertTrue(found, "Player should have received a diamond sword");
}
```

---

## Testing with PDC

```java
import org.bukkit.NamespacedKey;
import org.bukkit.persistence.PersistentDataType;

@Test
void testPdcMarking() {
    PlayerMock player = server.addPlayer();
    NamespacedKey key = new NamespacedKey(plugin, "is_vip");

    plugin.getVipService().markVip(player);

    assertTrue(player.getPersistentDataContainer().has(key, PersistentDataType.BOOLEAN));
    assertEquals(Boolean.TRUE,
        player.getPersistentDataContainer().get(key, PersistentDataType.BOOLEAN));
}
```

---

## Full Example Test Class

```java
package com.yourorg.myplugin;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import be.seeseemelk.mockbukkit.WorldMock;
import be.seeseemelk.mockbukkit.entity.PlayerMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GreetingServiceTest {

    private ServerMock server;
    private MyPlugin plugin;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
        server.addSimpleWorld("world");   // default world available
    }

    @AfterEach
    void tearDown() {
        MockBukkit.unmock();
    }

    @Test
    void greetingUsesPlayerName() {
        PlayerMock player = server.addPlayer("Notch");
        plugin.getGreetingService().greet(player);
        player.assertSaid("Hello, Notch!");
    }

    @Test
    void greetingNotSentToOfflinePlayer() {
        PlayerMock player = server.addPlayer("Herobrine");
        player.disconnect();
        // Should not throw even if player is offline
        assertDoesNotThrow(() -> plugin.getGreetingService().greet(player));
    }

    @Test
    void cooldownPreventsDoubleGreeting() {
        PlayerMock player = server.addPlayer("Steve");
        plugin.getGreetingService().greet(player);
        plugin.getGreetingService().greet(player);  // second call within cooldown

        player.assertSaid("Hello, Steve!");
        player.assertNoMoreSaid();   // second greeting was blocked
    }
}
```

---

## Common Pitfalls

- **`MockBukkit.unmock()` not called after a test failure**: `@AfterEach` runs even when tests fail, so always put `unmock()` there — never in a `try/finally` in `@Test`.

- **`MockBukkit.load()` calls `onEnable()`**: If `onEnable()` has side effects (file I/O, network, scheduler tasks), they execute immediately. Mock external dependencies before calling `load()`.

- **Async tasks not ticked**: `runTaskAsynchronously` tasks run in a real async thread in MockBukkit tests, not via `performTicks()`. Keep testable logic in synchronous main-thread code.

- **`PlayerMock.simulateLogin()` vs `server.addPlayer()`**: `server.addPlayer()` creates the player and triggers join events automatically. `simulateLogin()` can be used on an already-added player to re-trigger join events.

- **`assertSaid` consumes the message**: Each call to `assertSaid` pops one message from the queue. Call `assertNoMoreSaid()` at the end to ensure no unexpected messages remain.
