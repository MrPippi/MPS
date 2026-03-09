# Entity Management — Paper

Full reference for spawning, customising, equipping, and removing entities in Paper 1.21, including Display entities.

---

## Spawning Entities

### Type-Safe Spawn (Preferred)

```java
import org.bukkit.entity.Zombie;

// spawn(Location, Class<T>) returns T directly — no cast needed
Zombie zombie = world.spawn(location, Zombie.class);

// spawn(Location, Class<T>, Consumer<T>) — configure before EntitySpawnEvent fires
Zombie boss = world.spawn(location, Zombie.class, z -> {
    z.customName(net.kyori.adventure.text.Component.text("Boss"));
    z.setCustomNameVisible(true);
    z.setPersistent(true);
});
```

### Entity Types Reference

| EntityType | Java Class | Notes |
|-----------|-----------|-------|
| `ZOMBIE` | `Zombie` | |
| `SKELETON` | `Skeleton` | |
| `CREEPER` | `Creeper` | `.setMaxFuseTicks(int)` |
| `VILLAGER` | `Villager` | `.setProfession(Villager.Profession)` |
| `ARMOR_STAND` | `ArmorStand` | Poseable, can hold items |
| `TEXT_DISPLAY` | `TextDisplay` | Floating text (1.19.4+) |
| `ITEM_DISPLAY` | `ItemDisplay` | Floating item model (1.19.4+) |
| `BLOCK_DISPLAY` | `BlockDisplay` | Floating block model (1.19.4+) |
| `FALLING_BLOCK` | `FallingBlock` | `.setBlockData(BlockData)` |
| `ITEM` | `Item` | Dropped item entity |

---

## Attributes & Modifiers

### Common Attributes (Paper 1.21)

| Attribute | Default | Description |
|-----------|---------|-------------|
| `Attribute.GENERIC_MAX_HEALTH` | 20.0 | Maximum health |
| `Attribute.GENERIC_MOVEMENT_SPEED` | varies | Walk speed |
| `Attribute.GENERIC_ATTACK_DAMAGE` | varies | Melee damage |
| `Attribute.GENERIC_ATTACK_SPEED` | varies | Attack cooldown |
| `Attribute.GENERIC_ARMOR` | 0.0 | Damage reduction |
| `Attribute.GENERIC_ARMOR_TOUGHNESS` | 0.0 | Armour toughness |
| `Attribute.GENERIC_KNOCKBACK_RESISTANCE` | 0.0 | Knockback reduction |
| `Attribute.GENERIC_FOLLOW_RANGE` | 16–32 | Aggro range |
| `Attribute.GENERIC_FLYING_SPEED` | varies | Flying speed |

### Setting Base Value

```java
import org.bukkit.attribute.Attribute;
import org.bukkit.attribute.AttributeInstance;

LivingEntity entity = ...;
AttributeInstance maxHealth = entity.getAttribute(Attribute.GENERIC_MAX_HEALTH);
if (maxHealth != null) {
    maxHealth.setBaseValue(200.0);   // 200 HP
}
entity.setHealth(entity.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue());
```

### Adding / Removing Modifiers (Paper 1.21)

```java
import org.bukkit.attribute.AttributeModifier;
import org.bukkit.inventory.EquipmentSlotGroup;
import org.bukkit.NamespacedKey;

NamespacedKey modKey = new NamespacedKey(plugin, "speed_boost");

AttributeModifier modifier = new AttributeModifier(
    modKey,
    0.2,                                    // value
    AttributeModifier.Operation.ADD_NUMBER, // ADD_NUMBER, ADD_SCALAR, MULTIPLY_SCALAR_1
    EquipmentSlotGroup.ANY                  // slot group where modifier applies
);

AttributeInstance speed = entity.getAttribute(Attribute.GENERIC_MOVEMENT_SPEED);
if (speed != null) {
    speed.addModifier(modifier);
    // Later: remove it
    speed.removeModifier(modifier);
}
```

**Operations:**

| Operation | Formula |
|-----------|---------|
| `ADD_NUMBER` | `base + value` |
| `ADD_SCALAR` | `base × (1 + value)` |
| `MULTIPLY_SCALAR_1` | `base × value` |

---

## Equipment Slots

