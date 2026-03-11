# Entities Skill — Paper

## Purpose
Reference this skill when spawning, customising, or removing entities in Paper 1.21. Covers mob spawning, attribute modification, equipment, Display entities, and the `EntitySpawnEvent`.

## When to Use This Skill
- Spawning a custom mob with modified health, speed, or damage
- Creating a floating text label using `TextDisplay`
- Attaching equipment (armour, held items) to a mob
- Preventing specific entity types from spawning via events

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `World#spawnEntity(Location, EntityType)` | Spawn an entity | Returns the spawned `Entity` |
| `World#spawn(Location, Class<T>)` | Spawn with type-safe cast | Preferred; e.g., `spawn(loc, Zombie.class)` |
| `World#spawn(Location, Class<T>, Consumer<T>)` | Spawn with pre-spawn configurator | Run before `EntitySpawnEvent` |
| `Entity#remove()` | Despawn the entity | Immediate; no death event |
| `LivingEntity#getAttribute(Attribute)` | Get an attribute instance | e.g., `Attribute.GENERIC_MAX_HEALTH` |
| `AttributeInstance#setBaseValue(double)` | Change the base value | |
| `AttributeInstance#addModifier(AttributeModifier)` | Add a temporary modifier | |
| `LivingEntity#getEquipment()` | `EntityEquipment` for gear slots | |
| `EntityEquipment#setHelmet(ItemStack)` | Set head slot | |
| `EntitySpawnEvent` | Fires before any entity spawns | Cancellable |
| `TextDisplay` | Floating text entity (Display API) | Paper 1.19.4+ |
| `ItemDisplay` | Floating item entity | |
| `BlockDisplay` | Floating block entity | |

## Code Pattern

```java
package com.yourorg.myplugin.entities;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.attribute.Attribute;
import org.bukkit.attribute.AttributeInstance;
import org.bukkit.attribute.AttributeModifier;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.TextDisplay;
import org.bukkit.entity.Zombie;
import org.bukkit.inventory.EquipmentSlotGroup;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.UUID;

public class EntitySpawner {

    private final JavaPlugin plugin;

    public EntitySpawner(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    // Spawn a custom boss zombie with buffed stats and equipment
    public Zombie spawnBossZombie(Location location) {
        return location.getWorld().spawn(location, Zombie.class, zombie -> {
            // Pre-spawn configurator — fires before EntitySpawnEvent

            // Custom name tag
            zombie.customName(Component.text("☠ Dungeon Boss").color(NamedTextColor.RED));
            zombie.setCustomNameVisible(true);

            // Double max health
            AttributeInstance maxHealth = zombie.getAttribute(Attribute.GENERIC_MAX_HEALTH);
            if (maxHealth != null) maxHealth.setBaseValue(100.0);
            zombie.setHealth(100.0);

            // Speed boost via modifier
            AttributeInstance speed = zombie.getAttribute(Attribute.GENERIC_MOVEMENT_SPEED);
            if (speed != null) {
                speed.addModifier(new AttributeModifier(
                    new org.bukkit.NamespacedKey(plugin, "boss_speed"),
                    0.1,
                    AttributeModifier.Operation.ADD_NUMBER,
                    EquipmentSlotGroup.ANY
                ));
            }

            // Equipment
            var equipment = zombie.getEquipment();
            if (equipment != null) {
                equipment.setHelmet(new ItemStack(Material.DIAMOND_HELMET));
                equipment.setItemInMainHand(new ItemStack(Material.DIAMOND_SWORD));
                // Prevent drops
                equipment.setHelmetDropChance(0.0f);
                equipment.setItemInMainHandDropChance(0.0f);
            }

            // Don't burn in sunlight
            zombie.setCanPickupItems(false);
        });
    }

    // Spawn a floating text label using TextDisplay (Paper 1.19.4+)
    public TextDisplay spawnFloatingText(Location location, String text) {
        return location.getWorld().spawn(location, TextDisplay.class, display -> {
            display.text(Component.text(text)
                .color(NamedTextColor.YELLOW));
            display.setBillboard(org.bukkit.entity.Display.Billboard.CENTER);   // always faces player
            display.setBackgroundColor(org.bukkit.Color.fromARGB(100, 0, 0, 0)); // semi-transparent bg
        });
    }
}
```

## Common Pitfalls

- **Using `EntityType` enum with `spawnEntity` instead of typed `spawn`**: `spawnEntity(loc, EntityType.ZOMBIE)` returns `Entity` which requires an unsafe cast. Use `spawn(loc, Zombie.class)` for type-safe access.

- **Setting health before setting max health**: Calling `setHealth(100)` when max health is still 20 caps it at 20. Always set the `GENERIC_MAX_HEALTH` attribute base value first.

- **Not calling `setCustomNameVisible(true)`**: Setting a custom name without this flag hides it unless the player mouses over the mob.

- **Entities despawning due to mob caps**: Spawned mobs count toward the world mob cap and may despawn if no player is nearby. Call `entity.setPersistent(true)` to prevent despawning.

- **`AttributeModifier` UUID collision**: Using `UUID.randomUUID()` each time creates a new modifier every plugin reload, which stacks. Use a stable `NamespacedKey`-based constructor (Paper 1.21 API) instead.

## Version Notes

- **1.21**: `AttributeModifier` constructor with `NamespacedKey` is preferred over the `UUID`-based one (deprecated). `EquipmentSlotGroup.ANY` replaces the old `EquipmentSlot` parameter.
- **1.21**: `TextDisplay`, `ItemDisplay`, `BlockDisplay` (Display entities) are stable and available.
- **1.21.1**: No breaking changes to entity API.

## Related Skills

- [entity-management.md](entity-management.md) — Full attribute reference, equipment slots, Display entity options
- [../events/world-events.md](../events/world-events.md) — EntityDamageEvent, EntitySpawnEvent
- [../storage/pdc.md](../storage/pdc.md) — Tagging entities with PDC for identity
