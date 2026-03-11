# Commands Skill — Paper

## Purpose
Reference this skill when registering commands on a Paper 1.21 server. Paper uses native Brigadier via `LifecycleEvents.COMMANDS`; this skill explains when and how to use it versus the legacy `CommandExecutor` approach.

## When to Use This Skill
- Creating any `/command` that players or operators can run
- Adding tab completion to commands
- Restricting commands to players with specific permissions
- Supporting subcommands with typed arguments (integers, players, locations, etc.)

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `LifecycleEvents.COMMANDS` | The lifecycle event type for command registration | Use with `getLifecycleManager().registerEventHandler()` |
| `Commands` (registrar) | The Brigadier command registrar provided by Paper | Obtained from the lifecycle event |
| `Commands#register(LiteralCommandNode, String)` | Register a root command node with description | Description appears in `/help` |
| `Commands.literal(String)` | Start building a command literal node | From `com.mojang.brigadier.builder.LiteralArgumentBuilder` via Paper wrapper |
| `Commands.argument(String, ArgumentType<T>)` | Add a typed argument | From Brigadier's argument builder |
| `ArgumentTypes` | Paper's built-in argument types | `ArgumentTypes.player()`, `ArgumentTypes.world()`, etc. |
| `StringArgumentType.word()` | Single-word string argument | From `com.mojang.brigadier.arguments` |
| `IntegerArgumentType.integer(min, max)` | Bounded integer argument | |
| `CommandSourceStack` | The command source (wraps `CommandSender`) | Access via `ctx.getSource()` |
| `ctx.getSource().getSender()` | Get the underlying `CommandSender` | Cast to `Player` if needed |
| `Command.SINGLE_SUCCESS` | Return value indicating success | Return `1` from `executes` lambda |
| `.requires(source -> ...)` | Permission predicate for the command | Check `source.getSender().hasPermission(...)` |

## Code Pattern

```java
package com.yourorg.myplugin.commands;

import com.mojang.brigadier.Command;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import io.papermc.paper.command.brigadier.Commands;
import io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public class CommandRegistrar {

    public static void register(JavaPlugin plugin) {
        plugin.getLifecycleManager().registerEventHandler(
            LifecycleEvents.COMMANDS,
            event -> {
                Commands commands = event.registrar();

                // Simple command: /myplugin
                commands.register(
                    Commands.literal("myplugin")
                        .requires(source -> source.getSender().hasPermission("myplugin.use"))
                        .executes(ctx -> executeRoot(ctx))
                        // Subcommand: /myplugin info <playerName>
                        .then(Commands.literal("info")
                            .then(Commands.argument("player", StringArgumentType.word())
                                .executes(ctx -> executeInfo(ctx))))
                        // Subcommand: /myplugin level <number>
                        .then(Commands.literal("level")
                            .requires(source -> source.getSender().hasPermission("myplugin.admin"))
                            .then(Commands.argument("amount", IntegerArgumentType.integer(1, 100))
                                .executes(ctx -> executeLevel(ctx))))
                        .build(),
                    "MyPlugin main command"
                );
            }
        );
    }

    private static int executeRoot(CommandContext<CommandSourceStack> ctx) {
        CommandSender sender = ctx.getSource().getSender();
        sender.sendMessage(Component.text("MyPlugin v1.0.0").color(NamedTextColor.GOLD));
        return Command.SINGLE_SUCCESS;
    }

    private static int executeInfo(CommandContext<CommandSourceStack> ctx) {
        CommandSender sender = ctx.getSource().getSender();
        String targetName = StringArgumentType.getString(ctx, "player");

        Player target = sender.getServer().getPlayer(targetName);
        if (target == null) {
            sender.sendMessage(Component.text("Player not found: " + targetName)
                .color(NamedTextColor.RED));
            return 0;   // return 0 to signal failure
        }

        sender.sendMessage(Component.text("Player: " + target.getName())
            .color(NamedTextColor.AQUA));
        return Command.SINGLE_SUCCESS;
    }

    private static int executeLevel(CommandContext<CommandSourceStack> ctx) {
        CommandSender sender = ctx.getSource().getSender();

        // Only allow players (not console) for level command
        if (!(sender instanceof Player player)) {
            sender.sendMessage(Component.text("Only players can use this command.")
                .color(NamedTextColor.RED));
            return 0;
        }

        int amount = IntegerArgumentType.getInteger(ctx, "amount");
        player.setLevel(player.getLevel() + amount);
        player.sendMessage(Component.text("Level set to " + player.getLevel())
            .color(NamedTextColor.GREEN));
        return Command.SINGLE_SUCCESS;
    }
}
```

**Call from main class `onEnable`:**
```java
CommandRegistrar.register(this);
```

## Common Pitfalls

- **Mixing Brigadier with `plugin.yml` command declarations**: Brigadier commands registered via `LifecycleEvents.COMMANDS` do NOT need to be declared in `plugin.yml`. Declaring them there AND in Brigadier causes duplicate registration in some builds.

- **Returning `0` without a message**: When a command fails, always send an error message before returning `0`. Silent failures confuse players.

- **Using `CommandSender` as `Player` without checking**: Console can run commands too. Always `instanceof` check before casting: `if (sender instanceof Player player) { ... }`.

- **Registering commands outside `LifecycleEvents.COMMANDS`**: Calling `Commands.register()` directly in `onEnable()` (not inside the lifecycle handler) is not supported and will throw an error.

- **Forgetting `.requires()` for admin commands**: Without a permission check, any player can run admin subcommands.

## Version Notes

- **1.21**: `LifecycleEvents.COMMANDS` is the supported way to register Brigadier commands. Legacy `CommandExecutor` still works but does not support typed arguments or native client-side suggestions.
- **1.21.1**: No breaking changes to command API.
- **Both**: Tab completion for Brigadier arguments is automatic — clients see valid options natively without any `SuggestionProvider` for built-in types. See [command-completion.md](command-completion.md) for custom suggestions.

## Related Skills

- [brigadier-commands.md](brigadier-commands.md) — Deep dive into argument types and Brigadier tree building
- [command-completion.md](command-completion.md) — Custom tab completion with SuggestionProvider
- [../events/SKILL.md](../events/SKILL.md) — Event system (for command-triggered events)
