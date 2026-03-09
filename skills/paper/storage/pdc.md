# PersistentDataContainer — Paper

Full reference for `PersistentDataContainer` (PDC) in Paper 1.21. PDC stores custom data directly in Minecraft NBT on entities, blocks, items, and chunks — persisting across server restarts.

---

## What Supports PDC

Any class implementing `PersistentDataHolder`:
- `Entity` (all subclasses: `Player`, `Mob`, `ArmorStand`, etc.)
- `TileState` (block entities: `Chest`, `Furnace`, `Sign`, etc.) — access via `block.getState()`
- `ItemMeta` (on `ItemStack.getItemMeta()`)
- `Chunk`
- `World`

---

## NamespacedKey

Every PDC entry requires a `NamespacedKey` — a unique identifier in the format `namespace:key`.

```java
import org.bukkit.NamespacedKey;
import org.bukkit.plugin.java.JavaPlugin;

// Create in plugin constructor or onEnable — reuse, don't create repeatedly
NamespacedKey killCountKey = new NamespacedKey(plugin, "kill_count");
NamespacedKey homeKey      = new NamespacedKey(plugin, "home_location");
NamespacedKey tagKey       = new NamespacedKey(plugin, "player_tag");
```

> Store `NamespacedKey` instances as fields — creating them on every operation is wasteful but not harmful.

---

## Built-in PersistentDataTypes

| Type Constant | Java Type | Notes |
|--------------|-----------|-------|
| `PersistentDataType.BYTE` | `Byte` | |
| `PersistentDataType.SHORT` | `Short` | |
| `PersistentDataType.INTEGER` | `Integer` | |
| `PersistentDataType.LONG` | `Long` | Use for `UUID` (as two longs) |
| `PersistentDataType.FLOAT` | `Float` | |
| `PersistentDataType.DOUBLE` | `Double` | |
| `PersistentDataType.STRING` | `String` | |
| `PersistentDataType.BYTE_ARRAY` | `byte[]` | |
| `PersistentDataType.INTEGER_ARRAY` | `int[]` | |
| `PersistentDataType.LONG_ARRAY` | `long[]` | |
| `PersistentDataType.TAG_CONTAINER` | `PersistentDataContainer` | Nested container |
| `PersistentDataType.TAG_CONTAINER_ARRAY` | `PersistentDataContainer[]` | Array of containers |
| `PersistentDataType.LIST` | `List<T>` | See list type factory below |

---

## Basic CRUD Operations

```java
import org.bukkit.entity.Player;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;

public class PlayerDataService {

    private final NamespacedKey killKey;
    private final NamespacedKey tagKey;

    public PlayerDataService(JavaPlugin plugin) {
        this.killKey = new NamespacedKey(plugin, "kills");
        this.tagKey  = new NamespacedKey(plugin, "tag");
    }

    // --- Write ---
    public void setKills(Player player, int kills) {
        player.getPersistentDataContainer()
            .set(killKey, PersistentDataType.INTEGER, kills);
        // No manual save — persisted with the player data file automatically
    }

    // --- Read with default ---
    public int getKills(Player player) {
        return player.getPersistentDataContainer()
            .getOrDefault(killKey, PersistentDataType.INTEGER, 0);
    }

    // --- Read (nullable) ---
    public String getTag(Player player) {
        return player.getPersistentDataContainer()
            .get(tagKey, PersistentDataType.STRING);   // null if not set
    }

    // --- Check existence ---
    public boolean hasTag(Player player) {
        return player.getPersistentDataContainer().has(tagKey);
    }

    // --- Delete ---
    public void removeTag(Player player) {
        player.getPersistentDataContainer().remove(tagKey);
    }
}
```

---

## Storing UUID

`UUID` has no dedicated PDC type. Store as two longs or a string:

```java
import java.util.UUID;

// Store as String (simpler)
NamespacedKey ownerKey = new NamespacedKey(plugin, "owner");

public void setOwner(org.bukkit.block.TileState state, UUID owner) {
    state.getPersistentDataContainer()
        .set(ownerKey, PersistentDataType.STRING, owner.toString());
    state.update();   // TileState must be updated to save to world
}

public UUID getOwner(org.bukkit.block.TileState state) {
    String raw = state.getPersistentDataContainer()
        .get(ownerKey, PersistentDataType.STRING);
    return raw != null ? UUID.fromString(raw) : null;
}
```

---

## Nested Containers (TAG_CONTAINER)

```java
NamespacedKey statsKey  = new NamespacedKey(plugin, "stats");
NamespacedKey killsKey  = new NamespacedKey(plugin, "kills");
NamespacedKey deathsKey = new NamespacedKey(plugin, "deaths");

public void writeStats(Player player, int kills, int deaths) {
    PersistentDataContainer root = player.getPersistentDataContainer();

    // Create a nested container
    PersistentDataContainer stats = root.getAdapterContext().newPersistentDataContainer();
    stats.set(killsKey,  PersistentDataType.INTEGER, kills);
    stats.set(deathsKey, PersistentDataType.INTEGER, deaths);

    root.set(statsKey, PersistentDataType.TAG_CONTAINER, stats);
}

public int readKills(Player player) {
    PersistentDataContainer stats = player.getPersistentDataContainer()
        .get(statsKey, PersistentDataType.TAG_CONTAINER);
    if (stats == null) return 0;
    return stats.getOrDefault(killsKey, PersistentDataType.INTEGER, 0);
}
```

