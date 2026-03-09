# Velocity Commands — SimpleCommand, RawCommand, BrigadierCommand

Full reference for all three Velocity command interfaces with complete examples.

---

## 1. SimpleCommand

Best for most proxy commands. Provides `String[]` arguments (split by space).

```java
package com.yourorg.proxyplugin.commands;

import com.velocitypowered.api.command.SimpleCommand;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class SendCommand implements SimpleCommand {

    private final ProxyServer server;

    public SendCommand(ProxyServer server) {
        this.server = server;
    }

    // /send <player> <server>
    @Override
    public void execute(Invocation invocation) {
        String[] args = invocation.arguments();

        if (args.length < 2) {
            invocation.source().sendMessage(
                Component.text("Usage: /send <player> <server>").color(NamedTextColor.RED)
            );
            return;
        }

        String targetName = args[0];
        String serverName = args[1];

        var optPlayer = server.getPlayer(targetName);
        var optServer = server.getServer(serverName);

        if (optPlayer.isEmpty()) {
            invocation.source().sendMessage(
                Component.text("Player not found: " + targetName).color(NamedTextColor.RED)
            );
            return;
        }

        if (optServer.isEmpty()) {
            invocation.source().sendMessage(
                Component.text("Server not found: " + serverName).color(NamedTextColor.RED)
            );
            return;
        }

        Player target = optPlayer.get();
        RegisteredServer dest = optServer.get();

        target.createConnectionRequest(dest)
            .connect()
            .thenAccept(result -> {
                if (result.isSuccessful()) {
                    invocation.source().sendMessage(
                        Component.text("Sent " + target.getUsername() + " to " + serverName)
                            .color(NamedTextColor.GREEN)
                    );
                } else {
                    invocation.source().sendMessage(
                        Component.text("Failed to send player: " +
                            result.getReasonComponent()
                                .map(c -> net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer
                                    .plainText().serialize(c))
                                .orElse("unknown"))
                            .color(NamedTextColor.RED)
                    );
                }
            });
    }

    @Override
    public boolean hasPermission(Invocation invocation) {
        return invocation.source().hasPermission("network.admin.send");
    }

    // Async tab completion
    @Override
    public CompletableFuture<List<String>> suggestAsync(Invocation invocation) {
        String[] args = invocation.arguments();

        if (args.length == 0 || args.length == 1) {
            // Suggest online player names
            String partial = args.length == 1 ? args[0].toLowerCase() : "";
            List<String> players = server.getAllPlayers().stream()
                .map(Player::getUsername)
                .filter(name -> name.toLowerCase().startsWith(partial))
                .sorted()
                .collect(Collectors.toList());
            return CompletableFuture.completedFuture(players);
        }

        if (args.length == 2) {
            // Suggest server names
            String partial = args[1].toLowerCase();
            List<String> servers = server.getAllServers().stream()
                .map(s -> s.getServerInfo().getName())
                .filter(name -> name.toLowerCase().startsWith(partial))
                .sorted()
                .collect(Collectors.toList());
            return CompletableFuture.completedFuture(servers);
        }

        return CompletableFuture.completedFuture(List.of());
    }
}
```

**Register:**
```java
var meta = server.getCommandManager()
    .metaBuilder("send")
    .plugin(pluginInstance)
    .build();
server.getCommandManager().register(meta, new SendCommand(server));
```

---

## 2. RawCommand

Use when you need the full unparsed argument string (e.g., for commands that accept free-form text like `/broadcast`).

