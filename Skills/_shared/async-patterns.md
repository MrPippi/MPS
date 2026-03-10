# Async Patterns — Cross-Platform Reference

Covers async/sync threading patterns for Paper, Velocity, and Waterfall. Always check the platform before choosing a threading approach — each platform has different rules.

---

## Platform Threading Model Summary

| Platform | Default thread | Event thread | IO recommendation |
|----------|---------------|-------------|------------------|
| Paper | Main server thread (sync) | Mix: most sync, some async (`AsyncChatEvent`) | Use `runTaskAsynchronously` |
| Velocity | Async event thread pool | Always async | Use `Scheduler.buildTask()` or `CompletableFuture` |
| Waterfall | Main proxy thread (sync) | Mostly sync | Use `getScheduler().runAsync()` |

---

## Paper — BukkitScheduler Patterns

### Rule: Bukkit objects are NOT thread-safe

All mutations of `Player`, `World`, `Entity`, `ItemStack`, etc. must happen on the main server thread.

| Action | Thread |
|--------|--------|
| Read/write `Player`, `World`, `Entity`, `ItemStack` | **Main thread only** |
| Database queries (SELECT, INSERT, UPDATE) | Async thread |
| HTTP requests | Async thread |
| File I/O | Async thread |
| `player.sendMessage()`, `player.teleport()` | Main thread |

### Pattern 1: One-shot async → back to main

```java
// Fire async, switch back to main after IO completes
plugin.getServer().getScheduler().runTaskAsynchronously(plugin, () -> {
    // async: safe for IO
    String result = database.query("SELECT data FROM players WHERE uuid = ?", uuid);

    // switch back to main for Bukkit API calls
    plugin.getServer().getScheduler().runTask(plugin, () -> {
        if (!player.isOnline()) return;        // always guard — player may have left
        player.sendMessage(Component.text(result));
    });
});
```

### Pattern 2: CompletableFuture chain

```java
CompletableFuture
    .supplyAsync(() -> database.fetchPlayerData(uuid))       // async
    .thenAccept(data ->
        Bukkit.getScheduler().runTask(plugin, () -> {        // back to main
            if (player.isOnline()) applyData(player, data);
        })
    )
    .exceptionally(ex -> {
        plugin.getSLF4JLogger().error("Failed to load data for {}", uuid, ex);
        return null;
    });
```

### Pattern 3: Delayed task (main thread)

```java
// Run after 3 seconds (60 ticks)
Bukkit.getScheduler().runTaskLater(plugin, () -> {
    if (!player.isOnline()) return;
    player.sendMessage(Component.text("3 seconds later!"));
}, 60L);
```

### Pattern 4: Repeating task

```java
BukkitTask task = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
    // runs every 2 seconds
    Bukkit.getOnlinePlayers().forEach(p ->
        p.setHealth(Math.min(p.getHealth() + 1.0, p.getMaxHealth()))
    );
}, 0L, 40L);   // start immediately, repeat every 40 ticks

// Cancel in onDisable:
// task.cancel();
// Or: Bukkit.getScheduler().cancelAllTasks();
```

### Async Event Pitfall

`AsyncChatEvent` fires on an async thread. Do NOT call Bukkit world/entity methods from its handler:

```java
@EventHandler
public void onChat(AsyncChatEvent event) {
    // SAFE: read event data
    String msg = PlainTextComponentSerializer.plainText().serialize(event.message());

    // UNSAFE: do NOT call player.teleport(), world.getBlock(), etc. here
    // If you need Bukkit API, schedule it:
    Bukkit.getScheduler().runTask(plugin, () -> {
        // Bukkit API calls here
    });
}
```

---

## Velocity — Async-First Patterns

### Rule: All @Subscribe handlers are already async

Velocity's event system runs handlers on an async thread pool. There is no "main thread" to worry about for event handling.

