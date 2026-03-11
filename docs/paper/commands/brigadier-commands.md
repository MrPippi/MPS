# Brigadier Commands — Paper 1.21

Paper 1.21 exposes native Brigadier command registration via `LifecycleEvents.COMMANDS`. This gives commands client-side argument validation, rich tab completion, and `/help` integration without extra code.

---

## Setup

No extra dependencies needed — Brigadier is bundled in Paper.

In `build.gradle`, Paper API already includes the Brigadier classes:
```groovy
dependencies {
    compileOnly("io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT")
    // Brigadier classes are in com.mojang.brigadier (transitive from paper-api)
}
```

---

## Key Imports

```java
import com.mojang.brigadier.Command;
import com.mojang.brigadier.arguments.ArgumentType;
import com.mojang.brigadier.arguments.BoolArgumentType;
import com.mojang.brigadier.arguments.DoubleArgumentType;
import com.mojang.brigadier.arguments.FloatArgumentType;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.LongArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.builder.LiteralArgumentBuilder;
import com.mojang.brigadier.builder.RequiredArgumentBuilder;
import com.mojang.brigadier.context.CommandContext;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import io.papermc.paper.command.brigadier.Commands;
import io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents;
```

---

## Argument Types Reference

### Primitive Types (Brigadier built-in)

| Type | Class | Methods |
|------|-------|---------|
| Single word (no spaces) | `StringArgumentType.word()` | `StringArgumentType.getString(ctx, "name")` |
| Quoted string (with spaces) | `StringArgumentType.string()` | Same |
| Greedy string (rest of input) | `StringArgumentType.greedyString()` | Same |
| Integer | `IntegerArgumentType.integer(min, max)` | `IntegerArgumentType.getInteger(ctx, "name")` |
| Double | `DoubleArgumentType.doubleArg(min, max)` | `DoubleArgumentType.getDouble(ctx, "name")` |
| Float | `FloatArgumentType.floatArg(min, max)` | `FloatArgumentType.getFloat(ctx, "name")` |
| Long | `LongArgumentType.longArg(min, max)` | `LongArgumentType.getLong(ctx, "name")` |
| Boolean | `BoolArgumentType.bool()` | `BoolArgumentType.getBool(ctx, "name")` |

### Paper-Specific Argument Types

Available via `io.papermc.paper.command.brigadier.argument.ArgumentTypes`:

| Type | Method | Returns |
|------|--------|---------|
| Online player | `ArgumentTypes.player()` | `PlayerSelectorArgumentResolver` |
| Player profile | `ArgumentTypes.playerProfiles()` | `PlayerProfileListResolver` |
| World | `ArgumentTypes.world()` | `World` |
| Named color | `ArgumentTypes.namedColor()` | `NamedTextColor` |
| Component | `ArgumentTypes.component()` | `Component` |
| Key (NamespacedKey) | `ArgumentTypes.key()` | `Key` |

---

## Full Command Tree Example

