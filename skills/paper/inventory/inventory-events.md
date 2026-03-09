# Inventory Events — Paper

Reference for all inventory-related events in Paper 1.21: clicks, drags, open, and close.

---

## InventoryClickEvent

**Package**: `org.bukkit.event.inventory.InventoryClickEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires for every click inside any open inventory (including the player's own inventory).

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getInventory()` | `Inventory` | The **top** inventory (the GUI) |
| `event.getClickedInventory()` | `Inventory` (nullable) | Where the click occurred; can be top, bottom, or null (outside) |
| `event.getSlot()` | `int` | Slot within `getClickedInventory()` |
| `event.getRawSlot()` | `int` | Slot in combined view (top slots first) |
| `event.getCurrentItem()` | `ItemStack` (nullable) | Item in the clicked slot |
| `event.getCursor()` | `ItemStack` (nullable) | Item on the player's cursor |
| `event.getClick()` | `ClickType` | LEFT, RIGHT, SHIFT_LEFT, NUMBER_KEY, DROP, etc. |
| `event.getAction()` | `InventoryAction` | PICKUP_ALL, PLACE_ALL, MOVE_TO_OTHER_INVENTORY, etc. |
| `event.getWhoClicked()` | `HumanEntity` | Cast to `Player` for most cases |

### Filtering Top-Inventory Clicks Only

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;

public class GuiClickListener implements Listener {

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        Inventory topInventory = event.getInventory();

        // Identify by InventoryHolder type
        if (!(topInventory.getHolder() instanceof MyGuiHolder gui)) return;

        // Cancel all interactions with this GUI
        event.setCancelled(true);

        // Only handle clicks on the GUI's slots (not bottom player inventory)
        if (!topInventory.equals(event.getClickedInventory())) return;

        int slot = event.getSlot();
        var player = (org.bukkit.entity.Player) event.getWhoClicked();

        gui.handleClick(player, slot, event.getClick());
    }
}
```

### ClickType Values

| ClickType | Trigger |
|-----------|---------|
| `LEFT` | Left click |
| `RIGHT` | Right click |
| `SHIFT_LEFT` | Shift + left click |
| `SHIFT_RIGHT` | Shift + right click |
| `MIDDLE` | Middle mouse button |
| `NUMBER_KEY` | Hotbar number 1–9 |
| `DROP` | Q key (drop single) |
| `CONTROL_DROP` | Ctrl+Q (drop full stack) |
| `DOUBLE_CLICK` | Double left click |

---

## InventoryDragEvent

**Package**: `org.bukkit.event.inventory.InventoryDragEvent`
**Thread**: Main thread
**Cancellable**: Yes

Fires when a player drags an item across slots. Must be cancelled in GUIs to prevent splitting items into GUI slots.

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryDragEvent;

public class GuiDragListener implements Listener {

    @EventHandler
    public void onDrag(InventoryDragEvent event) {
        if (!(event.getInventory().getHolder() instanceof MyGuiHolder)) return;

        // Cancel drag if any dragged slot is in the top inventory
        int topSize = event.getInventory().getSize();
        for (int rawSlot : event.getRawSlots()) {
            if (rawSlot < topSize) {
                event.setCancelled(true);
                return;
            }
        }
    }
}
```

---

## InventoryOpenEvent

**Package**: `org.bukkit.event.inventory.InventoryOpenEvent`
**Thread**: Main thread
**Cancellable**: Yes (cancelling closes the inventory before it opens)

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryOpenEvent;

public class OpenListener implements Listener {

    @EventHandler
    public void onOpen(InventoryOpenEvent event) {
        // Example: prevent opening chests in a specific world
        if (event.getInventory().getType() == org.bukkit.event.inventory.InventoryType.CHEST) {
            if (event.getPlayer().getWorld().getName().equals("arena")) {
                event.setCancelled(true);
                event.getPlayer().sendMessage(
                    net.kyori.adventure.text.Component.text("Chests are disabled in the arena.")
                );
            }
        }
    }
}
```

---

## InventoryCloseEvent

**Package**: `org.bukkit.event.inventory.InventoryCloseEvent`
**Thread**: Main thread
**Cancellable**: No (use `player.openInventory()` in the handler to reopen if needed)

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryCloseEvent;

public class CloseListener implements Listener {

    @EventHandler
    public void onClose(InventoryCloseEvent event) {
        if (!(event.getInventory().getHolder() instanceof MyGuiHolder gui)) return;

        // Save any changes on close
        gui.onClose((org.bukkit.entity.Player) event.getPlayer());
    }
}
```

### Force Reopen (e.g., required GUI)

```java
@EventHandler
public void onClose(InventoryCloseEvent event) {
    if (!(event.getInventory().getHolder() instanceof RequiredGui gui)) return;
    if (gui.isMandatory()) {
        // Schedule reopen for next tick (can't open during close event)
        org.bukkit.Bukkit.getScheduler().runTask(plugin, () -> {
            if (event.getPlayer().isOnline()) {
                gui.open((org.bukkit.entity.Player) event.getPlayer());
            }
        });
    }
}
```

---

## PrepareItemCraftEvent — Crafting Table

Fires when the crafting grid changes and the result slot is being calculated. Use to inject custom results.

```java
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.PrepareItemCraftEvent;

public class CraftListener implements Listener {

    @EventHandler
    public void onCraft(PrepareItemCraftEvent event) {
        if (event.getRecipe() == null) return;

        // Modify the output item based on input ingredients
        var matrix = event.getInventory().getMatrix();
        // matrix[4] = centre slot, etc.

        event.getInventory().setResult(new org.bukkit.inventory.ItemStack(org.bukkit.Material.DIAMOND));
    }
}
```

---

## Common Pitfalls

- **Not handling `InventoryDragEvent`**: Players can bypass click cancellation by dragging items into GUI slots. Always handle both `InventoryClickEvent` AND `InventoryDragEvent` in custom GUIs.

- **`getSlot()` vs `getRawSlot()`**: `getSlot()` returns the slot within `getClickedInventory()`. `getRawSlot()` is the slot in the combined view (0 to top.size+bottom.size-1). For top-inventory checks, use `getSlot()` after verifying `getClickedInventory() == getInventory()`.

- **Reopening inventory on the same tick as close**: Calling `player.openInventory()` inside `InventoryCloseEvent` throws an error. Delay it one tick with `runTask(plugin, ...)`.

- **Shift-clicking moves items even when event is cancelled**: For `SHIFT_LEFT` and `SHIFT_RIGHT`, you may also need to set `event.setResult(Event.Result.DENY)` on some Paper versions in addition to cancellation for certain `InventoryAction` values.