---

## List Type (Paper 1.21)

Paper 1.21 introduced `PersistentDataType.listTypeFrom(elementType)`:

```java
import org.bukkit.persistence.ListPersistentDataType;
import org.bukkit.persistence.PersistentDataType;

NamespacedKey friendsKey = new NamespacedKey(plugin, "friends");
ListPersistentDataType<List<String>, String> STRING_LIST =
    PersistentDataType.listTypeFrom(PersistentDataType.STRING);

public void setFriends(Player player, List<String> friends) {
    player.getPersistentDataContainer()
        .set(friendsKey, STRING_LIST, friends);
}

public List<String> getFriends(Player player) {
    return player.getPersistentDataContainer()
        .getOrDefault(friendsKey, STRING_LIST, List.of());
}
```

---

## Custom PersistentDataType

Implement `PersistentDataType<P, C>` where `P` is the primitive storage type and `C` is your custom type:

```java
import org.bukkit.persistence.PersistentDataAdapterContext;
import org.bukkit.persistence.PersistentDataType;
import org.jetbrains.annotations.NotNull;

// Example: store a record as a string (JSON or delimited)
public record HomeLocation(double x, double y, double z, String world) {

    public static final PersistentDataType<String, HomeLocation> PDC_TYPE =
        new PersistentDataType<>() {

            @Override
            public @NotNull Class<String> getPrimitiveType() { return String.class; }

            @Override
            public @NotNull Class<HomeLocation> getComplexType() { return HomeLocation.class; }

            @Override
            public @NotNull String toPrimitive(@NotNull HomeLocation complex,
                                               @NotNull PersistentDataAdapterContext ctx) {
                return complex.x() + "," + complex.y() + "," + complex.z() + "," + complex.world();
            }

            @Override
            public @NotNull HomeLocation fromPrimitive(@NotNull String primitive,
                                                       @NotNull PersistentDataAdapterContext ctx) {
                String[] parts = primitive.split(",", 4);
                return new HomeLocation(
                    Double.parseDouble(parts[0]),
                    Double.parseDouble(parts[1]),
                    Double.parseDouble(parts[2]),
                    parts[3]
                );
            }
        };
}
```

**Usage:**
```java
NamespacedKey homeKey = new NamespacedKey(plugin, "home");

// Write
player.getPersistentDataContainer()
    .set(homeKey, HomeLocation.PDC_TYPE, new HomeLocation(100.5, 64.0, -200.0, "world"));

// Read
HomeLocation home = player.getPersistentDataContainer()
    .get(homeKey, HomeLocation.PDC_TYPE);
```

---

## PDC on Block Entities (TileState)

```java
import org.bukkit.block.Block;
import org.bukkit.block.Chest;

// Get the tile state
Block block = player.getTargetBlockExact(5);
if (block != null && block.getState() instanceof Chest chest) {
    // Read/write PDC
    chest.getPersistentDataContainer()
        .set(new NamespacedKey(plugin, "owner"),
             PersistentDataType.STRING,
             player.getUniqueId().toString());

    // IMPORTANT: must call update() to persist TileState changes
    chest.update();
}
```

---

## PDC on ItemMeta

```java
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.Material;

ItemStack sword = new ItemStack(Material.DIAMOND_SWORD);
ItemMeta meta = sword.getItemMeta();

meta.getPersistentDataContainer()
    .set(new NamespacedKey(plugin, "custom_sword"), PersistentDataType.BOOLEAN, true);

sword.setItemMeta(meta);
```

---

## Common Pitfalls

- **Not calling `tileState.update()`**: Writing to a `TileState`'s PDC only modifies the in-memory snapshot. Call `tileState.update()` to apply changes to the actual world.

- **Calling PDC methods off main thread**: PDC on entities and blocks is not thread-safe. Always access PDC on the main server thread.

- **Creating `NamespacedKey` every call**: Minor inefficiency. Store keys as `static final` or instance fields.

- **Type mismatch at read time**: If you stored an `INTEGER` but try to read with `LONG`, `get()` returns `null`. Always use the same type for read and write.

- **Losing `ItemMeta` changes**: `meta.getPersistentDataContainer().set(...)` modifies `meta`. You must call `item.setItemMeta(meta)` after — the meta is a copy, not a reference to the item's internal state.

## Related Skills

- [SKILL.md](SKILL.md) — Storage overview
- [config-yml.md](config-yml.md) — YAML-based configuration
- [database-hikari.md](database-hikari.md) — Relational database for large data sets