```java
package com.yourorg.myplugin.commands;

import com.mojang.brigadier.Command;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import io.papermc.paper.command.brigadier.Commands;
import io.papermc.paper.command.brigadier.argument.ArgumentTypes;
import io.papermc.paper.command.brigadier.argument.resolvers.PlayerProfileListResolver;
import io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;

public class AdminCommands {

    public static void register(JavaPlugin plugin) {
        plugin.getLifecycleManager().registerEventHandler(
            LifecycleEvents.COMMANDS,
            event -> {
                Commands cmds = event.registrar();

                cmds.register(
                    Commands.literal("admin")
                        .requires(src -> src.getSender().hasPermission("myplugin.admin"))
                        // /admin kick <player> [reason]
                        .then(Commands.literal("kick")
                            .then(Commands.argument("target", ArgumentTypes.player())
                                .executes(ctx -> kickPlayer(ctx, "No reason specified"))
                                .then(Commands.argument("reason", StringArgumentType.greedyString())
                                    .executes(ctx -> {
                                        String reason = StringArgumentType.getString(ctx, "reason");
                                        return kickPlayer(ctx, reason);
                                    }))))
                        // /admin setlevel <player> <level>
                        .then(Commands.literal("setlevel")
                            .then(Commands.argument("target", ArgumentTypes.player())
                                .then(Commands.argument("level", IntegerArgumentType.integer(0, 100))
                                    .executes(ctx -> setLevel(ctx)))))
                        // /admin broadcast <message>
                        .then(Commands.literal("broadcast")
                            .then(Commands.argument("message", StringArgumentType.greedyString())
                                .executes(ctx -> broadcast(ctx))))
                        .build(),
                    "Admin utility commands"
                );
            }
        );
    }

    private static int kickPlayer(CommandContext<CommandSourceStack> ctx, String reason) {
        var resolver = ArgumentTypes.getPlayer(ctx, "target");
        CommandSender sender = ctx.getSource().getSender();

        // Resolve the player (online only)
        List<Player> targets;
        try {
            targets = resolver.resolve(ctx.getSource());
        } catch (Exception e) {
            sender.sendMessage(Component.text("Player not found.").color(NamedTextColor.RED));
            return 0;
        }

        for (Player target : targets) {
            target.kick(Component.text("Kicked: " + reason).color(NamedTextColor.RED));
            sender.sendMessage(Component.text("Kicked " + target.getName())
                .color(NamedTextColor.GREEN));
        }
        return Command.SINGLE_SUCCESS;
    }

    private static int setLevel(CommandContext<CommandSourceStack> ctx) {
        CommandSender sender = ctx.getSource().getSender();
        int level = IntegerArgumentType.getInteger(ctx, "level");

        try {
            var targets = ArgumentTypes.getPlayer(ctx, "target").resolve(ctx.getSource());
            for (Player target : targets) {
                target.setLevel(level);
                sender.sendMessage(Component.text(
                    "Set " + target.getName() + "'s level to " + level
                ).color(NamedTextColor.GREEN));
            }
        } catch (Exception e) {
            sender.sendMessage(Component.text("Player not found.").color(NamedTextColor.RED));
            return 0;
        }
        return Command.SINGLE_SUCCESS;
    }

    private static int broadcast(CommandContext<CommandSourceStack> ctx) {
        String message = StringArgumentType.getString(ctx, "message");
        ctx.getSource().getSender().getServer().broadcast(
            Component.text("[Broadcast] ").color(NamedTextColor.GOLD)
                .append(Component.text(message).color(NamedTextColor.WHITE))
        );
        return Command.SINGLE_SUCCESS;
    }
}
```

---

## Permission Predicates

Use `.requires()` at any node to restrict access:

```java
Commands.literal("admin")
    // Entire command requires permission
    .requires(src -> src.getSender().hasPermission("myplugin.admin"))
    .then(Commands.literal("reload")
        // Sub-command requires more specific permission
        .requires(src -> src.getSender().hasPermission("myplugin.admin.reload"))
        .executes(ctx -> { ... }))
```

---

## Returning Values

| Return Value | Meaning |
|-------------|---------|
| `Command.SINGLE_SUCCESS` (= `1`) | Command succeeded |
| `0` | Command failed (show usage hint to player) |
| Negative | Not used in Minecraft |

---

## Common Pitfalls

- **Using `Commands.argument()` with the wrong getter**: If you register `IntegerArgumentType.integer()` but call `StringArgumentType.getString()`, you get a `ClassCastException` at runtime. Always match the argument type to its getter.

- **Registering commands in `onEnable` instead of the lifecycle handler**: Commands MUST be registered inside `LifecycleEvents.COMMANDS` handler. Registering them elsewhere (e.g., directly in `onEnable`) throws an error.

- **Not calling `.build()` on the root node**: `Commands#register()` expects a `LiteralCommandNode`, not a builder. Always call `.build()` at the end of the root literal chain.

- **Resolving `ArgumentTypes.player()` without try-catch**: Player resolution can throw `CommandSyntaxException` if the selector matches no players. Wrap in try-catch.

## Related Skills

- [command-completion.md](command-completion.md) — Custom suggestion providers
- [SKILL.md](SKILL.md) — Commands overview
