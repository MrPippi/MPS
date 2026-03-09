# Items Skill — Paper

## Purpose
Reference this skill when creating, modifying, or identifying `ItemStack` objects in Paper 1.21. Covers the `ItemMeta` API for display names, lore, enchantments, and flags, as well as custom model data and recipe registration.

## When to Use This Skill
- Building a custom item with a name, lore, and enchantments
- Detecting whether a player holds a specific custom item
- Registering a crafting recipe for a custom item
- Modifying item durability, item flags, or Custom Model Data for resource packs

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `new ItemStack(Material, amount)` | Create a new item | Amount defaults to 1 |
| `ItemStack#getItemMeta()` | Get mutable copy of the item's meta | Never null for valid materials |
| `ItemStack#setItemMeta(ItemMeta)` | Apply modified meta back to item | Required after every edit |
| `ItemMeta#displayName(Component)` | Set Adventure-component display name | Replaces legacy `setDisplayName` |
| `ItemMeta#lore(List<Component>)` | Set item lore lines | Replaces legacy `setLore` |
| `ItemMeta#addEnchant(Enchantment, level, ignoreLevelRestriction)` | Add enchantment | `true` = allow above max level |
| `ItemMeta#addItemFlags(ItemFlag...)` | Hide enchantments, attributes, etc. | `ItemFlag.HIDE_ENCHANTS` |
| `ItemMeta#setCustomModelData(int)` | Link to resource pack model | Nullable int |
| `ItemMeta#setUnbreakable(boolean)` | Prevent durability loss | |
| `Damageable#setDamage(int)` | Set durability damage | Cast ItemMeta to `Damageable` |
| `PersistentDataContainer` (on ItemMeta) | Store plugin data on item | See [../storage/pdc.md](../storage/pdc.md) |

## Code Pattern

```java
package com.yourorg.myplugin.items;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.enchantments.Enchantment;
import org.bukkit.inventory.ItemFlag;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;

public class CustomItemBuilder {

    private final JavaPlugin plugin;
    private final NamespacedKey itemIdKey;

    public CustomItemBuilder(JavaPlugin plugin) {
        this.plugin = plugin;
        this.itemIdKey = new NamespacedKey(plugin, "item_id");
    }

    public ItemStack buildSword() {
        ItemStack item = new ItemStack(Material.DIAMOND_SWORD);
        ItemMeta meta = item.getItemMeta();

        // Display name — disable ITALIC (Minecraft applies it by default)
        meta.displayName(Component.text("⚔ Warp Blade")
            .color(NamedTextColor.AQUA)
            .decoration(TextDecoration.ITALIC, false));

        // Lore
        meta.lore(List.of(
            Component.text("Teleports the wielder on hit.")
                .color(NamedTextColor.GRAY)
                .decoration(TextDecoration.ITALIC, false),
            Component.empty(),
            Component.text("Right-click to activate.")
                .color(NamedTextColor.YELLOW)
                .decoration(TextDecoration.ITALIC, false)
        ));

        // Enchantments
        meta.addEnchant(Enchantment.SHARPNESS, 5, true);
        meta.addEnchant(Enchantment.UNBREAKING, 3, false);

        // Hide enchant list from tooltip
        meta.addItemFlags(ItemFlag.HIDE_ENCHANTS);

        // Custom Model Data (links to resource pack model ID 1001)
        meta.setCustomModelData(1001);

        // Unbreakable
        meta.setUnbreakable(true);
        meta.addItemFlags(ItemFlag.HIDE_UNBREAKABLE);

        // Mark as a plugin-specific item using PDC
        meta.getPersistentDataContainer()
            .set(itemIdKey, PersistentDataType.STRING, "warp_blade");

        item.setItemMeta(meta);
        return item;
    }

    // Identify a custom item by its PDC tag
    public boolean isWarpBlade(ItemStack item) {
        if (item == null || !item.hasItemMeta()) return false;
        String id = item.getItemMeta()
            .getPersistentDataContainer()
            .get(itemIdKey, PersistentDataType.STRING);
        return "warp_blade".equals(id);
    }
}
```

## Common Pitfalls

- **Forgetting `item.setItemMeta(meta)` after editing**: `getItemMeta()` returns a **copy**. Changes to `meta` are not reflected in the `ItemStack` until you call `setItemMeta(meta)`.

- **Using legacy `setDisplayName(ChatColor.RED + "name")`**: This sets a legacy string, not an Adventure component. In Paper 1.21, always use `meta.displayName(Component)`. Legacy strings can cause colour code artefacts.

- **Not disabling `ITALIC` on display names and lore**: Minecraft applies italic to all custom names and lore by default. Explicitly set `.decoration(TextDecoration.ITALIC, false)` on each component unless italic is desired.

- **Using `Material.AIR` or `null` meta**: Calling `getItemMeta()` on an `AIR` item stack may return null. Always validate `item.getType() != Material.AIR` before editing.

- **Identifying custom items by display name**: Display names can be changed by players with anvils. Use PDC tags as the reliable identity mechanism.

## Version Notes

- **1.21 / 1.21.1**: `ItemMeta#displayName(Component)` and `lore(List<Component>)` are the standard Adventure-based API. `Enchantment` constants moved to `org.bukkit.enchantments.Enchantment` — use enum constants like `Enchantment.SHARPNESS`.
- `setCustomModelData` accepts `null` to remove the value in 1.21.

## Related Skills

- [item-meta.md](item-meta.md) — Full ItemMeta API reference including Damageable, EnchantmentStorageMeta
- [recipes.md](recipes.md) — Registering shaped/shapeless crafting recipes
- [../storage/pdc.md](../storage/pdc.md) — PersistentDataContainer on ItemMeta for item identity
- [../inventory/SKILL.md](../inventory/SKILL.md) — Placing items in custom inventory GUIs
