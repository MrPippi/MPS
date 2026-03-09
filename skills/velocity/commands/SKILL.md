# Commands Skill — Velocity

## Purpose
Reference this skill when registering proxy-level commands on Velocity. Velocity provides `SimpleCommand`, `RawCommand`, and `BrigadierCommand` interfaces — each suited to different use cases.

## When to Use This Skill
- Adding `/proxy-command` that players can run on the proxy directly
- Creating admin commands that work regardless of which backend server the player is on
- Implementing commands with tab completion at the proxy level

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `CommandManager#register(CommandMeta, Command)` | Register a command | Get manager via `server.getCommandManager()` |
| `CommandManager#metaBuilder(String)` | Build command metadata | Set aliases and plugin reference |
| `SimpleCommand` | Simple string-args command interface | Easiest to implement |
| `RawCommand` | Gets the full raw argument string | For commands needing custom parsing |
| `BrigadierCommand` | Native Brigadier tree | Full argument types and client-side validation |
| `SimpleCommand.Invocation` | Wraps `CommandSource` + `String[] args` | |
| `CommandSource` | The executor (`Player` or `ConsoleCommandSource`) | |
| `CommandManager#hasCommand(String)` | Check if a command is registered | |

## Code Pattern

```java
package com.yourorg.proxyplugin.commands;

import com.velocitypowered.api.command.CommandMeta;
import com.velocitypowered.api.command.SimpleCommand;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

import java.util.List;
import java.util.concurrent.CompletableFuture;

// SimpleCommand: the most common command type
public class HubCommand implements SimpleCommand {

    private final ProxyServer server;

    public HubCommand(ProxyServer server) {
        this.server = server;
    }

    @Override
    public void execute(Invocation invocation) {
        if (!(invocation.source() instanceof Player player)) {
            invocation.source().sendMessage(
                Component.text("This command is only for players.").color(NamedTextColor.RED)
            );
            return;
        }

        server.getServer("lobby").ifPresentOrElse(
            lobby -> player.createConnectionRequest(lobby).fireAndForget(),
            () -> player.sendMessage(
                Component.text("Lobby is offline.").color(NamedTextColor.RED)
            )
        );
    }

    @Override
    public boolean hasPermission(Invocation invocation) {
        return invocation.source().hasPermission("network.hub");
    }

    @Override
    public CompletableFuture<List<String>> suggestAsync(Invocation invocation) {
        // No tab completion needed for /hub
        return CompletableFuture.completedFuture(List.of());
    }
}
```

**Register in main class:**
```java
CommandMeta meta = server.getCommandManager()
    .metaBuilder("hub")
    .aliases("lobby", "l")
    .plugin(this)
    .build();

server.getCommandManager().register(meta, new HubCommand(server));
```

## Common Pitfalls

- **Not checking if source is `Player` before casting**: Console can execute commands. Always instanceof check before casting `invocation.source()` to `Player`.

- **Blocking in `execute()`**: `execute()` runs on Velocity's command thread. Synchronous database calls will block command processing for all players. Use `CompletableFuture.supplyAsync()` and schedule UI updates properly.

- **Registering without a plugin reference**: Always call `.plugin(this)` on the `CommandMeta` builder. Without it, the command won't be cleaned up on plugin unload.

## Version Notes

- **Velocity 3.3**: `SimpleCommand`, `RawCommand`, `BrigadierCommand` all stable.
- `hasPermission(Invocation)` is checked before `execute()` and before tab completion. Returning `false` hides the command from the player.

## Related Skills

- [velocity-commands.md](velocity-commands.md) — SimpleCommand, RawCommand, BrigadierCommand deep dive
- [../events/SKILL.md](../events/SKILL.md) — Velocity event system
- [../OVERVIEW.md](../OVERVIEW.md) — Velocity platform setup
