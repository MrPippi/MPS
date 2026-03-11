# Events Skill — Waterfall

## Purpose
Reference this skill when handling events in a Waterfall (BungeeCord) proxy plugin. Waterfall's event system resembles Bukkit's `@EventHandler` pattern but uses BungeeCord-specific event classes.

## When to Use This Skill
- Responding to player login, server switch, or disconnect events at the proxy level
- Intercepting chat at the proxy
- Implementing ban checks or authentication before players join the network

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Listener` | Marker interface for BungeeCord event listeners | `net.md_5.bungee.api.plugin.Listener` |
| `@EventHandler` | Marks event handler method | `net.md_5.bungee.event.EventHandler` |
| `EventPriority` | Controls order: `LOWEST` → `LOW` → `NORMAL` → `HIGH` → `HIGHEST` | `net.md_5.bungee.event.EventPriority` |
| `PluginManager#registerListener(Plugin, Listener)` | Register all handlers in a listener | |
| `PostLoginEvent` | Player fully connected to proxy | `net.md_5.bungee.api.event.PostLoginEvent` |
| `LoginEvent` | Before player is authenticated | Cancellable; set reason to kick |
| `PlayerDisconnectEvent` | Player left the proxy | |
| `ServerConnectedEvent` | Player connected to a backend | |
| `ServerSwitchEvent` | Player switched to a different backend | |
| `ChatEvent` | Player sent a chat message | Cancellable |
| `PluginMessageEvent` | Plugin message received at proxy | |
| `ProxiedPlayer` | BungeeCord player handle | `net.md_5.bungee.api.connection.ProxiedPlayer` |

## Code Pattern

```java
package com.yourorg.waterfallplugin.listeners;

import net.md_5.bungee.api.ProxyServer;
import net.md_5.bungee.api.chat.TextComponent;
import net.md_5.bungee.api.connection.ProxiedPlayer;
import net.md_5.bungee.api.event.ChatEvent;
import net.md_5.bungee.api.event.LoginEvent;
import net.md_5.bungee.api.event.PlayerDisconnectEvent;
import net.md_5.bungee.api.event.PostLoginEvent;
import net.md_5.bungee.api.event.ServerConnectedEvent;
import net.md_5.bungee.api.plugin.Listener;
import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.event.EventHandler;
import net.md_5.bungee.event.EventPriority;

import java.util.logging.Logger;

public class ConnectionListener implements Listener {

    private final Plugin plugin;
    private final Logger logger;

    public ConnectionListener(Plugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getLogger();
    }

    // Fires before login — kick players early
    @EventHandler(priority = EventPriority.NORMAL)
    public void onLogin(LoginEvent event) {
        // event.getConnection() gives InboundConnection (no player yet)
        String name = event.getConnection().getName();

        if (isNetworkBanned(name)) {
            // BungeeCord uses legacy chat components
            event.setCancelled(true);
            event.setCancelReason(new TextComponent("§cYou are banned from this network."));
        }
    }

    // Player fully connected to the proxy
    @EventHandler(priority = EventPriority.NORMAL)
    public void onPostLogin(PostLoginEvent event) {
        ProxiedPlayer player = event.getPlayer();
        logger.info(player.getName() + " (" + player.getUniqueId() + ") joined the network.");

        // Broadcast in BungeeCord style (legacy chat)
        ProxyServer.getInstance().broadcast(
            new TextComponent("§a» " + player.getName() + " joined the network.")
        );
    }

    // Player connected to a backend server
    @EventHandler
    public void onServerConnected(ServerConnectedEvent event) {
        ProxiedPlayer player = event.getPlayer();
        String serverName = event.getServer().getInfo().getName();
        logger.info(player.getName() + " connected to " + serverName);
    }

    // Player disconnected from the proxy
    @EventHandler
    public void onDisconnect(PlayerDisconnectEvent event) {
        ProxiedPlayer player = event.getPlayer();
        logger.info(player.getName() + " disconnected.");
    }

    // Chat event (fires at proxy level for all messages)
    @EventHandler(priority = EventPriority.NORMAL)
    public void onChat(ChatEvent event) {
        if (event.isCommand()) return;   // Skip commands

        String message = event.getMessage();
        if (containsProfanity(message)) {
            event.setCancelled(true);
            if (event.getSender() instanceof ProxiedPlayer player) {
                player.sendMessage(new TextComponent("§cYour message was blocked."));
            }
        }
    }

    private boolean isNetworkBanned(String name) { return false; }
    private boolean containsProfanity(String msg) { return false; }
}
```

**Register listener in main class:**
```java
@Override
public void onEnable() {
    getProxy().getPluginManager().registerListener(this, new ConnectionListener(this));
}
```

## Common Pitfalls

- **Using Bukkit `@EventHandler` annotation**: The BungeeCord annotation is `net.md_5.bungee.event.EventHandler`, NOT `org.bukkit.event.EventHandler`. Using the wrong import means handlers are silently ignored.

- **Using Adventure components on Waterfall without the adapter**: Waterfall doesn't natively support Adventure. Use legacy `TextComponent` and `ChatColor` OR add the `adventure-platform-bungeecord` adapter to your shaded JAR.

- **Cancelling `PlayerDisconnectEvent`**: This event is NOT cancellable. You cannot prevent a disconnect at this stage.

- **Using `ServerConnectedEvent` vs `ServerSwitchEvent`**: `ServerConnectedEvent` fires when a player joins a backend (initial or switch). `ServerSwitchEvent` fires after the switch is complete and provides the `from` server. For most use cases, `ServerConnectedEvent` is preferred.

## Version Notes

- **Waterfall 1.21**: Event API is unchanged from older BungeeCord versions. All events in `net.md_5.bungee.api.event.*` are available.
- `LoginEvent` is async in BungeeCord — blocking in its handler delays login for that player.

## Related Skills

- [../OVERVIEW.md](../OVERVIEW.md) — Waterfall platform setup
- [../messaging/SKILL.md](../messaging/SKILL.md) — Plugin messaging
- [../../velocity/events/SKILL.md](../../velocity/events/SKILL.md) — Equivalent Velocity events