```java
package com.yourorg.proxyplugin.commands;

import com.velocitypowered.api.command.RawCommand;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.minimessage.MiniMessage;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public class BroadcastCommand implements RawCommand {

    private final ProxyServer server;

    public BroadcastCommand(ProxyServer server) {
        this.server = server;
    }

    // /broadcast <MiniMessage-formatted message>
    @Override
    public void execute(Invocation invocation) {
        String rawArgs = invocation.arguments();   // Full string after command name

        if (rawArgs.isBlank()) {
            invocation.source().sendMessage(
                Component.text("Usage: /broadcast <message>").color(NamedTextColor.RED)
            );
            return;
        }

        // Parse MiniMessage format
        Component message = MiniMessage.miniMessage().deserialize(
            "<gold>[Network]</gold> " + rawArgs
        );

        server.getAllPlayers().forEach(p -> p.sendMessage(message));
        invocation.source().sendMessage(
            Component.text("Broadcast sent to " + server.getAllPlayers().size() + " players.")
                .color(NamedTextColor.GREEN)
        );
    }

    @Override
    public boolean hasPermission(Invocation invocation) {
        return invocation.source().hasPermission("network.broadcast");
    }

    @Override
    public CompletableFuture<List<String>> suggestAsync(Invocation invocation) {
        return CompletableFuture.completedFuture(List.of());
    }
}
```

---

## 3. BrigadierCommand

Use when you need typed arguments with native client-side validation and rich completion UI.

```java
package com.yourorg.proxyplugin.commands;

import com.mojang.brigadier.Command;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.builder.LiteralArgumentBuilder;
import com.mojang.brigadier.tree.LiteralCommandNode;
import com.velocitypowered.api.command.BrigadierCommand;
import com.velocitypowered.api.command.CommandSource;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

public class SlowModeCommand {

    public static BrigadierCommand create(ProxyServer server) {
        LiteralCommandNode<CommandSource> node = BrigadierCommand
            .literalArgumentBuilder("slowmode")
            .requires(source -> source.hasPermission("network.admin.slowmode"))
            .executes(ctx -> {
                ctx.getSource().sendMessage(
                    Component.text("Usage: /slowmode <seconds>").color(NamedTextColor.RED)
                );
                return Command.SINGLE_SUCCESS;
            })
            .then(BrigadierCommand
                .requiredArgumentBuilder("seconds", IntegerArgumentType.integer(0, 300))
                .executes(ctx -> {
                    int seconds = IntegerArgumentType.getInteger(ctx, "seconds");
                    ctx.getSource().sendMessage(
                        Component.text("Slow mode set to " + seconds + "s")
                            .color(NamedTextColor.GREEN)
                    );
                    return Command.SINGLE_SUCCESS;
                }))
            .build();

        return new BrigadierCommand(node);
    }
}
```

**Register:**
```java
var meta = server.getCommandManager()
    .metaBuilder("slowmode")
    .plugin(pluginInstance)
    .build();
server.getCommandManager().register(meta, SlowModeCommand.create(server));
```

---

## Connecting a Player to Another Server

Used inside command `execute()` when you need to switch a player's server:

```java
// Async connect — result comes back in a CompletableFuture
player.createConnectionRequest(targetServer)
    .connect()
    .thenAccept(result -> {
        if (result.isSuccessful()) {
            source.sendMessage(Component.text("Connected!").color(NamedTextColor.GREEN));
        } else {
            source.sendMessage(Component.text("Connection failed.").color(NamedTextColor.RED));
        }
    });

// Fire-and-forget (no result handling)
player.createConnectionRequest(targetServer).fireAndForget();
```

---

## Choosing the Right Interface

| Interface | Use When |
|-----------|---------|
| `SimpleCommand` | Standard commands with space-separated args, need tab completion |
| `RawCommand` | Free-form text input (chat, broadcast) |
| `BrigadierCommand` | Typed arguments, complex trees, client-side validation |

---

## Common Pitfalls

- **Blocking in `execute()`**: The command thread is shared. Use `CompletableFuture.supplyAsync()` for IO-heavy operations and schedule results back to send responses.

- **Missing `.plugin(this)` in `metaBuilder`**: Without it, the command persists after plugin unload and causes orphaned commands.

- **`suggestAsync()` not filtering by partial input**: Always filter by `args[last].toLowerCase()` startsWith to provide relevant suggestions.

## Related Skills

- [SKILL.md](SKILL.md) — Commands overview
- [../events/SKILL.md](../events/SKILL.md) — Velocity events
