# Scheduler Tasks — Paper

Complete reference for all `BukkitScheduler` task types, `BukkitTask` management, and common async/sync patterns.

---

## Task Type Summary

| Method | Thread | Delay | Repeating |
|--------|--------|-------|-----------|
| `runTask` | Main | No | No |
| `runTaskLater` | Main | Yes | No |
| `runTaskTimer` | Main | Yes | Yes |
| `runTaskAsynchronously` | Async | No | No |
| `runTaskLaterAsynchronously` | Async | Yes | No |
| `runTaskTimerAsynchronously` | Async | Yes | Yes |

**Tick to time conversion**: 20 ticks = 1 second. Use `20L * seconds` to express durations.

---

## `runTask` — Next Tick (Main Thread)

Use when you need to defer Bukkit object mutations to the next server tick, e.g., from inside an async callback.

```java
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

Bukkit.getScheduler().runTask(plugin, () -> {
    // Runs on the very next server tick — main thread safe
    player.teleport(spawn);
});
```

---

## `runTaskLater` — Delayed (Main Thread)

```java
import org.bukkit.scheduler.BukkitTask;

// Run after 5 seconds (100 ticks)
BukkitTask task = Bukkit.getScheduler().runTaskLater(plugin, () -> {
    if (!player.isOnline()) return;
    player.sendMessage(net.kyori.adventure.text.Component.text("Time's up!"));
}, 100L);

// Cancel early if needed
task.cancel();
```

---

## `runTaskTimer` — Repeating (Main Thread)

```java
import org.bukkit.scheduler.BukkitTask;

// Countdown timer: runs every second for 10 seconds
final int[] countdown = {10};

BukkitTask timer = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
    if (countdown[0] <= 0) {
        // Game starts — this callback cancels itself from within:
        // You cannot cancel from inside; store reference and cancel after
        return;
    }
    Bukkit.broadcastMessage("Game starts in " + countdown[0] + "...");
    countdown[0]--;
}, 0L, 20L);   // start immediately, every 1 second

// Self-cancelling pattern using task id:
final int[] taskId = {-1};
taskId[0] = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
    if (countdown[0]-- <= 0) {
        Bukkit.getScheduler().cancelTask(taskId[0]);
    }
}, 0L, 20L).getTaskId();
```

---

## `runTaskAsynchronously` — Immediate Async

```java
Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
    // IO, DB, HTTP — safe on async thread
    String result = expensiveIoOperation();

    // Must return to main thread to touch Bukkit objects
    Bukkit.getScheduler().runTask(plugin, () -> player.sendMessage(result));
});
```

---

## `runTaskLaterAsynchronously` — Delayed Async

```java
// Send async notification 10 seconds after event
Bukkit.getScheduler().runTaskLaterAsynchronously(plugin, () -> {
    notificationService.push(player.getUniqueId(), "Match found!");
}, 200L);
```

---

## `runTaskTimerAsynchronously` — Repeating Async

```java
import org.bukkit.scheduler.BukkitTask;

// Poll a database every 30 seconds
BukkitTask pollTask = Bukkit.getScheduler().runTaskTimerAsynchronously(plugin, () -> {
    int count = database.getQueuedPlayers();
    if (count > 0) {
        // Use runTask to broadcast — Bukkit mutation
        Bukkit.getScheduler().runTask(plugin, () ->
            Bukkit.broadcastMessage(count + " players in queue.")
        );
    }
}, 0L, 600L);   // every 30 seconds
```

---

## BukkitTask Lifecycle

```java
BukkitTask task = Bukkit.getScheduler().runTaskTimer(plugin, () -> { ... }, 0L, 20L);

int id = task.getTaskId();          // integer ID for cancelTask(id)
boolean done = task.isCancelled();  // check state
task.cancel();                      // stop the task

// Cancel by ID (useful when you only stored the ID)
Bukkit.getScheduler().cancelTask(id);

// Cancel everything (use in onDisable)
Bukkit.getScheduler().cancelAllTasks();
```

---

## CompletableFuture Patterns

### Simple Async + Main Thread Apply

```java
import java.util.concurrent.CompletableFuture;

public CompletableFuture<Void> fetchAndApply(Player player) {
    return CompletableFuture
        .supplyAsync(() -> database.load(player.getUniqueId()))   // async IO
        .thenAccept(data ->
            Bukkit.getScheduler().runTask(plugin, () -> {         // main thread
                if (player.isOnline()) applyData(player, data);
            })
        )
        .exceptionally(ex -> {
            plugin.getSLF4JLogger().error("Load failed for {}", player.getName(), ex);
            return null;
        });
}
```

### Chained Operations

```java
CompletableFuture
    .supplyAsync(() -> database.getPlayerRank(uuid))       // async: fetch rank
    .thenApplyAsync(rank -> permissionService.map(rank))   // async: map to perms
    .thenAccept(perms ->
        Bukkit.getScheduler().runTask(plugin, () ->        // main: apply
            applyPermissions(player, perms)
        )
    );
```

### Waiting for Multiple Futures

```java
CompletableFuture<String> rankFuture  = CompletableFuture.supplyAsync(() -> db.getRank(uuid));
CompletableFuture<Integer> coinFuture = CompletableFuture.supplyAsync(() -> db.getCoins(uuid));

CompletableFuture.allOf(rankFuture, coinFuture).thenRun(() ->
    Bukkit.getScheduler().runTask(plugin, () -> {
        String rank  = rankFuture.join();
        int coins    = coinFuture.join();
        applyAll(player, rank, coins);
    })
);
```

---

## Cancelling All Tasks on Plugin Disable

```java
// In your main plugin class
private final List<BukkitTask> activeTasks = new ArrayList<>();

public void trackTask(BukkitTask task) {
    activeTasks.add(task);
}

@Override
public void onDisable() {
    activeTasks.forEach(BukkitTask::cancel);
    activeTasks.clear();
    // Or simply:
    // Bukkit.getScheduler().cancelAllTasks();
    // (this cancels ALL plugins' tasks, so prefer tracking your own)
}
```

---

## Common Pitfalls

- **Mutating Bukkit objects from async task threads**: Use `runTask(plugin, ...)` to hop back to the main thread before touching `Player`, `World`, `Entity`, or `ItemStack`.

- **`cancelAllTasks()` cancels other plugins' tasks**: Only use in `onDisable` as a last resort. Prefer tracking individual `BukkitTask` references.

- **Integer overflow on very long delays**: `runTaskLater` takes `long` ticks. For 1 hour: `20L * 60 * 60 = 72000L`. Always use `L` suffix on tick literals.

- **Lambda captures of mutable local variables**: Java requires effectively-final captures. Use `final int[] counter = {0}` or `AtomicInteger` for mutable state inside task lambdas.
