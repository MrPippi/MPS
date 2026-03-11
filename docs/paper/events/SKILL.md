# Events Skill — Paper

## Purpose
Reference this skill when implementing event listeners on a Paper server. Covers event registration, priority ordering, cancellation, and thread-safety rules for all Bukkit/Paper events.

## When to Use This Skill
- Adding a listener for any `org.bukkit.event.*` or `io.papermc.paper.event.*` event
- Deciding event priority for overlapping listeners
- Handling cancellable events correctly
- Working with async events (especially chat)

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Listener` (interface) | Marker interface for event listener classes | Required on listener class |
| `@EventHandler` | Marks a method as an event handler | Method must have exactly one event parameter |
| `EventPriority` | Controls listener order: `LOWEST → LOW → NORMAL → HIGH → HIGHEST → MONITOR` | `MONITOR` = read-only, never cancel here |
| `ignoreCancelled = true` | Skip handler if event already cancelled | Recommended for most handlers |
| `PluginManager#registerEvents(Listener, Plugin)` | Register all `@EventHandler` methods in a listener | Call once in `onEnable` |
| `HandlerList#unregisterAll(Plugin)` | Unregister all listeners for a plugin | Called automatically on `onDisable` |
| `Event#isCancelled()` | Check if event is already cancelled | |
| `Cancellable#setCancelled(boolean)` | Cancel the event | Prevents default action |
| `AsyncChatEvent` | Paper's modern async chat event | Replaces deprecated `AsyncPlayerChatEvent` |

## Code Pattern

```java
package com.yourorg.myplugin.events;

import io.papermc.paper.event.player.AsyncChatEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

public class PlayerJoinListener implements Listener {

    private final JavaPlugin plugin;

    public PlayerJoinListener(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    // Standard listener: NORMAL priority, skip if already cancelled
    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();

        // Set custom join message using Adventure components
        event.joinMessage(Component.text("+ ")
            .color(NamedTextColor.GREEN)
            .append(Component.text(player.getName())
                .color(NamedTextColor.WHITE)));
    }

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();

        event.quitMessage(Component.text("- ")
            .color(NamedTextColor.RED)
            .append(Component.text(player.getName())
                .color(NamedTextColor.WHITE)));
    }

    // Async chat event — DO NOT call Bukkit object mutations here
    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onChat(AsyncChatEvent event) {
        Player player = event.getPlayer();
        Component originalMessage = event.message();

        // Reading player data: safe (immutable snapshot)
        String name = player.getName();

        // Modifying the message: safe (event object, not Bukkit world state)
        event.message(Component.text("[Chat] ")
            .color(NamedTextColor.GRAY)
            .append(originalMessage));

        // NOT safe here: player.teleport(), world.dropItem(), etc.
        // If you must do Bukkit ops, schedule back to main thread:
        // Bukkit.getScheduler().runTask(plugin, () -> { ... });
    }
}
```

**Registering the listener in your main class:**
```java
@Override
public void onEnable() {
    getServer().getPluginManager().registerEvents(new PlayerJoinListener(this), this);
}
```

## Common Pitfalls

- **Calling Bukkit methods from async event handlers**: `AsyncChatEvent` fires on an async thread. Calling `player.teleport()`, `world.dropItem()`, or any world-mutating method will throw `IllegalStateException` or cause data corruption. Schedule back to main thread with `Bukkit.getScheduler().runTask(plugin, runnable)`.

- **Using `MONITOR` priority to cancel events**: `MONITOR` is for read-only observation after all other plugins have processed the event. Cancelling at `MONITOR` is undefined behavior and may be ignored.

- **Not using `ignoreCancelled = true`**: Without it, your handler fires even when another plugin has already cancelled the event, potentially overriding that decision. Add `ignoreCancelled = true` unless you specifically need to handle already-cancelled events.

- **Registering listeners multiple times**: Calling `registerEvents()` twice on the same listener instance doubles all event firings. Register each listener exactly once in `onEnable`.

- **Still using `AsyncPlayerChatEvent`**: This event is deprecated in Paper 1.19+ and removed in some builds. Use `AsyncChatEvent` from `io.papermc.paper.event.player` instead.

## Version Notes

- **1.21**: `AsyncChatEvent` is the standard chat event. `AsyncPlayerChatEvent` is deprecated.
- **1.21.1**: No breaking changes to event API vs 1.21.
- **Both**: `PlayerMoveEvent` fires very frequently (every tick a player is loaded). Use `event.hasExplicitlyMoved()` or `event.hasChangedPosition()` to filter out head rotations.

## Related Skills

- [player-events.md](player-events.md) — Detailed PlayerJoinEvent, PlayerMoveEvent, PlayerInteractEvent reference
- [world-events.md](world-events.md) — Block and entity events
- [custom-events.md](custom-events.md) — Creating and firing your own events
- [async-events.md](async-events.md) — Threading rules for async events
- [../commands/SKILL.md](../commands/SKILL.md) — Command registration
