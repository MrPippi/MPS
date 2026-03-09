# Teleport Patterns — Paper

Advanced teleportation patterns: countdown with cancel-on-move, EntityTeleportEvent, cross-world warps, and bed/respawn-anchor override.

---

## Countdown Teleport (Cancel on Move)

A common server feature: start a 5-second timer, cancel if the player moves.

```java
package com.yourorg.myplugin.teleportation;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.HandlerList;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.util.UUID;

public class CountdownTeleport implements Listener {

    private final JavaPlugin plugin;
    private final Player player;
    private final Location destination;
    private final Location startLocation;

    private BukkitTask task;
    private int countdown;

    public CountdownTeleport(JavaPlugin plugin, Player player, Location destination, int seconds) {
        this.plugin       = plugin;
        this.player       = player;
        this.destination  = destination;
        this.startLocation = player.getLocation().clone();
        this.countdown    = seconds;
    }

    public void start() {
        // Register move/quit listener
        Bukkit.getPluginManager().registerEvents(this, plugin);

        task = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
            if (!player.isOnline()) { cancel(); return; }

            if (countdown <= 0) {
                executeTeleport();
                return;
            }

            player.sendActionBar(Component.text("Teleporting in " + countdown + "s...")
                .color(NamedTextColor.YELLOW));
            countdown--;

        }, 0L, 20L);   // tick immediately, then every second
    }

    private void executeTeleport() {
        cleanup();
        player.teleportAsync(destination).thenAccept(success -> {
            if (success) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (player.isOnline()) {
                        player.sendMessage(
                            Component.text("Teleported!").color(NamedTextColor.GREEN)
                        );
                    }
                });
            }
        });
    }

    public void cancel() {
        cleanup();
        if (player.isOnline()) {
            player.sendActionBar(Component.text("Teleport cancelled.")
                .color(NamedTextColor.RED));
        }
    }

    private void cleanup() {
        if (task != null) { task.cancel(); task = null; }
        HandlerList.unregisterAll(this);
    }

    @EventHandler
    public void onMove(PlayerMoveEvent event) {
        if (!event.getPlayer().getUniqueId().equals(player.getUniqueId())) return;
        if (!event.hasChangedBlock()) return;   // ignore head rotation

        // Player moved — cancel teleport
        cancel();
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        if (event.getPlayer().getUniqueId().equals(player.getUniqueId())) {
            cancel();
        }
    }
}
```

**Usage:**
```java
new CountdownTeleport(plugin, player, homeLocation, 5).start();
```

---

## PlayerTeleportEvent

**Package**: `org.bukkit.event.player.PlayerTeleportEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires whenever a player is teleported — by plugin, command, portal, ender pearl, etc.

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerTeleportEvent;

public class TeleportListener implements Listener {

    @EventHandler
    public void onTeleport(PlayerTeleportEvent event) {
        PlayerTeleportEvent.TeleportCause cause = event.getCause();

        // Log plugin-initiated teleports
        if (cause == PlayerTeleportEvent.TeleportCause.PLUGIN) {
            plugin.getSLF4JLogger().info("{} teleported by plugin from {} to {}",
                event.getPlayer().getName(),
                event.getFrom(),
                event.getTo());
        }

        // Prevent teleporting through a specific world's nether portal
        if (cause == PlayerTeleportEvent.TeleportCause.NETHER_PORTAL
                && "pvp-arena".equals(event.getFrom().getWorld().getName())) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(
                Component.text("You cannot use portals in the arena.")
                    .color(NamedTextColor.RED)
            );
        }
    }
}
```

### TeleportCause Values

| Cause | Trigger |
|-------|---------|
| `PLUGIN` | `player.teleport()` / `teleportAsync()` called by a plugin |
| `COMMAND` | `/tp`, `/teleport` command |
| `NETHER_PORTAL` | Walked through a nether portal |
| `END_PORTAL` | Walked through the end portal |
| `ENDER_PEARL` | Thrown ender pearl landed |
| `CHORUS_FRUIT` | Eaten chorus fruit |
| `SPECTATE` | Spectator mode click |
| `UNKNOWN` | Other causes |

---

## EntityTeleportEvent

**Package**: `org.bukkit.event.entity.EntityTeleportEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires for non-player entity teleports (mobs using ender pearls, endermen, chorus fruit mob effects).

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityTeleportEvent;
import org.bukkit.entity.EntityType;

public class EntityTeleportListener implements Listener {

    @EventHandler
    public void onEntityTeleport(EntityTeleportEvent event) {
        // Prevent endermen from teleporting inside protected regions
        if (event.getEntityType() == EntityType.ENDERMAN
                && isProtected(event.getTo())) {
            event.setCancelled(true);
        }
    }

    private boolean isProtected(org.bukkit.Location loc) {
        return false; // implement region check
    }
}
```

---

## Cross-World Teleportation

Cross-world teleports always require async loading in Paper:

```java
import org.bukkit.Bukkit;
import org.bukkit.World;
import org.bukkit.Location;

public void sendToHub(Player player) {
    World hub = Bukkit.getWorld("hub");
    if (hub == null) {
        player.sendMessage(Component.text("Hub world not found.").color(NamedTextColor.RED));
        return;
    }

    Location spawn = hub.getSpawnLocation();
    player.teleportAsync(spawn, PlayerTeleportEvent.TeleportCause.PLUGIN)
        .thenAccept(success -> {
            if (success) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (player.isOnline()) {
                        player.sendMessage(
                            Component.text("Welcome to the hub!").color(NamedTextColor.GREEN)
                        );
                    }
                });
            }
        });
}
```

---

## Overriding Respawn Location

Use `PlayerRespawnEvent` to send players to a custom location on death respawn:

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerRespawnEvent;

public class RespawnListener implements Listener {

    @EventHandler
    public void onRespawn(PlayerRespawnEvent event) {
        // Override with custom lobby spawn
        if (!event.isBedSpawn() && !event.isAnchorSpawn()) {
            event.setRespawnLocation(lobbySpawn);
        }
    }
}
```

---

## Common Pitfalls

- **`teleport()` (sync) with unloaded chunks**: If the target chunk isn't loaded, `teleport()` loads it synchronously, causing a noticeable server freeze. In Paper, always use `teleportAsync()`.

- **Not unregistering the countdown listener**: If `CountdownTeleport` never calls `HandlerList.unregisterAll(this)`, the `PlayerMoveEvent` handler keeps firing forever, checking every block move for every player.

- **Cross-world `getSpawnLocation()` returning `y=64` in void worlds**: For void worlds, the spawn Y is 64 but there may be no floor. Validate with `isSafe()` before using `getSpawnLocation()` as a destination.
