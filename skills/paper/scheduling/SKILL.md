# Scheduling Skill — Paper

## Purpose
Reference this skill when running code on a delayed, repeating, or asynchronous basis in a Paper plugin. Covers `BukkitScheduler` task types, `BukkitTask` cancellation, and composing async work with `CompletableFuture`.

## When to Use This Skill
- Running code after a delay (e.g., countdown timers, delayed kicks)
- Running code on every tick or at fixed intervals (e.g., game loops, health regeneration)
- Offloading IO or database work to an async thread without blocking the main thread
- Chaining async operations that must return to the main thread to apply results

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Bukkit.getScheduler()` | Get the `BukkitScheduler` instance | |
| `runTask(plugin, runnable)` | Run on next server tick (main thread) | |
| `runTaskLater(plugin, runnable, delay)` | Run after `delay` ticks (20 ticks = 1 s) | Returns `BukkitTask` |
| `runTaskTimer(plugin, runnable, delay, period)` | Repeating task every `period` ticks | Returns `BukkitTask` |
| `runTaskAsynchronously(plugin, runnable)` | Run immediately on async thread | |
| `runTaskLaterAsynchronously(plugin, runnable, delay)` | Async with delay | |
| `runTaskTimerAsynchronously(plugin, runnable, delay, period)` | Async repeating | |
| `BukkitTask#cancel()` | Cancel a scheduled task | Safe to call from any thread |
| `BukkitTask#isCancelled()` | Check if already cancelled | |
| `BukkitTask#getTaskId()` | Integer task ID | Use with `scheduler.cancelTask(id)` |
| `Bukkit.getScheduler().cancelAllTasks()` | Cancel every task | Use in `onDisable` for cleanup |

## Code Pattern

```java
package com.yourorg.myplugin.tasks;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.util.concurrent.CompletableFuture;

public class TaskExamples {

    private final JavaPlugin plugin;
    private BukkitTask repeatingTask;

    public TaskExamples(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    // --- One-shot delayed task (main thread) ---
    public void delayedWelcome(Player player) {
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (!player.isOnline()) return;   // guard: player may have left
            player.sendMessage(
                net.kyori.adventure.text.Component.text("Welcome! Enjoy your stay.")
            );
        }, 60L);   // 60 ticks = 3 seconds
    }

    // --- Repeating task (main thread) ---
    public void startHealLoop() {
        // Cancel any existing task first
        stopHealLoop();

        repeatingTask = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
            Bukkit.getOnlinePlayers().forEach(p -> {
                if (p.getHealth() < p.getMaxHealth()) {
                    p.setHealth(Math.min(p.getHealth() + 1.0, p.getMaxHealth()));
                }
            });
        }, 0L, 40L);   // start immediately, repeat every 2 seconds
    }

    public void stopHealLoop() {
        if (repeatingTask != null && !repeatingTask.isCancelled()) {
            repeatingTask.cancel();
            repeatingTask = null;
        }
    }

    // --- Async task → back to main thread ---
    public void loadAndApplyData(Player player) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            // Safe: no Bukkit object mutations here
            String data = fetchFromDatabase(player.getUniqueId().toString());

            // Schedule Bukkit mutations back on the main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (!player.isOnline()) return;
                applyData(player, data);
            });
        });
    }

    // --- CompletableFuture async chain ---
    public CompletableFuture<Void> loadAsync(Player player) {
        return CompletableFuture
            .supplyAsync(() -> fetchFromDatabase(player.getUniqueId().toString()))
            .thenAccept(data ->
                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (player.isOnline()) applyData(player, data);
                })
            )
            .exceptionally(ex -> {
                plugin.getSLF4JLogger().error("Failed to load data for {}", player.getName(), ex);
                return null;
            });
    }

    private String fetchFromDatabase(String uuid) { return "data"; }
    private void applyData(Player player, String data) { }
}
```

**Cancel all tasks on shutdown:**
```java
@Override
public void onDisable() {
    Bukkit.getScheduler().cancelAllTasks();
}
```

## Common Pitfalls

- **Calling Bukkit methods from async tasks**: `runTaskAsynchronously` runs on a thread pool. Any call to `player.teleport()`, `world.getBlock()`, etc. from inside it will throw `IllegalStateException` or corrupt data. Always schedule mutations back with `runTask(plugin, ...)`.

- **Not guarding `player.isOnline()` in delayed tasks**: Between scheduling and execution, the player may disconnect. Always check `player.isOnline()` before acting on a `Player` reference in delayed/async callbacks.

- **Starting repeating tasks without stopping previous ones**: Calling `startHealLoop()` twice creates two independent tasks that both run. Store the `BukkitTask` reference and cancel it before creating a new one.

- **Forgetting to cancel tasks in `onDisable`**: Running tasks hold a reference to the plugin. If they continue after `onDisable`, they'll operate on a disabled plugin's state and cause errors on the next tick. Call `cancelAllTasks()` or cancel individual tasks in `onDisable`.

- **Using `Thread.sleep()` in scheduler callbacks**: The BukkitScheduler runs repeating tasks on the main thread tick. Sleeping inside a main-thread task freezes the entire server. Use `runTaskLater` for delays instead.

## Version Notes

- **1.21 / 1.21.1**: `BukkitScheduler` API is unchanged. Paper also exposes Folia's `RegionScheduler` for region-threaded scheduling, but that requires a separate Folia build — standard Paper uses `BukkitScheduler`.
- `runTaskTimerAsynchronously` starts the first execution after `delay` ticks (0 = immediately on next async cycle).

## Related Skills

- [scheduler-tasks.md](scheduler-tasks.md) — Full task type reference with cancellation patterns
- [../storage/database-hikari.md](../storage/database-hikari.md) — Async DB queries (uses scheduler for main-thread callbacks)
- [../events/async-events.md](../events/async-events.md) — Async event thread rules
