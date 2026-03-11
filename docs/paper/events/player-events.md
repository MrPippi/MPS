# Player Events — Paper

Detailed reference for commonly used player-related Bukkit/Paper events in Paper 1.21.

---

## PlayerJoinEvent

**Package**: `org.bukkit.event.player.PlayerJoinEvent`
**Thread**: Main thread
**Cancellable**: No (use `PlayerLoginEvent` to kick players before they fully join)

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | The joining player (already loaded) |
| `event.joinMessage()` | `Component` (nullable) | Current join message; null = no message |
| `event.joinMessage(Component)` | void | Override the join broadcast; null = suppress |

### Example

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

public class JoinListener implements Listener {

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        var player = event.getPlayer();

        // Suppress default join message and send a custom one
        event.joinMessage(null);
        player.getServer().broadcast(
            Component.text("» ").color(NamedTextColor.GREEN)
                .append(Component.text(player.getName() + " joined the server.")
                    .color(NamedTextColor.WHITE))
        );

        // First join logic
        if (!player.hasPlayedBefore()) {
            player.sendMessage(Component.text("Welcome to the server!")
                .color(NamedTextColor.GOLD));
        }
    }
}
```

---

## PlayerQuitEvent

**Package**: `org.bukkit.event.player.PlayerQuitEvent`
**Thread**: Main thread
**Cancellable**: No

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | The disconnecting player |
| `event.quitMessage()` | `Component` (nullable) | Current quit message |
| `event.quitMessage(Component)` | void | Override; null = suppress |
| `event.getReason()` | `PlayerQuitEvent.QuitReason` | `DISCONNECTED`, `KICKED`, `TIMED_OUT`, `ERRONEOUS_STATE` |

### Example

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerQuitEvent;

public class QuitListener implements Listener {

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        // Suppress quit message for players who timed out
        if (event.getReason() == PlayerQuitEvent.QuitReason.TIMED_OUT) {
            event.quitMessage(null);
        }

        // Cleanup any per-player data
        // myDataManager.remove(event.getPlayer().getUniqueId());
    }
}
```

---

## PlayerMoveEvent

**Package**: `org.bukkit.event.player.PlayerMoveEvent`
**Thread**: Main thread
**Cancellable**: Yes (teleports player back to `from` location)

> **Warning**: Fires every tick for every moving player. Use filtering to avoid performance issues.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getFrom()` | `Location` | Previous location (this tick) |
| `event.getTo()` | `Location` | New location |
| `event.hasExplicitlyMoved()` | `boolean` | True if x/y/z changed (not just head rotation) |
| `event.hasChangedPosition()` | `boolean` | True if block position changed |
| `event.hasChangedBlock()` | `boolean` | True if moved to a different block |

### Example: Region boundary check

```java
import org.bukkit.Location;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerMoveEvent;

public class RegionListener implements Listener {

    private static final int SPAWN_RADIUS = 20;

    @EventHandler(priority = EventPriority.NORMAL)
    public void onMove(PlayerMoveEvent event) {
        // Filter: only process if the player actually moved blocks
        if (!event.hasChangedBlock()) return;

        Location to = event.getTo();

        // Example: prevent players from leaving spawn area
        if (isOutsideSpawn(to)) {
            event.setCancelled(true);   // snap back to 'from'
            event.getPlayer().sendActionBar(
                net.kyori.adventure.text.Component.text("You cannot leave spawn!")
            );
        }
    }

    private boolean isOutsideSpawn(Location loc) {
        return loc.getX() * loc.getX() + loc.getZ() * loc.getZ()
            > SPAWN_RADIUS * SPAWN_RADIUS;
    }
}
```

---

## PlayerInteractEvent

**Package**: `org.bukkit.event.player.PlayerInteractEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires when a player left-clicks or right-clicks air, a block, or an entity (entity variant: `PlayerInteractEntityEvent`).

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getAction()` | `Action` | `LEFT_CLICK_AIR`, `LEFT_CLICK_BLOCK`, `RIGHT_CLICK_AIR`, `RIGHT_CLICK_BLOCK` |
| `event.getClickedBlock()` | `Block` (nullable) | Non-null when action is `*_BLOCK` |
| `event.getBlockFace()` | `BlockFace` | Face of the clicked block |
| `event.getItem()` | `ItemStack` (nullable) | Item in hand |
| `event.getHand()` | `EquipmentSlot` | `HAND` or `OFF_HAND` |
| `event.useInteractedBlock()` | `Result` | `ALLOW`, `DENY`, `DEFAULT` |
| `event.useItemInHand()` | `Result` | `ALLOW`, `DENY`, `DEFAULT` |

> **Tip**: `PlayerInteractEvent` fires twice when the player holds an item — once for each hand. Check `event.getHand() == EquipmentSlot.HAND` to process only the main hand.

### Example: Custom item right-click

```java
import org.bukkit.Material;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.EquipmentSlot;

public class WandListener implements Listener {

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        // Process only main-hand right-clicks
        if (event.getHand() != EquipmentSlot.HAND) return;
        if (event.getAction() != Action.RIGHT_CLICK_BLOCK
            && event.getAction() != Action.RIGHT_CLICK_AIR) return;

        var item = event.getItem();
        if (item == null || item.getType() != Material.BLAZE_ROD) return;

        event.getPlayer().sendMessage(
            net.kyori.adventure.text.Component.text("Wand activated!")
        );
        event.setCancelled(true);   // Prevent default right-click behavior
    }
}
```

---

## PlayerDeathEvent

**Package**: `org.bukkit.event.entity.PlayerDeathEvent`
**Thread**: Main thread
**Cancellable**: No (use `EntityDamageEvent` to prevent death)

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getEntity()` | `Player` | The player who died |
| `event.deathMessage()` | `Component` (nullable) | Default death message |
| `event.deathMessage(Component)` | void | Override death message; null = suppress |
| `event.getDrops()` | `List<ItemStack>` | Mutable — clear to prevent item drops |
| `event.getDroppedExp()` | `int` | XP dropped |
| `event.setDroppedExp(int)` | void | Set dropped XP |
| `event.setKeepInventory(boolean)` | void | Keep items on death |
| `event.setKeepLevel(boolean)` | void | Keep XP level on death |

### Example

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;

public class DeathListener implements Listener {

    @EventHandler
    public void onDeath(PlayerDeathEvent event) {
        // Keep inventory and XP, suppress death message
        event.setKeepInventory(true);
        event.setKeepLevel(true);
        event.getDrops().clear();
        event.setDroppedExp(0);
        event.deathMessage(null);
    }
}
```

---

## PlayerRespawnEvent

**Package**: `org.bukkit.event.player.PlayerRespawnEvent`
**Thread**: Main thread
**Cancellable**: No

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | Respawning player |
| `event.getRespawnLocation()` | `Location` | Default respawn location |
| `event.setRespawnLocation(Location)` | void | Override respawn location |
| `event.isBedSpawn()` | `boolean` | True if respawning at bed/anchor |

---

## Version Notes

- **1.21 / 1.21.1**: All events above are available unchanged.
- `PlayerMoveEvent.hasExplicitlyMoved()` has been available since Paper 1.16.
- `PlayerQuitEvent.QuitReason` enum was added in Paper 1.19.
