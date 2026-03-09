# Testing Skill — Paper

## Purpose
Reference this skill when writing unit tests for Paper plugin code. Covers MockBukkit 4.x for JUnit 5: server mock lifecycle, player mocks, scheduler tick simulation, and testing event handlers and commands without a real server.

## When to Use This Skill
- Testing logic in event handlers, commands, or service classes
- Verifying `ItemMeta`, inventory contents, or PDC values in unit tests
- Running the Bukkit scheduler in tests to confirm delayed/repeating tasks fire correctly
- Testing that custom events are called and cancellable

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `MockBukkit.mock()` | Start the mock server | Returns `ServerMock`; call in `@BeforeEach` |
| `MockBukkit.unmock()` | Shut down and clean up | Call in `@AfterEach`; mandatory |
| `MockBukkit.load(MyPlugin.class)` | Load plugin under test | Returns plugin instance |
| `ServerMock` | Simulated `Server` | Returned by `MockBukkit.mock()` |
| `server.addPlayer()` | Add a simulated player | Returns `PlayerMock` |
| `server.addPlayer(String)` | Add player with specific name | |
| `PlayerMock` | Simulated `Player` | Extends `CraftPlayer`-compatible mock |
| `player.assertSaid(String)` | Assert chat message received | Exact string match |
| `player.assertNoMoreSaid()` | Assert no more messages | |
| `server.getScheduler().performTicks(long)` | Advance scheduler by N ticks | Triggers `runTaskLater`/`runTaskTimer` |
| `server.getScheduler().performOneTick()` | Advance by 1 tick | |
| `MockBukkit.createMockPlugin()` | Create a no-op plugin | For registering listeners under test |

## Code Pattern

```java
package com.yourorg.myplugin;

import be.seeseemelk.mockbukkit.MockBukkit;
import be.seeseemelk.mockbukkit.ServerMock;
import be.seeseemelk.mockbukkit.entity.PlayerMock;
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
    void playerReceivesWelcomeMessage() {
        PlayerMock player = server.addPlayer();
        // Simulate the PlayerJoinEvent being triggered
        player.simulateLogin();

        player.assertSaid("Welcome, " + player.getName() + "!");
        player.assertNoMoreSaid();
    }

    @Test
    void scheduledTaskRunsAfterDelay() {
        PlayerMock player = server.addPlayer();
        plugin.scheduleReminder(player);

        // Fast-forward 5 seconds (100 ticks)
        server.getScheduler().performTicks(100L);

        player.assertSaid("Don't forget to vote!");
    }
}
```

## Common Pitfalls

- **Not calling `MockBukkit.unmock()` in `@AfterEach`**: The mock server holds static state. Forgetting `unmock()` causes subsequent test classes to fail with "already mocked" errors.

- **Using `Bukkit.getServer()` in non-mock code paths**: Code that calls `Bukkit.getServer()` statically will return the `ServerMock` during tests, which is correct — but only after `MockBukkit.mock()` has been called.

- **Testing async tasks with `performTicks()`**: `runTaskAsynchronously` tasks are NOT executed by `performTicks()` — only synchronous main-thread tasks are. Refactor async code so the IO callback switches back to the main thread (testable part) and the IO layer is a separate mock.

- **`MockBukkit.load()` triggers `onEnable()`**: Your plugin's `onEnable()` runs during `load()`. If `onEnable()` depends on external services (e.g., Vault, a database), mock those before calling `load()`.

- **World not available by default**: `server.addSimpleWorld("world")` creates a world. Calling `Bukkit.getWorld("world")` returns `null` unless added first.

## Version Notes

- **MockBukkit v4** (artifact id `mockbukkit-v4`) targets Paper 1.21. Earlier versions (`mockbukkit-v1.x`) target legacy Bukkit/Spigot and are not compatible.
- MockBukkit 4.x requires **JUnit 5** (`junit-jupiter`). JUnit 4 annotations (`@Before`, `@After`) do not work.

## Related Skills

- [mockbukkit-patterns.md](mockbukkit-patterns.md) — Advanced patterns: config mocking, world mocking, event calling, command dispatch
- [../scheduling/scheduler-tasks.md](../scheduling/scheduler-tasks.md) — `performTicks()` maps to `runTaskTimer` tick counts
- [../events/custom-events.md](../events/custom-events.md) — Calling and testing custom events