| Action | Thread |
|--------|--------|
| Reading `Player` objects (immutable proxy view) | Any thread |
| Sending plugin messages | Any thread (via `ChannelMessageSink`) |
| Database / HTTP calls | Recommended: separate scheduler task |
| Connecting player to a server | Any thread (Velocity handles it) |

### Pattern 1: Simple async event handler

```java
@Subscribe(order = PostOrder.NORMAL)
public void onPostLogin(PostLoginEvent event) {
    Player player = event.getPlayer();
    // Already on async thread — safe to do IO directly (but best practice: use scheduler)
    logger.info("{} connected.", player.getUsername());
}
```

### Pattern 2: Async IO inside event handler

```java
@Subscribe
public void onPostLogin(PostLoginEvent event) {
    Player player = event.getPlayer();

    // Schedule heavy IO off the event thread
    proxyServer.getScheduler()
        .buildTask(plugin, () -> {
            PlayerData data = database.loadPlayer(player.getUniqueId());
            // No "main thread" needed — just use Velocity API directly
            player.sendMessage(Component.text("Welcome back, " + data.rank() + "!"));
        })
        .schedule();
}
```

### Pattern 3: CompletableFuture

```java
CompletableFuture
    .supplyAsync(() -> database.loadPlayer(uuid))
    .thenAccept(data -> player.sendMessage(Component.text("Rank: " + data.rank())))
    .exceptionally(ex -> {
        logger.error("Failed to load data for {}", uuid, ex);
        return null;
    });
```

### Awaitable Events (EventTask)

For events where you need to complete async work before the event result is applied:

```java
@Subscribe
public EventTask onLogin(LoginEvent event) {
    return EventTask.async(() -> {
        // This runs async and Velocity waits for it to complete
        boolean banned = database.isBanned(event.getPlayer().getUniqueId());
        if (banned) {
            event.setResult(ResultedEvent.ComponentResult.denied(
                Component.text("You are banned.")
            ));
        }
    });
}
```

---

## Waterfall — BungeeCord Scheduler Patterns

### Rule: Main proxy thread for most operations

Waterfall follows a similar sync model to Bukkit. Most event handlers run on the main proxy thread.

### Pattern 1: Async task for IO

```java
getProxy().getScheduler().runAsync(plugin, () -> {
    // database / IO work — off the main thread
    PlayerData data = database.load(player.getUniqueId());
    // BungeeCord API calls are generally thread-safe at proxy level
    player.sendMessage(new TextComponent("Welcome, " + data.rank() + "!"));
});
```

### Pattern 2: Scheduled task with delay

```java
getProxy().getScheduler().schedule(plugin, () -> {
    player.sendMessage(new TextComponent("1 second later!"));
}, 1, TimeUnit.SECONDS);
```

### Pattern 3: Repeating task

```java
getProxy().getScheduler().schedule(plugin, () -> {
    getProxy().getOnlineCount();   // check player count every 30 seconds
}, 0, 30, TimeUnit.SECONDS);
```

---

## Cross-Platform: CompletableFuture Best Practices

These patterns work on all three platforms:

```java
// Always handle exceptions
CompletableFuture.supplyAsync(this::fetchData)
    .thenAccept(data -> process(data))
    .exceptionally(ex -> {
        logger.error("Async operation failed", ex);
        return null;
    });

// Compose multiple async operations
CompletableFuture.supplyAsync(() -> database.loadProfile(uuid))
    .thenCompose(profile -> CompletableFuture.supplyAsync(() -> database.loadStats(profile.id())))
    .thenAccept(stats -> notifyPlayer(stats));
```

---

## Related Skills

- `Skills/paper/PLATFORM.md` — Paper platform overview
- `Skills/velocity/PLATFORM.md` — Velocity platform overview
- `Skills/waterfall/PLATFORM.md` — Waterfall platform overview
- `Skills/_shared/cross-server-messaging.md` — Plugin messaging across platforms
- `skills/paper/scheduling/` — Detailed Paper scheduler reference
- `skills/velocity/events/` — Velocity event system reference
