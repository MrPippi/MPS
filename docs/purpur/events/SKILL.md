# Events Skill — Purpur

## Purpose
Reference this skill when handling Purpur-specific events that are not available in Paper. All Paper events are also available in Purpur — this skill covers only the additional events provided by Purpur's API.

## When to Use This Skill
- Detecting when a player goes AFK or returns from AFK
- Responding to Purpur-extended entity/damage events
- Writing a plugin that specifically targets Purpur (not cross-platform)

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `PlayerAFKEvent` | Player becomes AFK | Requires `afk-timeout` set in `purpur.yml` |
| `PlayerNotAFKEvent` | Player returns from AFK | |
| `EntityAirChangeEvent` | Entity's air supply changes | Cancellable |
| `PlayerAFKEvent#getPlayer()` | `Player` going AFK | |
| `PlayerAFKEvent#isGoingAFK()` | Always `true` for AFK event | Use `PlayerNotAFKEvent` for return |

## Code Pattern

```java
package com.yourorg.myplugin.events;

import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.purpurmc.purpur.event.entity.EntityAirChangeEvent;
import org.purpurmc.purpur.event.player.PlayerAFKEvent;
import org.purpurmc.purpur.event.player.PlayerNotAFKEvent;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.entity.Player;

public class PurpurEventListener implements Listener {

    // --- AFK Events ---

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerAFK(PlayerAFKEvent event) {
        Player player = event.getPlayer();

        // Notify the player
        player.sendActionBar(
            Component.text("You are now AFK.").color(NamedTextColor.GRAY)
        );

        // Broadcast to the server
        player.getServer().broadcast(
            Component.text(player.getName() + " is now AFK.")
                .color(NamedTextColor.YELLOW)
        );
    }

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerReturnFromAFK(PlayerNotAFKEvent event) {
        Player player = event.getPlayer();

        player.sendActionBar(
            Component.text("Welcome back!").color(NamedTextColor.GREEN)
        );

        player.getServer().broadcast(
            Component.text(player.getName() + " is no longer AFK.")
                .color(NamedTextColor.YELLOW)
        );
    }

    // --- Entity Air Change ---

    @EventHandler(priority = EventPriority.NORMAL)
    public void onEntityAirChange(EntityAirChangeEvent event) {
        // Example: prevent players from losing air underwater
        if (event.getEntity() instanceof Player player
                && player.hasPermission("myplugin.no-drown")) {
            event.setCancelled(true);
        }
    }
}
```

**Guard Purpur-only registration:**
```java
// In main class onEnable — only register if running on Purpur
try {
    Class.forName("org.purpurmc.purpur.event.player.PlayerAFKEvent");
    getServer().getPluginManager().registerEvents(new PurpurEventListener(), this);
    getSLF4JLogger().info("Purpur events registered.");
} catch (ClassNotFoundException e) {
    getSLF4JLogger().info("Not running on Purpur — Purpur-specific events skipped.");
}
```

## Common Pitfalls

- **Registering Purpur listeners on a Paper server**: If your plugin runs on plain Paper, Purpur event classes are absent. The registration itself (calling `registerEvents`) will throw `ClassNotFoundException` at plugin load time. Always guard with a `try/catch` or `softdepend: [Purpur]` and a runtime check.

- **Depending on AFK without configuring `purpur.yml`**: `PlayerAFKEvent` only fires if `gameplay-mechanics.afk-timeout` is set to a positive value in `purpur.yml`. With the default of `0` (disabled), the event never fires.

- **Assuming Purpur event package paths are the same as Paper**: Purpur events are under `org.purpurmc.purpur.event.*`, NOT `io.papermc.paper.event.*`.

## Version Notes

- **Purpur 1.21.1**: `PlayerAFKEvent` and `PlayerNotAFKEvent` are stable. `EntityAirChangeEvent` is available.
- Purpur does not have a dedicated SemVer release cycle tied to Paper patch versions — always verify the Purpur changelog for your build.

## Related Skills

- [../OVERVIEW.md](../OVERVIEW.md) — Purpur platform setup
- [../../paper/events/SKILL.md](../../paper/events/SKILL.md) — All Paper events (available in Purpur too)
- [../../paper/events/player-events.md](../../paper/events/player-events.md) — Player event reference
