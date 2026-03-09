# Crafting Recipes — Paper

Registering shaped and shapeless crafting recipes for custom items in Paper 1.21.

---

## Recipe Types

| Type | Class | Use When |
|------|-------|---------|
| Shaped | `ShapedRecipe` | Pattern matters (e.g., sword shape) |
| Shapeless | `ShapelessRecipe` | Ingredients in any arrangement |
| Smelting | `FurnaceRecipe` | Furnace cooking |
| Blasting | `BlastingRecipe` | Blast furnace |
| Smoking | `SmokingRecipe` | Smoker |
| Campfire | `CampfireRecipe` | Campfire cooking |
| Stonecutting | `StonecuttingRecipe` | Stonecutter |
| Smithing transform | `SmithingTransformRecipe` | Netherite upgrade |

---

## Shaped Recipe

```java
package com.yourorg.myplugin.items;

import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.RecipeChoice;
import org.bukkit.inventory.ShapedRecipe;
import org.bukkit.plugin.java.JavaPlugin;

public class RecipeRegistrar {

    public static void registerAll(JavaPlugin plugin) {
        registerWarpBlade(plugin);
        registerHealPouch(plugin);
    }

    // Shaped recipe — layout matches crafting grid
    private static void registerWarpBlade(JavaPlugin plugin) {
        ItemStack result = new CustomItemBuilder(plugin).buildSword();
        NamespacedKey key = new NamespacedKey(plugin, "warp_blade");
        ShapedRecipe recipe = new ShapedRecipe(key, result);

        // 3x3 grid: use single chars as ingredient labels
        recipe.shape(
            "EDE",
            " B ",
            " S "
        );

        // Map chars to ingredients
        recipe.setIngredient('E', Material.ENDER_PEARL);
        recipe.setIngredient('D', Material.DIAMOND);
        recipe.setIngredient('B', Material.BLAZE_ROD);
        recipe.setIngredient('S', Material.STICK);

        plugin.getServer().addRecipe(recipe);
        plugin.getSLF4JLogger().info("Registered recipe: warp_blade");
    }

    // Shapeless recipe — order does not matter
    private static void registerHealPouch(JavaPlugin plugin) {
        ItemStack result = new ItemStack(Material.GOLDEN_APPLE, 2);
        NamespacedKey key = new NamespacedKey(plugin, "heal_pouch");

        org.bukkit.inventory.ShapelessRecipe recipe =
            new org.bukkit.inventory.ShapelessRecipe(key, result);

        recipe.addIngredient(Material.APPLE);
        recipe.addIngredient(Material.GOLD_NUGGET);
        recipe.addIngredient(Material.GOLD_NUGGET);
        recipe.addIngredient(Material.GOLD_NUGGET);

        plugin.getServer().addRecipe(recipe);
    }
}
```

**Register in `onEnable`:**
```java
@Override
public void onEnable() {
    RecipeRegistrar.registerAll(this);
}
```

---

## RecipeChoice — Precise Ingredient Matching

`RecipeChoice` lets you specify NBT-exact items (custom items) or a tag-based group as ingredients.

```java
import org.bukkit.inventory.RecipeChoice;
import org.bukkit.Tag;

// Exact item match (respects PDC, name, and all NBT)
ItemStack specialStick = new CustomItemBuilder(plugin).buildSpecialStick();
recipe.setIngredient('S', new RecipeChoice.ExactChoice(specialStick));

// Any item in a Bukkit tag (e.g., all wooden planks)
recipe.setIngredient('P', new RecipeChoice.MaterialChoice(Tag.PLANKS));

// Multiple specific materials
recipe.setIngredient('W', new RecipeChoice.MaterialChoice(
    Material.OAK_LOG, Material.SPRUCE_LOG, Material.BIRCH_LOG
));
```

---

## Smelting Recipe

```java
import org.bukkit.inventory.FurnaceRecipe;

ItemStack result = new ItemStack(Material.GOLD_INGOT);
NamespacedKey key = new NamespacedKey(plugin, "smelt_special_ore");

FurnaceRecipe recipe = new FurnaceRecipe(
    key,
    result,
    Material.GOLD_ORE,   // input
    0.7f,                 // experience reward
    200                   // cook time in ticks (200 = 10 seconds)
);

plugin.getServer().addRecipe(recipe);
```

---

## Removing Recipes

```java
// Remove a specific recipe by its NamespacedKey
plugin.getServer().removeRecipe(new NamespacedKey(plugin, "warp_blade"));
```

> **Caution**: Removing Vanilla recipes (e.g., `new NamespacedKey("minecraft", "stick")`) affects all players on the server. Only remove your own plugin's recipes.

---

## Discovering Recipes (Unlock for Player)

By default, custom recipes are visible in the recipe book without unlocking. To require discovery:

In `plugin.yml`, add:
```yaml
# Make custom recipe require unlock
# (only applies if recipe book discovery is enabled in Bukkit config)
```

Or programmatically unlock for a player:
```java
player.discoverRecipe(new NamespacedKey(plugin, "warp_blade"));
// Or grant all at once:
player.discoverRecipes(List.of(
    new NamespacedKey(plugin, "warp_blade"),
    new NamespacedKey(plugin, "heal_pouch")
));
```

---

## Iterating Registered Recipes

```java
// Get all recipes for a specific result type
Iterator<Recipe> it = plugin.getServer().recipeIterator();
while (it.hasNext()) {
    Recipe recipe = it.next();
    if (recipe.getResult().getType() == Material.DIAMOND_SWORD) {
        // found it
    }
}
```

---

## Common Pitfalls

- **Registering recipes on every reload**: Calling `addRecipe()` twice with the same `NamespacedKey` creates duplicate recipes. Remove old recipes first or check with `getRecipe(key)` before adding.

- **Shape string length mismatch**: Each string in `recipe.shape(...)` must be the same length (1–3 chars). `"E"`, `" B"`, `"  S"` would throw `IllegalArgumentException`. Use `"E  "`, `" B "`, `"  S"` instead.

- **Shapeless ingredient count exceeds 9**: Shapeless recipes can have at most 9 ingredients (3×3 grid). Adding more throws at runtime.

- **`ExactChoice` items must match NBT exactly**: If the custom item's PDC changes between recipe registration and when a player tries to craft it, the recipe won't match. Keep the identity key stable.

## Related Skills

- [SKILL.md](SKILL.md) — Items overview
- [item-meta.md](item-meta.md) — Building custom ItemStack objects
- [../inventory/inventory-events.md](../inventory/inventory-events.md) — Detecting crafting results via events
