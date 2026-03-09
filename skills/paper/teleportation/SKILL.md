# Teleportation Skill — Paper

## Purpose
Reference this skill when teleporting players or entities in Paper 1.21. Covers async teleport (`teleportAsync`), safe destination detection, `EntityTeleportEvent`, and cross-world teleportation patterns.

## When to Use This Skill
- Teleporting a player to a saved home location
- Sending a player to a warp point safely (ensuring the destination is not inside a block)
- Cross-world teleportation (e.g., hub → game world)
- Preventing certain entity teleports via event cancellation

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Player#teleportAsync(Location)` | Async teleport (returns `CompletableFuture<Boolean>`) | Preferred in Paper 1.21 |
| `Player#teleportAsync(Location, PlayerTeleportEvent.TeleportCause)` | Async with cause | `TeleportCause.PLUGIN` for programmatic |
| `Entity#teleport(Location)` | Sync teleport (main thread only) | Still works; blocks tick briefly for chunk load |
| `Location#isSafe()` | Paper extension — checks if standing here is safe | Not in vanilla Bukkit API |
| `Block#isPassable()` | Check if a block can be walked through | For manual safety checks |
| `Block#isSolid()` | Check if block is solid | |
| `PlayerTeleportEvent` | Fires before a player teleports | Cancellable |
| `EntityTeleportEvent` | Fires before any entity teleports | Cancellable; fires for non-player entities too |
| `PlayerTeleportEvent.TeleportCause` | Reason for teleport | `PLUGIN`, `COMMAND`, `NETHER_PORTAL`, etc. |

## Code Pattern

```java
package com.yourorg.myplugin.teleportation;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.player.PlayerTeleportEvent;
import org.bukkit.plugin.java.JavaPlugin;

public class TeleportService {

    private final JavaPlugin plugin;

    public TeleportService(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    // Async teleport with feedback (Paper 1.21 preferred pattern)
    public void teleportToHome(Player player, Location home) {
        // Find a safe spot at the destination
        Location safe = findSafeLocation(home);
        if (safe == null) {
            player.sendMessage(
                Component.text("Home location is unsafe. Please reset it.")
                    .color(NamedTextColor.RED)
            );
            return;
        }

        player.sendActionBar(Component.text("Teleporting...").color(NamedTextColor.YELLOW));

        player.teleportAsync(safe, PlayerTeleportEvent.TeleportCause.PLUGIN)
            .thenAccept(success -> {
                // This callback may run on an async thread
                if (success) {
                    // Schedule message on main thread (player mutation)
                    org.bukkit.Bukkit.getScheduler().runTask(plugin, () -> {
                        if (player.isOnline()) {
                            player.sendMessage(
                                Component.text("Teleported to your home!")
                                    .color(NamedTextColor.GREEN)
                            );
                        }
                    });
                } else {
                    org.bukkit.Bukkit.getScheduler().runTask(plugin, () -> {
                        if (player.isOnline()) {
                            player.sendMessage(
                                Component.text("Teleport failed.").color(NamedTextColor.RED)
                            );
                        }
                    });
                }
            })
            .exceptionally(ex -> {
                plugin.getSLF4JLogger().error("Teleport failed for {}", player.getName(), ex);
                return null;
            });
    }

    // Find the highest safe location at x,z — useful for surface warps
    public Location findSafeLocation(Location base) {
        World world = base.getWorld();
        if (world == null) return null;

        // Check the exact location first (e.g., saved homes at exact coords)
        if (isSafe(base)) return base.clone().add(0, 0, 0);

        // Walk upward from base to find air above solid ground
        Location check = base.clone();
        for (int dy = 0; dy <= 5; dy++) {
            check.setY(base.getY() + dy);
            if (isSafe(check)) return check;
        }
        return null;
    }

    // A location is safe if feet and head blocks are passable and floor is solid
    private boolean isSafe(Location loc) {
        World world = loc.getWorld();
        if (world == null) return false;

        Block feet  = world.getBlockAt(loc);
        Block head  = world.getBlockAt(loc.clone().add(0, 1, 0));
        Block floor = world.getBlockAt(loc.clone().add(0, -1, 0));

        return feet.isPassable()
            && head.isPassable()
            && floor.isSolid()
            && !floor.isPassable();
    }
}
```

## Common Pitfalls

- **Using sync `teleport()` for cross-world or long-distance teleports in Paper**: Synchronous `teleport()` loads the destination chunk on the main thread, causing a brief freeze. Prefer `teleportAsync()` in Paper 1.21 for all teleports except trivial short-distance moves within the same loaded chunk.

- **`teleportAsync` result callback on async thread**: The `CompletableFuture<Boolean>` callback from `teleportAsync` may execute on an async thread. Do not call Bukkit methods (like `player.sendMessage()`) directly inside `.thenAccept()` — schedule them with `runTask(plugin, ...)`.

- **Teleporting to a Location with a null World**: Always check `location.getWorld() != null` before teleporting. Serialised locations from config may have a null world if the world name changed.

- **Not checking `player.isOnline()` in async callback**: The player may disconnect between the teleport initiation and the callback. Guard with `if (player.isOnline())`.

## Version Notes

- **1.21 / 1.21.1**: `teleportAsync()` is the recommended approach and handles async chunk loading internally. The sync `teleport()` still works for cases where the destination chunk is guaranteed to be loaded.
- Paper's `Location#isSafe()` is a convenience method only available on Paper builds, not in vanilla Bukkit.

## Related Skills

- [teleport-patterns.md](teleport-patterns.md) — EntityTeleportEvent, countdown teleport with cancellation, cross-world patterns
- [../scheduling/SKILL.md](../scheduling/SKILL.md) — Countdown timers before teleport
- [../events/player-events.md](../events/player-events.md) — PlayerMoveEvent for teleport-region tracking
