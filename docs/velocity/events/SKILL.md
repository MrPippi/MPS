# Events Skill — Velocity

## Purpose
Reference this skill when handling events in a Velocity proxy plugin. Velocity's event system is fully async and uses `@Subscribe` annotations instead of Bukkit's `@EventHandler`.

## When to Use This Skill
- Responding to player connections, disconnections, or server switches
- Intercepting login to apply bans, authentication checks, or queue systems
- Broadcasting proxy-level events to your own subsystems
- Registering event listeners on Velocity

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `EventManager#register(plugin, listener)` | Register all `@Subscribe` methods in an object | Pass your plugin instance as first arg |
| `@Subscribe` | Marks a method as an event listener | Method takes exactly one event parameter |
| `PostOrder` | Controls listener ordering | `FIRST`, `EARLY`, `NORMAL`, `LATE`, `LAST`, `CUSTOM` |
| `ResultedEvent` | Events with a result (allow/deny) | Set result via `event.setResult(...)` |
| `EventManager#fire(Event)` | Fire a custom or built-in event | Returns `CompletableFuture<E>` |
| `EventManager#fireAndForget(Event)` | Fire without waiting for result | For events you don't need to read |

## Code Pattern

```java
package com.yourorg.proxyplugin.listeners;

import com.velocitypowered.api.event.PostOrder;
import com.velocitypowered.api.event.ResultedEvent;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.DisconnectEvent;
import com.velocitypowered.api.event.connection.LoginEvent;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.event.player.PlayerChooseInitialServerEvent;
import com.velocitypowered.api.event.player.ServerConnectedEvent;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.slf4j.Logger;

import java.util.Optional;

public class ConnectionListener {

    private final ProxyServer server;
    private final Logger logger;

    public ConnectionListener(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    // Fires before the player is fully logged in — can deny login
    @Subscribe(order = PostOrder.NORMAL)
    public void onLogin(LoginEvent event) {
        // Example: reject banned players (check your ban list here)
        String playerName = event.getPlayer().getUsername();
        if (isBanned(playerName)) {
            event.setResult(ResultedEvent.ComponentResult.denied(
                Component.text("You are banned from this network.")
                    .color(NamedTextColor.RED)
            ));
        }
    }

    // Fires after player is fully connected
    @Subscribe(order = PostOrder.NORMAL)
    public void onPostLogin(PostLoginEvent event) {
        Player player = event.getPlayer();
        logger.info("{} ({}) connected to the proxy.", player.getUsername(), player.getUniqueId());

        // Network-wide welcome broadcast
        server.getAllPlayers().forEach(p ->
            p.sendMessage(Component.text("→ ")
                .color(NamedTextColor.GREEN)
                .append(Component.text(player.getUsername() + " joined the network.")
                    .color(NamedTextColor.WHITE)))
        );
    }

    // Choose which backend server a player initially connects to
    @Subscribe(order = PostOrder.NORMAL)
    public void onChooseServer(PlayerChooseInitialServerEvent event) {
        Optional<RegisteredServer> lobby = server.getServer("lobby");
        lobby.ifPresent(event::setInitialServer);
    }

    // Fires after player successfully connects to a backend server
    @Subscribe(order = PostOrder.NORMAL)
    public void onServerConnected(ServerConnectedEvent event) {
        Player player = event.getPlayer();
        String serverName = event.getServer().getServerInfo().getName();
        String previousServer = event.getPreviousServer()
            .map(s -> s.getServerInfo().getName())
            .orElse("none");

        logger.info("{} switched from {} to {}", player.getUsername(), previousServer, serverName);
    }

    // Fires when player disconnects from the proxy
    @Subscribe(order = PostOrder.NORMAL)
    public void onDisconnect(DisconnectEvent event) {
        logger.info("{} disconnected ({}).",
            event.getPlayer().getUsername(),
            event.getLoginStatus());
    }

    private boolean isBanned(String playerName) {
        // Check your ban storage
        return false;
    }
}
```

**Register the listener in your main class:**
```java
@Subscribe
public void onProxyInitialize(ProxyInitializeEvent event) {
    server.getEventManager().register(this, new ConnectionListener(server, logger));
}
```

## Common Pitfalls

- **Using Bukkit event annotations on Velocity**: `@EventHandler` is a Bukkit annotation. Velocity uses `@Subscribe` from `com.velocitypowered.api.event`. Methods annotated with `@EventHandler` will be silently ignored.

- **Blocking inside event handlers**: All Velocity event handlers run on an async thread pool. Blocking with `Thread.sleep()` or synchronous IO will starve the event thread. Use `CompletableFuture` for async work.

- **Not setting a result on `ResultedEvent`**: If you don't call `event.setResult(...)`, the default result applies (usually allow). Always explicitly set results for login/connection events when making decisions.

- **Accessing full player game state (inventory, location)**: Velocity is a proxy — it has no knowledge of the player's in-game state. You can read `Player.getUsername()`, `getUniqueId()`, `getCurrentServer()`, `getRemoteAddress()`, etc., but not inventory or world data.

## Version Notes

- **Velocity 3.3**: `@Subscribe` with `PostOrder` is the standard. `EventTask` (returning `EventTask` from subscribe methods for async handling) is supported.
- **Velocity 3.3**: `DisconnectEvent.LoginStatus` distinguishes `SUCCESSFUL_LOGIN`, `CONFLICTING_LOGIN`, `PRE_SERVER_JOIN` disconnect scenarios.

## Related Skills

- [connection-events.md](connection-events.md) — LoginEvent, PreLoginEvent, PostLoginEvent detail
- [proxy-events.md](proxy-events.md) — ServerConnectedEvent, PlayerChooseInitialServerEvent detail
- [../OVERVIEW.md](../OVERVIEW.md) — Velocity platform setup
- [../commands/SKILL.md](../commands/SKILL.md) — Velocity commands
