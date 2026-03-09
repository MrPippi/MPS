# Custom Events — Paper

How to create, fire, and listen to your own events in Paper plugins.

---

## Why Custom Events

Custom events decouple plugin subsystems and allow other plugins to integrate with your plugin's logic. They follow the same `Listener` + `@EventHandler` pattern as built-in events.

---

## Creating a Custom Event

Every custom event must:
1. Extend `org.bukkit.event.Event`
2. Provide a static `HandlerList` and override `getHandlers()` / `getHandlerList()`

### Minimal Non-Cancellable Event

```java
package com.yourorg.myplugin.events;

import org.bukkit.entity.Player;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;

public class PlayerLevelUpEvent extends Event {

    // Required boilerplate — every custom event needs exactly one HandlerList
    private static final HandlerList HANDLERS = new HandlerList();

    private final Player player;
    private final int newLevel;

    public PlayerLevelUpEvent(Player player, int newLevel) {
        this.player = player;
        this.newLevel = newLevel;
    }

    public Player getPlayer() { return player; }
    public int getNewLevel()  { return newLevel; }

    @Override
    public @NotNull HandlerList getHandlers() { return HANDLERS; }

    // Must be static — Bukkit reflects this method
    public static HandlerList getHandlerList() { return HANDLERS; }
}
```

### Cancellable Custom Event

```java
package com.yourorg.myplugin.events;

import org.bukkit.entity.Player;
import org.bukkit.event.Cancellable;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;

public class PlayerTradeEvent extends Event implements Cancellable {

    private static final HandlerList HANDLERS = new HandlerList();

    private final Player buyer;
    private final Player seller;
    private double price;
    private boolean cancelled;

    public PlayerTradeEvent(Player buyer, Player seller, double price) {
        this.buyer = buyer;
        this.seller = seller;
        this.price = price;
        this.cancelled = false;
    }

    public Player getBuyer()  { return buyer; }
    public Player getSeller() { return seller; }
    public double getPrice()  { return price; }

    // Allow listeners to modify the trade price
    public void setPrice(double price) { this.price = price; }

    @Override
    public boolean isCancelled() { return cancelled; }

    @Override
    public void setCancelled(boolean cancel) { this.cancelled = cancel; }

    @Override
    public @NotNull HandlerList getHandlers() { return HANDLERS; }

    public static HandlerList getHandlerList() { return HANDLERS; }
}
```

---

## Firing a Custom Event

Call `PluginManager#callEvent(Event)` on the main thread (or mark as async if firing from an async context — see Async section below).

```java
package com.yourorg.myplugin;

import com.yourorg.myplugin.events.PlayerTradeEvent;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public class TradeManager {

    private final JavaPlugin plugin;

    public TradeManager(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public boolean processTrade(Player buyer, Player seller, double price) {
        // Create and call the event
        PlayerTradeEvent event = new PlayerTradeEvent(buyer, seller, price);
        plugin.getServer().getPluginManager().callEvent(event);

        // Check if another plugin cancelled it
        if (event.isCancelled()) {
            buyer.sendMessage(
                net.kyori.adventure.text.Component.text("Trade was cancelled.")
            );
            return false;
        }

        // Use potentially-modified price
        double finalPrice = event.getPrice();
        // ... complete the trade at finalPrice
        return true;
    }
}
```

---

## Listening to Custom Events

Listening to custom events is identical to listening to Bukkit events:

```java
package com.yourorg.myplugin.events;

import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;

public class TradeListener implements Listener {

    // Tax plugin: reduce price by 10% tax
    @EventHandler(priority = EventPriority.NORMAL)
    public void onTrade(PlayerTradeEvent event) {
        if (event.isCancelled()) return;

        double tax = event.getPrice() * 0.10;
        event.setPrice(event.getPrice() - tax);   // buyer pays after 10% tax reduction
    }

    // Log all completed trades (MONITOR = read-only, after all plugins have processed)
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onTradeMonitor(PlayerTradeEvent event) {
        System.out.printf("Trade: %s → %s for %.2f%n",
            event.getBuyer().getName(),
            event.getSeller().getName(),
            event.getPrice());
    }
}
```

---

## Async Custom Events

If your event fires from an async context (e.g., database callback thread), mark it as async:

```java
public class DatabaseLoadCompleteEvent extends Event {

    private static final HandlerList HANDLERS = new HandlerList();

    public DatabaseLoadCompleteEvent() {
        super(true);   // true = async event
    }

    @Override
    public @NotNull HandlerList getHandlers() { return HANDLERS; }
    public static HandlerList getHandlerList() { return HANDLERS; }
}
```

> **Warning**: Async events can only be handled by listeners that do NOT call Bukkit world/entity methods. If a listener needs to interact with the world, it must schedule a task back to the main thread.

---

## Common Pitfalls

- **Missing static `getHandlerList()`**: Bukkit uses reflection to find this method. If it's absent, the event silently fails to fire. Every event MUST have both an instance `getHandlers()` and a static `getHandlerList()`.

- **Sharing `HandlerList` between subclasses**: Each concrete event class needs its own `HandlerList`. If you extend a custom event, create a new `HANDLERS` in the subclass.

- **Calling `callEvent()` from an async thread without marking the event async**: This throws `IllegalStateException`. Either mark the event with `super(true)` or schedule `callEvent` back to the main thread.

- **Not checking `isCancelled()` after `callEvent()`**: If your event is cancellable, always check the result after calling the event to respect other plugins' decisions.

---

## Best Practices

- Fire events **before** performing the action they represent, so listeners can cancel or modify it.
- Use the `MONITOR` priority for logging/statistics listeners — never cancel at `MONITOR`.
- Include mutable fields in your event (e.g., `setPrice`, `setMessage`) to let other plugins adjust behavior without reflection hacks.
