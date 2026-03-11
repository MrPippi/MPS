# Particles — Paper

Full particle type reference, geometric patterns (circle, sphere, helix), and rate-limiting guidance for Paper 1.21.

---

## Particle Type Reference

| Particle | Data Type | Notes |
|----------|-----------|-------|
| `FLAME` | none | Small flame; use `speed > 0` for natural float |
| `SMOKE` | none | Small grey smoke puff |
| `LARGE_SMOKE` | none | Larger smoke cloud |
| `DUST` | `Particle.DustOptions` | Coloured dot; `speed` is ignored; renamed from `REDSTONE` in 1.21 |
| `DUST_COLOR_TRANSITION` | `Particle.DustTransition` | Fades from one colour to another |
| `EXPLOSION` | none | Small explosion pop |
| `EXPLOSION_EMITTER` | none | Full explosion effect |
| `FIREWORK` | none | Firework trail sparkle |
| `HEART` | none | Pink heart (tameable entity effect) |
| `CRIT` | none | Critical hit slash marks |
| `ENCHANT` | none | Enchantment glyphs floating up |
| `PORTAL` | none | Purple portal swirl |
| `TOTEM_OF_UNDYING` | none | Colourful totem orb burst |
| `CLOUD` | none | White puff cloud |
| `SNOWFLAKE` | none | White snowflake |
| `RAIN` | none | Rain drop splash |
| `BLOCK` | `BlockData` | Breaks block texture into particles |
| `BLOCK_MARKER` | `BlockData` | Outline of a block (barrier/light) |
| `ITEM` | `ItemStack` | Spinning item shards |
| `FALLING_DUST` | `BlockData` | Coloured dust that falls |

---

## `World#spawnParticle` Overloads

```java
// Minimal: burst at a location for all nearby players
world.spawnParticle(Particle.FLAME, location, 30);

// With spread (dx/dy/dz) and speed
world.spawnParticle(Particle.SMOKE, location, 20, 0.3, 0.3, 0.3, 0.05);

// With particle data (dust, block, item)
world.spawnParticle(Particle.DUST, location, 50, 0.3, 0.3, 0.3, 0, dustOptions);

// Count=0 directional mode: single particle fired in direction (dx,dy,dz)
world.spawnParticle(Particle.FLAME, location, 0, 0.0, 1.0, 0.0, 0.5);
```

---

## Coloured Dust

```java
import org.bukkit.Color;
import org.bukkit.Particle;

// Single colour
Particle.DustOptions red = new Particle.DustOptions(Color.RED, 1.5f);   // size 1.5
world.spawnParticle(Particle.DUST, location, 40, 0.2, 0.2, 0.2, 0, red);

// Colour transition (DUST_COLOR_TRANSITION)
Particle.DustTransition fade = new Particle.DustTransition(
    Color.AQUA,    // from colour
    Color.FUCHSIA, // to colour
    1.0f           // size
);
world.spawnParticle(Particle.DUST_COLOR_TRANSITION, location, 30, 0.2, 0.2, 0.2, 0, fade);
```

---

## Block & Item Particles

```java
import org.bukkit.Material;
import org.bukkit.block.data.BlockData;
import org.bukkit.inventory.ItemStack;

// Block break shards
BlockData stone = Material.STONE.createBlockData();
world.spawnParticle(Particle.BLOCK, location, 60, 0.4, 0.4, 0.4, 0.1, stone);

// Item spin shards (e.g., a diamond)
ItemStack diamond = new ItemStack(Material.DIAMOND);
world.spawnParticle(Particle.ITEM, location, 20, 0.2, 0.2, 0.2, 0.1, diamond);
```

---

## Geometric Patterns

### Horizontal Circle

```java
import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.World;

/**
 * Spawns particles in a horizontal circle.
 *
 * @param center  centre of the circle
 * @param radius  radius in blocks
 * @param points  number of particle points (higher = smoother)
 */
public void spawnCircle(Location center, double radius, int points) {
    World world = center.getWorld();
    double angleStep = 2 * Math.PI / points;

    for (int i = 0; i < points; i++) {
        double angle = i * angleStep;
        double x = center.getX() + radius * Math.cos(angle);
        double z = center.getZ() + radius * Math.sin(angle);

        Location point = new Location(world, x, center.getY(), z);
        world.spawnParticle(Particle.DUST, point, 1, 0, 0, 0, 0,
            new Particle.DustOptions(org.bukkit.Color.AQUA, 1.2f));
    }
}
```

### Vertical Ring (Cylinder Wall)

