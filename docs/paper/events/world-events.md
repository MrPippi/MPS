# World Events — Paper

Detailed reference for block, chunk, and entity events in Paper 1.21.

---

## BlockBreakEvent

**Package**: `org.bukkit.event.block.BlockBreakEvent`
**Thread**: Main thread
**Cancellable**: Yes

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getBlock()` | `Block` | The broken block |
| `event.getPlayer()` | `Player` | Player who broke the block |
| `event.isDropItems()` | `boolean` | Whether drops will be spawned |
| `event.setDropItems(boolean)` | void | Suppress or force item drops |
| `event.getExpToDrop()` | `int` | XP from breaking this block |
| `event.setExpToDrop(int)` | void | Override XP amount |

### Example: Protected region

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

public class BlockProtectionListener implements Listener {

    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        // Example: protect blocks at y > 200
        if (event.getBlock().getY() > 200
                && !event.getPlayer().hasPermission("myplugin.bypass")) {
            event.setCancelled(true);
            event.getPlayer().sendActionBar(
                Component.text("This area is protected.").color(NamedTextColor.RED)
            );
        }
    }
}
```

---

## BlockPlaceEvent

**Package**: `org.bukkit.event.block.BlockPlaceEvent`
**Thread**: Main thread
**Cancellable**: Yes

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getBlock()` | `Block` | The newly placed block |
| `event.getBlockAgainst()` | `Block` | Block that was clicked to place |
| `event.getPlayer()` | `Player` | Placing player |
| `event.getItemInHand()` | `ItemStack` | Item used to place |
| `event.canBuild()` | `boolean` | Whether placement is allowed by world rules |

### Example: Log placed blocks

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockPlaceEvent;
import org.slf4j.LoggerFactory;

public class BuildLogListener implements Listener {

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(BuildLogListener.class);

    @EventHandler
    public void onBlockPlace(BlockPlaceEvent event) {
        log.info("{} placed {} at {},{},{}",
            event.getPlayer().getName(),
            event.getBlock().getType(),
            event.getBlock().getX(),
            event.getBlock().getY(),
            event.getBlock().getZ());
    }
}
```

---

## EntityDamageEvent and EntityDamageByEntityEvent

**Package**: `org.bukkit.event.entity.EntityDamageEvent`, `EntityDamageByEntityEvent`
**Thread**: Main thread
**Cancellable**: Yes

### EntityDamageEvent Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getEntity()` | `Entity` | The entity taking damage |
| `event.getCause()` | `DamageCause` | `FALL`, `FIRE`, `ENTITY_ATTACK`, `PROJECTILE`, `LAVA`, etc. |
| `event.getDamage()` | `double` | Final damage (after reductions) |
| `event.setDamage(double)` | void | Override damage |
| `event.getFinalDamage()` | `double` | Damage after all reductions applied |

### EntityDamageByEntityEvent Additional Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getDamager()` | `Entity` | The attacking entity |

### Example: PvP protection in spawn region

```java
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;

public class PvPListener implements Listener {

    @EventHandler
    public void onPvP(EntityDamageByEntityEvent event) {
        if (!(event.getEntity() instanceof Player victim)) return;
        if (!(event.getDamager() instanceof Player)) return;

        // Cancel PvP if victim is in spawn region
        if (isInSpawn(victim)) {
            event.setCancelled(true);
        }
    }

    private boolean isInSpawn(Player player) {
        return player.getLocation().distanceSquared(
            player.getWorld().getSpawnLocation()
        ) < 400;   // 20 block radius
    }
}
```

---

## ChunkLoadEvent

**Package**: `org.bukkit.event.world.ChunkLoadEvent`
**Thread**: Main thread
**Cancellable**: No

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getChunk()` | `Chunk` | The loaded chunk |
| `event.isNewChunk()` | `boolean` | True if this chunk was just generated |

### Example: Spawn entities in new chunks

```java
import org.bukkit.Material;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.world.ChunkLoadEvent;

public class ChunkSpawnListener implements Listener {

    @EventHandler
    public void onChunkLoad(ChunkLoadEvent event) {
        if (!event.isNewChunk()) return;

        // Example: place a structure marker in newly generated chunks
        var chunk = event.getChunk();
        var block = chunk.getBlock(8, 64, 8);   // center of chunk at y=64
        // Check block before setting to avoid overwriting terrain
        if (block.getType().isAir()) {
            block.setType(Material.STONE);
        }
    }
}
```

> **Performance note**: `ChunkLoadEvent` can fire dozens of times per second during world exploration. Keep handlers lightweight.

---

## ChunkUnloadEvent

**Package**: `org.bukkit.event.world.ChunkUnloadEvent`
**Thread**: Main thread
**Cancellable**: Yes (prevent chunk from unloading)

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getChunk()` | `Chunk` | The chunk about to unload |
| `event.isSaveChunk()` | `boolean` | Whether the chunk will be saved |
| `event.setSaveChunk(boolean)` | void | Force save or skip saving |

---

## WorldLoadEvent / WorldSaveEvent

**Package**: `org.bukkit.event.world.WorldLoadEvent`, `WorldSaveEvent`
**Thread**: Main thread
**Cancellable**: No

```java
import org.bukkit.World;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.world.WorldLoadEvent;

public class WorldListener implements Listener {

    @EventHandler
    public void onWorldLoad(WorldLoadEvent event) {
        World world = event.getWorld();
        // Example: set game rules on load
        world.setGameRule(org.bukkit.GameRule.DO_DAYLIGHT_CYCLE, false);
    }
}
```

---

## StructureGrowEvent

**Package**: `org.bukkit.event.world.StructureGrowEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires when a tree, mushroom, or other structure grows (including from bone meal).

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getLocation()` | `Location` | Origin sapling/mushroom block |
| `event.getBlocks()` | `List<BlockState>` | Mutable list of blocks to be placed |
| `event.isFromBonemeal()` | `boolean` | True if triggered by bone meal |
| `event.getPlayer()` | `Player` (nullable) | Player who used bone meal; null if natural |

---

## Version Notes

- **1.21**: `EntityDamageEvent` uses the new damage API. `DamageSource` provides more detail on damage origin.
- **1.21.1**: No breaking changes to block/world/entity events.
- **Paper addition**: `AsyncChunkPreGenerateEvent` for Chunky/pre-generation integration (Paper-specific, not in Spigot).