```java
import org.bukkit.inventory.EntityEquipment;
import org.bukkit.Material;
import org.bukkit.inventory.ItemStack;

EntityEquipment equip = livingEntity.getEquipment();
if (equip != null) {
    equip.setHelmet(new ItemStack(Material.IRON_HELMET));
    equip.setChestplate(new ItemStack(Material.IRON_CHESTPLATE));
    equip.setLeggings(new ItemStack(Material.IRON_LEGGINGS));
    equip.setBoots(new ItemStack(Material.IRON_BOOTS));
    equip.setItemInMainHand(new ItemStack(Material.IRON_SWORD));
    equip.setItemInOffHand(new ItemStack(Material.SHIELD));

    // Set drop chance (0.0 = never drops, 1.0 = always drops)
    equip.setHelmetDropChance(0.0f);
    equip.setItemInMainHandDropChance(0.0f);
}
```

---

## Removing Entities

```java
entity.remove();   // Immediate removal; no death event, no drops

// Simulate death (triggers EntityDeathEvent, drops loot):
if (entity instanceof LivingEntity living) {
    living.damage(living.getHealth() + 1.0);   // deal lethal damage
}
```

---

## Preventing Despawn

```java
entity.setPersistent(true);   // Won't despawn when no player is nearby
```

---

## Display Entities (Paper 1.19.4+)

Display entities have no hitbox, don't trigger events, and render client-side only. Ideal for floating labels, item showcases, and decorative blocks.

### TextDisplay

```java
import org.bukkit.entity.Display;
import org.bukkit.entity.TextDisplay;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

TextDisplay td = world.spawn(location, TextDisplay.class, d -> {
    d.text(Component.text("§6Level 5 Zone").color(NamedTextColor.GOLD));
    d.setBillboard(Display.Billboard.VERTICAL);   // FIXED, VERTICAL, HORIZONTAL, CENTER
    d.setBackgroundColor(org.bukkit.Color.fromARGB(160, 0, 0, 0));
    d.setTextOpacity((byte) 200);   // 0–255; 255 = fully opaque
    d.setShadowed(true);
    d.setAlignment(TextDisplay.TextAlignment.CENTER);
    d.setSeeThrough(false);
    d.setPersistent(true);
});

// Update text later
td.text(Component.text("§aLevel 6 Zone").color(NamedTextColor.GREEN));
```

### ItemDisplay

```java
import org.bukkit.entity.ItemDisplay;
import org.bukkit.inventory.ItemStack;
import org.bukkit.Material;

ItemDisplay id = world.spawn(location, ItemDisplay.class, d -> {
    d.setItemStack(new ItemStack(Material.DIAMOND_SWORD));
    d.setItemDisplayTransform(ItemDisplay.ItemDisplayTransform.GROUND);
    d.setBillboard(Display.Billboard.CENTER);
    d.setPersistent(true);
});
```

### BlockDisplay

```java
import org.bukkit.entity.BlockDisplay;
import org.bukkit.block.data.BlockData;

BlockData data = org.bukkit.Bukkit.createBlockData(Material.DIAMOND_BLOCK);
BlockDisplay bd = world.spawn(location, BlockDisplay.class, d -> {
    d.setBlock(data);
    d.setPersistent(true);
});
```

### Transformation (Scale, Rotation, Translation)

```java
import org.joml.Matrix4f;
import org.joml.Quaternionf;
import org.joml.Vector3f;
import org.bukkit.util.Transformation;

// Scale the display entity to 2× size
Transformation transform = new Transformation(
    new Vector3f(0, 0, 0),        // translation
    new Quaternionf(),             // left rotation
    new Vector3f(2, 2, 2),        // scale
    new Quaternionf()              // right rotation
);
display.setTransformation(transform);
```

---

## EntitySpawnEvent

**Package**: `org.bukkit.event.entity.EntitySpawnEvent`
**Thread**: Main thread
**Cancellable**: Yes

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntitySpawnEvent;
import org.bukkit.entity.EntityType;

public class SpawnListener implements Listener {

    @EventHandler
    public void onSpawn(EntitySpawnEvent event) {
        // Prevent phantoms from spawning in a specific world
        if (event.getEntityType() == EntityType.PHANTOM
                && event.getLocation().getWorld().getName().equals("no-phantoms")) {
            event.setCancelled(true);
        }
    }
}
```

---

## Common Pitfalls

- **Setting health above max health**: `setHealth()` silently clamps to `getMaxHealth()`. Always set `GENERIC_MAX_HEALTH` first, then call `setHealth()`.

- **Modifier key collisions**: Using the same `NamespacedKey` for multiple different modifiers on the same entity replaces the old one. Use unique keys per modifier instance if stacking is intended.

- **`remove()` vs lethal damage**: `entity.remove()` skips death entirely (no drops, no `EntityDeathEvent`). If you need drops or events, use `living.damage(living.getHealth() + 1)` instead.

- **Display entities not visible in older clients**: `TextDisplay`, `ItemDisplay`, `BlockDisplay` require client 1.19.4+. Players on older versions won't see them.
