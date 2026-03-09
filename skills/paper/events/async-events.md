# Async Events — Paper

Threading rules, async-safe event handling, and the replacement for the deprecated `AsyncPlayerChatEvent` in Paper 1.21.

---

## Thread Model Recap

Paper uses a **main thread** for all Bukkit object operations. Most events fire on this main thread. A small set of events fire on **async threads** — these events are identifiable by:
- Their class name containing `Async` (e.g., `AsyncChatEvent`)
- Being marked with `super(true)` in their constructor

**Async thread rules:**
- ✅ Read immutable data from events (message text, player name, UUID)
- ✅ Modify event objects themselves (change the message, cancel the event)
- ✅ Perform IO, database calls, HTTP requests
- ❌ Call `player.teleport()`, `world.dropItem()`, `entity.setLocation()`, or any Bukkit world-mutation methods
- ❌ Call `Bukkit.getServer()` methods that modify server state

---

## AsyncChatEvent (Paper 1.19+, replaces `AsyncPlayerChatEvent`)

**Package**: `io.papermc.paper.event.player.AsyncChatEvent`
**Thread**: Async (Netty pipeline thread)
**Cancellable**: Yes

`AsyncChatEvent` uses Adventure `Component` for the message, replacing the legacy String-based `AsyncPlayerChatEvent`.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | Sending player (read-only snapshot safe) |
| `event.message()` | `Component` | The chat message as Adventure component |
| `event.message(Component)` | void | Replace the message |
| `event.renderer()` | `ChatRenderer` | Current render pipeline |
| `event.renderer(ChatRenderer)` | void | Replace renderer (controls format for recipients) |
| `event.viewers()` | `Set<Audience>` | Mutable set of who receives the message |
| `event.isCancelled()` | `boolean` | |
| `event.setCancelled(boolean)` | void | Cancel = message not sent |

### ChatRenderer

```java
import io.papermc.paper.chat.ChatRenderer;
import net.kyori.adventure.audience.Audience;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

// Custom renderer that prepends the player's rank prefix
public class RankChatRenderer implements ChatRenderer {

    @Override
    public @NotNull Component render(
        @NotNull Player source,
        @NotNull Component sourceDisplayName,
        @NotNull Component message,
        @NotNull Audience viewer
    ) {
        // Format: [VIP] PlayerName: message
        String prefix = getRankPrefix(source);   // read from config/cache — fast, no Bukkit mutations

        return Component.text(prefix).color(NamedTextColor.GOLD)
            .append(sourceDisplayName)
            .append(Component.text(": ").color(NamedTextColor.WHITE))
            .append(message);
    }

    private String getRankPrefix(Player player) {
        // Safe: reads in-memory cache
        return player.hasPermission("rank.vip") ? "[VIP] " : "";
    }
}
```

**Applying the renderer:**
```java
@EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
public void onChat(AsyncChatEvent event) {
    event.renderer(new RankChatRenderer());
}
```

---

## Full AsyncChatEvent Example

```java
package com.yourorg.myplugin.events;

import io.papermc.paper.event.player.AsyncChatEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.plugin.java.JavaPlugin;

public class ChatListener implements Listener {

    private final JavaPlugin plugin;
    private static final PlainTextComponentSerializer PLAIN = PlainTextComponentSerializer.plainText();

    public ChatListener(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onChat(AsyncChatEvent event) {
        Player player = event.getPlayer();

        // Read the message as plain text for filtering
        String plainText = PLAIN.serialize(event.message());

        // Simple profanity filter (async-safe: only modifies event object)
        if (containsProfanity(plainText)) {
            event.setCancelled(true);
            // Send feedback — scheduling to main thread for safety
            Bukkit.getScheduler().runTask(plugin, () ->
                player.sendMessage(Component.text("Your message was blocked.")
                    .color(NamedTextColor.RED))
            );
            return;
        }

        // Mute check — read from in-memory cache (async-safe)
        if (isMuted(player)) {
            event.setCancelled(true);
            Bukkit.getScheduler().runTask(plugin, () ->
                player.sendMessage(Component.text("You are muted.").color(NamedTextColor.RED))
            );
            return;
        }

        // Replace message content (async-safe)
        event.message(event.message()
            .append(Component.text(" ✓").color(NamedTextColor.GREEN)));
    }

    // Async-safe: reads only in-memory state
    private boolean isMuted(Player player) {
        // return muteCache.contains(player.getUniqueId());
        return false;
    }

    private boolean containsProfanity(String text) {
        return text.contains("badword");
    }
}
```

---

## When to Schedule Back to Main Thread

If you need to mutate Bukkit world state from inside an async event handler, use the scheduler:

```java
@EventHandler
public void onChat(AsyncChatEvent event) {
    // Async: OK to read event data
    Component message = event.message();

    // Need to give player an item? Schedule to main thread:
    Bukkit.getScheduler().runTask(plugin, () -> {
        Player p = event.getPlayer();
        p.getInventory().addItem(new org.bukkit.inventory.ItemStack(org.bukkit.Material.DIAMOND));
    });
}
```

---

## Deprecated: AsyncPlayerChatEvent

`AsyncPlayerChatEvent` (package `org.bukkit.event.player`) is deprecated in Paper 1.19+ and should not be used in new code. It uses legacy `String` formatting and does not support Adventure components.

| Old (deprecated) | New (Paper 1.19+) |
|-----------------|------------------|
| `AsyncPlayerChatEvent` | `AsyncChatEvent` |
| `event.getMessage()` returns `String` | `event.message()` returns `Component` |
| `event.setFormat(String)` | `event.renderer(ChatRenderer)` |
| `event.getRecipients()` returns `Set<Player>` | `event.viewers()` returns `Set<Audience>` |

---

## Common Pitfalls

- **Calling world-mutating methods inside async handlers**: Always schedule back to main thread with `Bukkit.getScheduler().runTask(plugin, () -> {...})`.

- **Using `AsyncPlayerChatEvent` in Paper 1.21**: It still fires in some builds but is deprecated and may be removed. Migrate to `AsyncChatEvent`.

- **Accessing `event.getRecipients()` on `AsyncPlayerChatEvent`**: The recipient set is not thread-safe and modifying it from the async thread can cause `ConcurrentModificationException`.

- **Running database queries inside the event handler without considering event thread**: The event is already on an async thread, so database calls inside `AsyncChatEvent` are fine — but they block the event thread. Prefer caching frequently-accessed data (mute lists, ranks) in memory.

---

## Version Notes

- **1.21**: `AsyncChatEvent` is stable and preferred.
- **1.21.1**: No changes to chat event API.
- `AsyncChatEvent` is only available in Paper (not in Spigot). Purpur inherits it from Paper.
