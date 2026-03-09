# Connection Events — Velocity

Detailed reference for player connection lifecycle events in Velocity 3.3.

---

## Connection Lifecycle Order

```
PreLoginEvent
    ↓ (if allowed)
LoginEvent
    ↓ (if allowed)
PostLoginEvent + PlayerChooseInitialServerEvent
    ↓
ServerPreConnectEvent (before each server switch)
    ↓
ServerConnectedEvent (after each server switch)
    ↓
DisconnectEvent (on proxy disconnect)
```

---

## PreLoginEvent

**Package**: `com.velocitypowered.api.event.connection.PreLoginEvent`
**Fires**: Before player profile is resolved (pre-authentication)
**Result type**: `PreLoginEvent.PreLoginComponentResult`

Use this for early rejection before any session state is created (e.g., IP bans, maintenance mode).

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getConnection()` | `InboundConnection` | Raw connection (no player yet) |
| `event.getUsername()` | `String` | The name the client sent |
| `event.getResult()` | `PreLoginComponentResult` | Current result |
| `event.setResult(PreLoginComponentResult)` | void | Set allow/deny |
| `PreLoginComponentResult.allowed()` | allow | Default |
| `PreLoginComponentResult.denied(Component)` | deny | Kicks with message |
| `PreLoginComponentResult.forceOfflineMode()` | force offline | Skip Mojang auth |
| `PreLoginComponentResult.forceOnlineMode()` | force online | Require Mojang auth |

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PreLoginEvent;
import net.kyori.adventure.text.Component;

@Subscribe
public void onPreLogin(PreLoginEvent event) {
    // Maintenance mode: allow only specific players
    if (maintenanceMode && !isAllowed(event.getUsername())) {
        event.setResult(PreLoginEvent.PreLoginComponentResult.denied(
            Component.text("Server is under maintenance. Try again later.")
        ));
    }
}
```

---

## LoginEvent

**Package**: `com.velocitypowered.api.event.connection.LoginEvent`
**Fires**: After authentication, before player is placed into the proxy
**Result type**: `ResultedEvent.ComponentResult`

Player profile is resolved here. The `event.getPlayer()` provides a `Player` object with UUID and name.

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | Authenticated player (no server yet) |
| `event.getResult()` | `ComponentResult` | Current result |
| `event.setResult(ComponentResult)` | void | Allow or deny with message |
| `ComponentResult.allowed()` | static factory | Allow login |
| `ComponentResult.denied(Component)` | static factory | Kick with message |

```java
import com.velocitypowered.api.event.ResultedEvent;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.LoginEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

@Subscribe
public void onLogin(LoginEvent event) {
    // Check UUID-based ban
    if (banList.isBanned(event.getPlayer().getUniqueId())) {
        String reason = banList.getReason(event.getPlayer().getUniqueId());
        event.setResult(ResultedEvent.ComponentResult.denied(
            Component.text("You are banned: " + reason).color(NamedTextColor.RED)
        ));
    }
}
```

---

## PostLoginEvent

**Package**: `com.velocitypowered.api.event.connection.PostLoginEvent`
**Fires**: After player is fully added to the proxy's player list
**Cancellable**: No

The player is now reachable via `proxyServer.getPlayer(uuid)`. Use this for joining network-wide data initialization.

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.proxy.Player;

@Subscribe
public void onPostLogin(PostLoginEvent event) {
    Player player = event.getPlayer();

    // Load player data asynchronously — safe, already on async event thread
    dataManager.loadAsync(player.getUniqueId()).thenAccept(data -> {
        if (data == null) {
            dataManager.createNewPlayer(player.getUniqueId(), player.getUsername());
        }
    });
}
```

---

## PlayerChooseInitialServerEvent

**Package**: `com.velocitypowered.api.event.player.PlayerChooseInitialServerEvent`
**Fires**: After PostLoginEvent, to determine which backend to connect the player to
**Cancellable**: Not via cancel; set result to configure

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.player.PlayerChooseInitialServerEvent;
import com.velocitypowered.api.proxy.server.RegisteredServer;

@Subscribe
public void onChooseInitialServer(PlayerChooseInitialServerEvent event) {
    // Route to least-populated lobby
    RegisteredServer target = findLeastPopulatedLobby();
    if (target != null) {
        event.setInitialServer(target);
    }
    // If no server is set, Velocity uses the first fallback server from velocity.toml
}

private RegisteredServer findLeastPopulatedLobby() {
    return server.getAllServers().stream()
        .filter(s -> s.getServerInfo().getName().startsWith("lobby"))
        .min(java.util.Comparator.comparingInt(s -> s.getPlayersConnected().size()))
        .orElse(null);
}
```

---

## DisconnectEvent

**Package**: `com.velocitypowered.api.event.connection.DisconnectEvent`
**Fires**: When player disconnects from the proxy (any reason)
**Cancellable**: No

### Key Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `event.getPlayer()` | `Player` | The disconnected player |
| `event.getLoginStatus()` | `DisconnectEvent.LoginStatus` | Reason category |

### LoginStatus Values

| Value | Meaning |
|-------|---------|
| `SUCCESSFUL_LOGIN` | Player fully logged in, then disconnected normally |
| `CONFLICTING_LOGIN` | Another player with same username connected |
| `PRE_SERVER_JOIN` | Disconnected before connecting to any backend |

```java
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.DisconnectEvent;

@Subscribe
public void onDisconnect(DisconnectEvent event) {
    if (event.getLoginStatus() != DisconnectEvent.LoginStatus.SUCCESSFUL_LOGIN) {
        return;   // Player never fully connected — skip cleanup
    }

    // Save player data asynchronously
    dataManager.saveAsync(
        event.getPlayer().getUniqueId(),
        dataManager.get(event.getPlayer().getUniqueId())
    );

    // Remove from in-memory cache
    dataManager.remove(event.getPlayer().getUniqueId());
}
```

---

## Common Pitfalls

- **Doing heavy work in `LoginEvent` synchronously**: `LoginEvent` fires on an async thread, but blocking it delays the player login. For database lookups, start an async fetch in `PostLoginEvent` instead — the player will be connected while data loads in the background.

- **Modifying ban list in PreLoginEvent**: You can check bans but should not write to storage inside the event handler without `CompletableFuture` — write operations should be async.

- **Using `PlayerChooseInitialServerEvent` to redirect mid-session**: This event only fires on initial connection. For redirecting already-connected players, use `Player#createConnectionRequest(RegisteredServer).connect()`.

## Related Skills

- [proxy-events.md](proxy-events.md) — ServerConnectedEvent, ServerPreConnectEvent
- [SKILL.md](SKILL.md) — Events overview
- [../OVERVIEW.md](../OVERVIEW.md) — Velocity platform setup
