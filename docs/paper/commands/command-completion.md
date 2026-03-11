# Command Tab Completion — Paper

How to provide custom tab-completion suggestions for Brigadier commands in Paper 1.21.

---

## How Brigadier Completion Works

With Paper's native Brigadier system, argument types provide completion automatically:
- `StringArgumentType.word()` → no suggestions by default
- `ArgumentTypes.player()` → online player names (built-in)
- `ArgumentTypes.world()` → loaded world names (built-in)
- `IntegerArgumentType.integer(min, max)` → shows type hint, no value list

For custom suggestion lists, attach a `.suggests(SuggestionProvider)` to any argument node.

---

## SuggestionProvider API

```java
import com.mojang.brigadier.suggestion.SuggestionProvider;
import com.mojang.brigadier.suggestion.Suggestions;
import com.mojang.brigadier.suggestion.SuggestionsBuilder;
import io.papermc.paper.command.brigadier.CommandSourceStack;

import java.util.List;
import java.util.concurrent.CompletableFuture;
```

### Inline Static List

```java
Commands.argument("color", StringArgumentType.word())
    .suggests((ctx, builder) -> {
        List.of("red", "green", "blue", "yellow").forEach(builder::suggest);
        return builder.buildFuture();
    })
    .executes(ctx -> { ... })
```

### Async Suggestions (Database / Computed)

If generating suggestions requires IO (e.g., querying a database), return a `CompletableFuture` so you don't block the network thread:

```java
Commands.argument("home", StringArgumentType.word())
    .suggests((ctx, builder) -> CompletableFuture.supplyAsync(() -> {
        String playerName = ctx.getSource().getSender() instanceof Player p
            ? p.getName() : "";

        // Fetch home names from database asynchronously
        List<String> homes = homeDatabase.getHomes(playerName);

        // Filter by what the player has typed so far
        String remaining = builder.getRemaining().toLowerCase();
        homes.stream()
            .filter(name -> name.toLowerCase().startsWith(remaining))
            .forEach(builder::suggest);

        return builder.build();
    }))
    .executes(ctx -> { ... })
```

---

## Full Example: Multi-Argument Completion

```java
package com.yourorg.myplugin.commands;

import com.mojang.brigadier.Command;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import io.papermc.paper.command.brigadier.Commands;
import io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public class HomeCommands {

    private static final List<String> VALID_BIOMES = List.of(
        "plains", "desert", "forest", "mountains", "ocean", "swamp", "taiga"
    );

    public static void register(JavaPlugin plugin) {
        plugin.getLifecycleManager().registerEventHandler(
            LifecycleEvents.COMMANDS,
            event -> {
                Commands cmds = event.registrar();

                cmds.register(
                    Commands.literal("home")
                        // /home set <name>
                        .then(Commands.literal("set")
                            .then(Commands.argument("name", StringArgumentType.word())
                                .executes(ctx -> setHome(ctx))))
                        // /home go <name>  — suggestions from saved homes
                        .then(Commands.literal("go")
                            .then(Commands.argument("name", StringArgumentType.word())
                                .suggests(HomeCommands::suggestHomes)
                                .executes(ctx -> goHome(ctx))))
                        // /home biome <biome>  — static list suggestions
                        .then(Commands.literal("biome")
                            .then(Commands.argument("biome", StringArgumentType.word())
                                .suggests((ctx, builder) -> {
                                    String typed = builder.getRemaining().toLowerCase();
                                    VALID_BIOMES.stream()
                                        .filter(b -> b.startsWith(typed))
                                        .forEach(builder::suggest);
                                    return builder.buildFuture();
                                })
                                .executes(ctx -> {
                                    String biome = StringArgumentType.getString(ctx, "biome");
                                    ctx.getSource().getSender().sendMessage(
                                        Component.text("Biome: " + biome)
                                    );
                                    return Command.SINGLE_SUCCESS;
                                })))
                        .build(),
                    "Home management command"
                );
            }
        );
    }

    // SuggestionProvider as a method reference
    private static CompletableFuture<com.mojang.brigadier.suggestion.Suggestions> suggestHomes(
        CommandContext<CommandSourceStack> ctx,
        com.mojang.brigadier.suggestion.SuggestionsBuilder builder
    ) {
        if (!(ctx.getSource().getSender() instanceof Player player)) {
            return builder.buildFuture();
        }

        return CompletableFuture.supplyAsync(() -> {
            // In real code: fetch from database/PDC
            List<String> homes = List.of("spawn", "base", "farm", "nether-hub");

            String typed = builder.getRemaining().toLowerCase();
            homes.stream()
                .filter(h -> h.toLowerCase().startsWith(typed))
                .forEach(name -> builder.suggest(name,
                    // Optional tooltip shown next to suggestion
                    net.kyori.adventure.text.Component.text("Teleport to " + name)
                ));

            return builder.build();
        });
    }

    private static int setHome(CommandContext<CommandSourceStack> ctx) {
        if (!(ctx.getSource().getSender() instanceof Player player)) {
            ctx.getSource().getSender().sendMessage(
                Component.text("Only players can set homes.").color(NamedTextColor.RED)
            );
            return 0;
        }
        String name = StringArgumentType.getString(ctx, "name");
        // homeDatabase.save(player.getUniqueId(), name, player.getLocation());
        player.sendMessage(Component.text("Home '" + name + "' set!").color(NamedTextColor.GREEN));
        return Command.SINGLE_SUCCESS;
    }

    private static int goHome(CommandContext<CommandSourceStack> ctx) {
        if (!(ctx.getSource().getSender() instanceof Player player)) {
            return 0;
        }
        String name = StringArgumentType.getString(ctx, "name");
        // Location loc = homeDatabase.get(player.getUniqueId(), name);
        // if (loc != null) player.teleportAsync(loc);
        player.sendMessage(Component.text("Teleporting to " + name).color(NamedTextColor.AQUA));
        return Command.SINGLE_SUCCESS;
    }
}
```

---

## Suggestion with Tooltips

Each `builder.suggest()` call can include an optional `Message` tooltip displayed in the client UI:

```java
builder.suggest("home_name",
    net.kyori.adventure.text.Component.text("Click to teleport")
);
```

---

## Filtering Suggestions by Input

Always filter suggestions by what the player has already typed (`builder.getRemaining()`):

```java
String typed = builder.getRemaining().toLowerCase();
allOptions.stream()
    .filter(opt -> opt.toLowerCase().startsWith(typed))
    .forEach(builder::suggest);
```

Brigadier does some automatic prefix filtering, but explicit filtering avoids showing unrelated suggestions.

---

## Common Pitfalls

- **Blocking the main thread in suggestions**: If suggestion generation is slow (database query), wrap it in `CompletableFuture.supplyAsync(...)` and return the future. Blocking the suggestion callback freezes the server for every keypress.

- **Not filtering by `builder.getRemaining()`**: Without filtering, all suggestions appear even when the player has typed something specific, causing confusion.

- **Suggestions for arguments that already have built-in completion**: Don't add a `SuggestionProvider` to `ArgumentTypes.player()` — it already provides online player names. Adding one may override the built-in list.

## Related Skills

- [brigadier-commands.md](brigadier-commands.md) — Full Brigadier command tree
- [SKILL.md](SKILL.md) — Commands overview
