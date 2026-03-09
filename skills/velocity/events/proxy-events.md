# Proxy Events — Velocity

Detailed reference for server-switching, chat, and proxy lifecycle events in Velocity 3.3.

---

## ServerPreConnectEvent

**Package**: `com.velocitypowered.api.event.player.ServerPreConnectEvent`
**Fires**: Before a player connects to a backend server (initial connection AND server switches)
**Result type**: `ServerPreConnectEvent.ServerResult`

Use this to redirect players to a different server than intended, or to deny the connection.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | The connecting player |
| `event.getOriginalServer()` | `RegisteredServer` | The server originally requested |
| `event.getResult()` | `ServerResult` | Current result |
| `event.setResult(ServerResult)` | void | Redirect or deny |
| `ServerResult.allowed(RegisteredServer)` | redirect | Connect to this server instead |
| `ServerResult.denied()` | deny | Block connection (player remains on current server) |

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.ServerPreConnectEvent;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import org.slf4j.Logger;

public class ServerSwitchListener {

    private final Logger logger;

    @Subscribe
    public void onServerPreConnect(ServerPreConnectEvent event) {
        String targetName = event.getOriginalServer().getServerInfo().getName();

        // Redirect players trying to join "oldgames" to "games"
        if (targetName.equals("oldgames")) {
            RegisteredServer replacement = event.getPlayer().getCurrentServer()
                .map(s -> s.getServer())
                .orElse(null);

            event.getResult().getServer().ifPresent(s -> {
                // find a redirect
            });

            // Example redirect
            // event.getServer().getAllServers().stream()
            //     .filter(s -> s.getServerInfo().getName().equals("games"))
            //     .findFirst()
            //     .ifPresent(s -> event.setResult(ServerPreConnectEvent.ServerResult.allowed(s)));
        }
    }
}
```

---

## ServerConnectedEvent

**Package**: `com.velocitypowered.api.event.player.ServerConnectedEvent`
**Fires**: After player successfully connects to a backend server
**Cancellable**: No

Use this to log or react to server switches after they have already happened.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | The player who switched |
| `event.getServer()` | `RegisteredServer` | The server they connected to |
| `event.getPreviousServer()` | `Optional<RegisteredServer>` | Previous server (empty on initial join) |

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.ServerConnectedEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

@Subscribe
public void onServerConnected(ServerConnectedEvent event) {
    String newServer = event.getServer().getServerInfo().getName();
    boolean isInitial = event.getPreviousServer().isEmpty();

    if (!isInitial) {
        event.getPlayer().sendMessage(
            Component.text("You moved to " + newServer).color(NamedTextColor.GRAY)
        );
    }

    // Track per-server player counts in your metrics system
    metrics.recordPlayerJoin(newServer, event.getPlayer().getUniqueId());

    event.getPreviousServer().ifPresent(prev ->
        metrics.recordPlayerLeave(prev.getServerInfo().getName(), event.getPlayer().getUniqueId())
    );
}
```

---

## PlayerChatEvent

**Package**: `com.velocitypowered.api.event.player.PlayerChatEvent`
**Fires**: When a player sends a chat message through the proxy
**Result type**: `PlayerChatEvent.ChatResult`

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.PlayerChatEvent;

@Subscribe
public void onPlayerChat(PlayerChatEvent event) {
    String message = event.getMessage();

    // Filter profanity
    if (containsProfanity(message)) {
        event.setResult(PlayerChatEvent.ChatResult.denied());
        event.getPlayer().sendMessage(
            net.kyori.adventure.text.Component.text("Message blocked.")
        );
        return;
    }

    // Modify message
    if (message.startsWith("!")) {
        event.setResult(PlayerChatEvent.ChatResult.message(
            "[Server] " + message.substring(1)
        ));
    }
}
```

---

## PlayerCommandExecuteEvent

**Package**: `com.velocitypowered.api.event.command.PlayerCommandExecuteEvent`
**Fires**: When a player executes a command through the proxy
**Result type**: `CommandResult`

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.command.PlayerCommandExecuteEvent;

@Subscribe
public void onCommand(PlayerCommandExecuteEvent event) {
    String command = event.getCommand();

    // Log all commands for auditing
    logger.info("{} executed: /{}", event.getPlayer().getUsername(), command);

    // Block a command proxy-side
    if (command.startsWith("op ") && !event.getPlayer().hasPermission("network.admin")) {
        event.setResult(PlayerCommandExecuteEvent.CommandResult.denied());
    }
}
```

---

## KickedFromServerEvent

**Package**: `com.velocitypowered.api.event.player.KickedFromServerEvent`
**Fires**: When a player is kicked from a backend server
**Result type**: `KickedFromServerEvent.ServerKickResult`

Use this to send kicked players to a fallback server instead of disconnecting them.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | Kicked player |
| `event.getServer()` | `RegisteredServer` | The server that kicked them |
| `event.getServerKickReason()` | `Optional<Component>` | The kick message |
| `event.kickedDuringServerConnect()` | `boolean` | True if kicked during initial server connection |
| `ServerKickResult.redirectPlayer(server, message)` | send to fallback | Redirect instead of disconnect |
| `ServerKickResult.disconnectPlayer(message)` | disconnect | Default behavior |
| `ServerKickResult.notifyKickMessage(message)` | stay on proxy with notification | Only if player has other servers |

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.KickedFromServerEvent;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

public class FallbackListener {

    private final ProxyServer server;

    @Subscribe
    public void onKicked(KickedFromServerEvent event) {
        // Try to redirect to a lobby instead of disconnecting
        server.getServer("lobby").ifPresentOrElse(
            lobby -> event.setResult(
                KickedFromServerEvent.ServerKickResult.redirectPlayer(
                    lobby,
                    event.getServerKickReason()
                        .orElse(Component.text("Redirected to lobby."))
                )
            ),
            () -> event.setResult(
                KickedFromServerEvent.ServerKickResult.disconnectPlayer(
                    Component.text("You were kicked and no lobby is available.")
                        .color(NamedTextColor.RED)
                )
            )
        );
    }
}
```

---

## Proxy Lifecycle Events

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.event.proxy.ProxyReloadEvent;

@Subscribe
public void onInit(ProxyInitializeEvent event) {
    // Plugin startup — register listeners, load config
}

@Subscribe
public void onShutdown(ProxyShutdownEvent event) {
    // Plugin teardown — close DB, cancel tasks
}

@Subscribe
public void onReload(ProxyReloadEvent event) {
    // Velocity /velocity reload triggered — reload your config
}
```

---

## Common Pitfalls

- **Cancelling `ServerConnectedEvent`**: This event is NOT cancellable. To prevent a connection, use `ServerPreConnectEvent`.

- **Accessing player's current server before `ServerConnectedEvent`**: During `ServerPreConnectEvent`, `player.getCurrentServer()` may be `Optional.empty()` for players on their initial join.

- **Not handling empty `getServerKickReason()` in `KickedFromServerEvent`**: The reason may be empty if the backend didn't send one. Always use `orElse()` or `orElseGet()`.

## Related Skills

- [connection-events.md](connection-events.md) — Login/disconnect lifecycle
- [SKILL.md](SKILL.md) — Events overview
- [../commands/velocity-commands.md](../commands/velocity-commands.md) — Command system
