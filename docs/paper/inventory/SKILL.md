# Inventory Skill — Paper

## Purpose
Reference this skill when building custom clickable inventory GUIs (chest menus, shop UIs, settings screens) in Paper 1.21. Covers inventory creation, `InventoryHolder` pattern, and event-driven click handling.

## When to Use This Skill
- Creating a chest-style menu that players open with a command
- Building a shop or upgrade UI where clicks perform actions
- Handling `InventoryClickEvent` to route button clicks to plugin logic
- Preventing players from taking items out of a GUI inventory

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Bukkit.createInventory(holder, size, title)` | Create a custom inventory | `size` must be multiple of 9 (9–54) |
| `Inventory#setItem(slot, ItemStack)` | Place an item in a slot | Slots 0–53 for double chest |
| `Player#openInventory(Inventory)` | Open for a player | Main thread only |
| `InventoryHolder` | Tag interface to identify plugin inventories | Implement on your GUI class |
| `InventoryClickEvent` | Fires when any slot is clicked | Check `event.getInventory()` |
| `InventoryOpenEvent` | Fires when inventory is opened | |
| `InventoryCloseEvent` | Fires when inventory is closed | |
| `event.setCancelled(true)` | Prevent item movement | Use in GUI click handler |
| `event.getSlot()` | Clicked slot index | Top inventory slots only |
| `event.getClick()` | `ClickType` (LEFT, RIGHT, SHIFT_LEFT…) | |
| `event.getWhoClicked()` | `HumanEntity` (cast to `Player`) | |

## Code Pattern

```java
package com.yourorg.myplugin.gui;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryCloseEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.jetbrains.annotations.NotNull;

import java.util.List;

// --- 1. Inventory Holder: identifies this as a plugin GUI ---
public class MainMenuGui implements InventoryHolder {

    private final Inventory inventory;

    public MainMenuGui() {
        // 27-slot (3-row) chest with Adventure title
        this.inventory = Bukkit.createInventory(this, 27,
            Component.text("Main Menu").color(NamedTextColor.DARK_AQUA));

        buildContents();
    }

    private void buildContents() {
        // Fill background with grey glass panes
        ItemStack filler = makeButton(Material.GRAY_STAINED_GLASS_PANE, " ", List.of());
        for (int i = 0; i < inventory.getSize(); i++) {
            inventory.setItem(i, filler);
        }

        // Shop button — slot 11
        inventory.setItem(11, makeButton(
            Material.GOLD_INGOT,
            "Shop",
            List.of(Component.text("Click to open the shop.").color(NamedTextColor.GRAY))
        ));

        // Stats button — slot 13
        inventory.setItem(13, makeButton(
            Material.BOOK,
            "Stats",
            List.of(Component.text("View your stats.").color(NamedTextColor.GRAY))
        ));

        // Close button — slot 15
        inventory.setItem(15, makeButton(
            Material.BARRIER,
            "Close",
            List.of(Component.text("Close this menu.").color(NamedTextColor.RED))
        ));
    }

    private ItemStack makeButton(Material mat, String name, List<Component> lore) {
        ItemStack item = new ItemStack(mat);
        ItemMeta meta = item.getItemMeta();
        meta.displayName(Component.text(name)
            .color(NamedTextColor.WHITE)
            .decoration(TextDecoration.ITALIC, false));
        meta.lore(lore.stream()
            .map(c -> c.decoration(TextDecoration.ITALIC, false))
            .toList());
        item.setItemMeta(meta);
        return item;
    }

    public void open(Player player) {
        player.openInventory(inventory);
    }

    @Override
    public @NotNull Inventory getInventory() {
        return inventory;
    }
}

// --- 2. Event Listener: handles all GUI clicks ---
class GuiListener implements Listener {

    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        // Only handle clicks inside MainMenuGui inventories
        if (!(event.getInventory().getHolder() instanceof MainMenuGui gui)) return;

        // Always cancel to prevent item theft
        event.setCancelled(true);

        // Ignore clicks on the player's own bottom inventory
        if (event.getClickedInventory() != event.getInventory()) return;

        if (!(event.getWhoClicked() instanceof Player player)) return;

        switch (event.getSlot()) {
            case 11 -> player.performCommand("shop");
            case 13 -> player.performCommand("stats");
            case 15 -> player.closeInventory();
        }
    }

    @EventHandler
    public void onInventoryClose(InventoryCloseEvent event) {
        if (event.getInventory().getHolder() instanceof MainMenuGui) {
            // Clean up resources if needed when GUI is closed
        }
    }
}
```

## Common Pitfalls

- **Not cancelling `InventoryClickEvent`**: Without `event.setCancelled(true)`, players can pick up the glass-pane filler items or swap them with their own inventory.

- **Not checking `getClickedInventory()`**: `InventoryClickEvent` fires for BOTH the top (GUI) inventory and the player's bottom inventory. Filter by `event.getClickedInventory() == event.getInventory()` to only handle GUI slots.

- **Creating a new `Inventory` object per click**: Calling `Bukkit.createInventory()` on every click creates thousands of objects. Create the inventory once (in the constructor or `open()`) and reuse it.

- **Identifying GUIs by title string**: Titles are user-visible and can collide with other plugins. Always use `InventoryHolder` (`instanceof` check) to identify your GUIs reliably.

- **Updating items while the GUI is open**: Use `inventory.setItem(slot, newItem)` to update live — the client sees the change without reopening.

## Version Notes

- **1.21 / 1.21.1**: `Bukkit.createInventory(holder, size, Component title)` is the standard Adventure-title overload. The `String` overload is deprecated.

## Related Skills

- [inventory-events.md](inventory-events.md) — Full InventoryClickEvent, DragEvent reference
- [../items/SKILL.md](../items/SKILL.md) — Building ItemStack buttons
- [../events/SKILL.md](../events/SKILL.md) — Event registration
