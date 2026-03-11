# ItemMeta Reference — Paper

Full API reference for `ItemMeta` and its specialised subtypes in Paper 1.21.

---

## Meta Hierarchy

`ItemMeta` is the base interface. Cast to a subtype when working with specific materials:

| Material Group | Subtype Interface | Extra Methods |
|---------------|------------------|---------------|
| All items | `ItemMeta` | display name, lore, enchants, flags, PDC |
| Weapons / tools | `Damageable` | `getDamage()`, `setDamage(int)` |
| Enchanted books | `EnchantmentStorageMeta` | stored enchantments (not applied) |
| Player heads | `SkullMeta` | `setOwningPlayer(OfflinePlayer)` |
| Leather armour | `LeatherArmorMeta` | `setColor(Color)` |
| Written books | `BookMeta` | pages, author, title |
| Maps | `MapMeta` | `setMapView(MapView)` |
| Firework rockets | `FireworkMeta` | effects, power |
| Potions | `PotionMeta` | base potion, custom effects |
| Banners | `BannerMeta` | patterns |
| Compass | `CompassMeta` | lodestone location |

---

## Base ItemMeta API

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.Material;
import org.bukkit.enchantments.Enchantment;
import org.bukkit.inventory.ItemFlag;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.util.List;

ItemStack item = new ItemStack(Material.GOLDEN_SWORD);
ItemMeta meta = item.getItemMeta();

// --- Display name (Adventure Component) ---
meta.displayName(
    Component.text("Golden Legend")
        .color(NamedTextColor.GOLD)
        .decoration(TextDecoration.ITALIC, false)   // disable Minecraft's default italic
);

// --- Lore ---
meta.lore(List.of(
    Component.text("A legendary weapon of old.")
        .color(NamedTextColor.GRAY)
        .decoration(TextDecoration.ITALIC, false),
    Component.empty(),   // blank line separator
    Component.text("Damage: 7").color(NamedTextColor.WHITE)
        .decoration(TextDecoration.ITALIC, false)
));

// --- Enchantments ---
meta.addEnchant(Enchantment.FIRE_ASPECT, 2, false);          // false = respect max level
meta.addEnchant(Enchantment.LOOTING, 3, false);
meta.removeEnchant(Enchantment.FIRE_ASPECT);

// --- Item Flags (hide tooltip lines) ---
meta.addItemFlags(ItemFlag.HIDE_ENCHANTS, ItemFlag.HIDE_ATTRIBUTES);
meta.removeItemFlags(ItemFlag.HIDE_ENCHANTS);

// --- Unbreakable ---
meta.setUnbreakable(true);
meta.addItemFlags(ItemFlag.HIDE_UNBREAKABLE);   // hide "Unbreakable" text

// --- Custom Model Data (resource pack model selector) ---
meta.setCustomModelData(2001);

// --- Apply back to item (required!) ---
item.setItemMeta(meta);
```

---

## Damageable — Durability Control

```java
import org.bukkit.inventory.meta.Damageable;

ItemStack sword = new ItemStack(Material.DIAMOND_SWORD);
ItemMeta meta = sword.getItemMeta();

if (meta instanceof Damageable damageable) {
    // Damage = amount of durability consumed (0 = full durability)
    int maxDurability = sword.getType().getMaxDurability();
    damageable.setDamage(maxDurability / 2);   // 50% durability
}

sword.setItemMeta(meta);
```

---

## EnchantmentStorageMeta — Enchanted Books

```java
import org.bukkit.inventory.meta.EnchantmentStorageMeta;

ItemStack book = new ItemStack(Material.ENCHANTED_BOOK);
ItemMeta meta = book.getItemMeta();

if (meta instanceof EnchantmentStorageMeta storageMeta) {
    storageMeta.addStoredEnchant(Enchantment.SHARPNESS, 5, true);
    storageMeta.addStoredEnchant(Enchantment.MENDING, 1, false);
}

book.setItemMeta(meta);
```

---

## SkullMeta — Player Heads

```java
import org.bukkit.inventory.meta.SkullMeta;
import org.bukkit.OfflinePlayer;

ItemStack skull = new ItemStack(Material.PLAYER_HEAD);
ItemMeta meta = skull.getItemMeta();

if (meta instanceof SkullMeta skullMeta) {
    OfflinePlayer owner = /* Bukkit.getOfflinePlayer(uuid) */;
    skullMeta.setOwningPlayer(owner);   // texture fetched from Mojang
}

skull.setItemMeta(meta);
```

---

## PotionMeta — Potions

```java
import org.bukkit.inventory.meta.PotionMeta;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.potion.PotionType;

ItemStack potion = new ItemStack(Material.POTION);
ItemMeta meta = potion.getItemMeta();

if (meta instanceof PotionMeta potionMeta) {
    // Base potion type (used for colour and base effect)
    potionMeta.setBasePotionType(PotionType.HEALING);

    // Add custom effects
    potionMeta.addCustomEffect(
        new PotionEffect(PotionEffectType.SPEED, 200, 1),   // 200 ticks, level II
        true   // overwrite existing
    );

    potionMeta.setColor(org.bukkit.Color.fromRGB(255, 100, 0));   // custom colour
}

potion.setItemMeta(meta);
```

---

## LeatherArmorMeta — Coloured Leather

```java
import org.bukkit.inventory.meta.LeatherArmorMeta;

ItemStack chestplate = new ItemStack(Material.LEATHER_CHESTPLATE);
ItemMeta meta = chestplate.getItemMeta();

if (meta instanceof LeatherArmorMeta leatherMeta) {
    leatherMeta.setColor(org.bukkit.Color.fromRGB(148, 0, 211));   // purple
}

chestplate.setItemMeta(meta);
```

---

## Reading Existing Meta Safely

```java
ItemStack held = player.getInventory().getItemInMainHand();

// Pattern: always check before reading
if (held.hasItemMeta()) {
    ItemMeta meta = held.getItemMeta();
    Component name = meta.displayName();   // null if no custom name set
    boolean hasEnchant = meta.hasEnchant(Enchantment.SHARPNESS);
}
```

---

## Common Pitfalls

- **`getItemMeta()` returns a copy**: Every call returns a new copy. If you call `getItemMeta()` twice, you get two separate copies — edits to one don't affect the other.

- **`setCustomModelData(null)` to remove**: Passing `null` clears the custom model data value (item uses the default model).

- **Enchantment constants in 1.21**: `Enchantment.SHARPNESS` is the correct Paper 1.21 constant (not `DAMAGE_ALL` from older Spigot). Use the human-readable names.

- **`lore(null)` to remove lore**: Passing `null` to `meta.lore(null)` clears all lore lines.