```java
/**
 * Spawns a vertical ring of particles around a point.
 *
 * @param center centre location
 * @param radius ring radius
 * @param height total height of the cylinder
 * @param rings  number of horizontal rings stacked
 * @param points particles per ring
 */
public void spawnCylinder(Location center, double radius, double height,
                           int rings, int points) {
    World world = center.getWorld();
    double angleStep = 2 * Math.PI / points;
    double heightStep = height / rings;

    for (int r = 0; r <= rings; r++) {
        double y = center.getY() + r * heightStep;
        for (int i = 0; i < points; i++) {
            double angle = i * angleStep;
            double x = center.getX() + radius * Math.cos(angle);
            double z = center.getZ() + radius * Math.sin(angle);
            world.spawnParticle(Particle.FLAME,
                new Location(world, x, y, z), 1, 0, 0, 0, 0.01);
        }
    }
}
```

### Sphere

```java
/**
 * Spawns particles evenly distributed on a sphere surface.
 *
 * @param center centre of the sphere
 * @param radius sphere radius in blocks
 * @param count  total number of particles
 */
public void spawnSphere(Location center, double radius, int count) {
    World world = center.getWorld();
    // Fibonacci sphere distribution for even coverage
    double goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (int i = 0; i < count; i++) {
        double theta = 2 * Math.PI * i / goldenRatio;
        double phi   = Math.acos(1 - 2.0 * (i + 0.5) / count);

        double x = center.getX() + radius * Math.sin(phi) * Math.cos(theta);
        double y = center.getY() + radius * Math.cos(phi);
        double z = center.getZ() + radius * Math.sin(phi) * Math.sin(theta);

        world.spawnParticle(Particle.TOTEM_OF_UNDYING,
            new Location(world, x, y, z), 1, 0, 0, 0, 0);
    }
}
```

### Upward Helix

```java
/**
 * Spawns a double-helix rising from a location.
 * Designed to be called from a repeating task.
 *
 * @param base   starting location (bottom of helix)
 * @param t      time parameter — increment by 0.1 each tick
 * @param height how high the helix extends
 */
public void spawnHelix(Location base, double t, double height) {
    World world = base.getWorld();
    int steps = 40;

    for (int i = 0; i < steps; i++) {
        double progress = (double) i / steps;
        double angle    = t + progress * 4 * Math.PI;   // 2 full rotations
        double y        = base.getY() + progress * height;

        // Strand 1
        world.spawnParticle(Particle.DUST,
            new Location(world,
                base.getX() + 0.8 * Math.cos(angle),
                y,
                base.getZ() + 0.8 * Math.sin(angle)),
            1, 0, 0, 0, 0,
            new Particle.DustOptions(org.bukkit.Color.LIME, 1.0f));

        // Strand 2 (offset by π)
        world.spawnParticle(Particle.DUST,
            new Location(world,
                base.getX() + 0.8 * Math.cos(angle + Math.PI),
                y,
                base.getZ() + 0.8 * Math.sin(angle + Math.PI)),
            1, 0, 0, 0, 0,
            new Particle.DustOptions(org.bukkit.Color.FUCHSIA, 1.0f));
    }
}
```

**Usage with a repeating task:**
```java
final double[] t = {0};
BukkitTask helixTask = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
    spawnHelix(player.getLocation(), t[0], 3.0);
    t[0] += 0.15;
}, 0L, 1L);
```

---

## Single-Player vs World-Wide

```java
// Visible to ALL players within vanilla particle range (~32–256 blocks)
world.spawnParticle(Particle.FLAME, location, 20);

// Visible ONLY to this player — good for UI/feedback effects
player.spawnParticle(Particle.TOTEM_OF_UNDYING, location, 20, 0.2, 0.5, 0.2, 0.1);
```

---

## Rate-Limiting Guidance

| Context | Max count per call | Frequency |
|---------|-------------------|-----------|
| On-hit effect | 20–50 | Per event |
| Ambient area | 5–15 | Every 2–5 ticks |
| Radius scan (many locations) | 1 per point | Every 5–10 ticks |
| Full sphere (50 pts) | 1 per point | Every 4+ ticks |

- Never spawn 200+ particles per tick per player — clients will lag.
- Prefer `Player#spawnParticle()` for personal effects to avoid spamming nearby players.
- For area ambient effects, gate with `world.getPlayers().isEmpty()` to skip calculation when no one is nearby.

---

## Common Pitfalls

- **`Particle.REDSTONE` does not exist in 1.21**: Use `Particle.DUST` with `DustOptions`. Any legacy code referencing `REDSTONE` will fail to compile.
- **Non-zero `speed` with `DUST`**: The speed value is unused by dust particles. Always pass `0` — passing another value does nothing but misleads readers.
- **`count = 0` changes semantics**: When `count` is `0`, `dx/dy/dz` are treated as a direction vector and `speed` as the velocity magnitude. This is a separate usage mode, not a "no particles" request.
- **Calling `spawnParticle` off the main thread**: Particle spawning is a world mutation. Schedule geometric loops with `runTask` or `runTaskTimer`, not from async threads.
- **`new Location` inside tight loops**: Allocation cost matters in tight loops. Reuse a `Location` object and call `setX()`/`setY()`/`setZ()` to reduce GC pressure.
