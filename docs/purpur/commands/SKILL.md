# Commands Skill — Purpur

## Purpose
Reference this skill when registering commands on a Purpur server. Purpur inherits the full Paper Brigadier command system — there are no Purpur-specific command APIs. This skill documents any minor differences and cross-links to Paper.

## When to Use This Skill
- Setting up commands on a Purpur-targeted plugin
- Checking whether Purpur adds any command-related APIs beyond Paper

## API Quick Reference

Purpur adds no new command APIs. Use the Paper Brigadier system:

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `LifecycleEvents.COMMANDS` | Lifecycle event for command registration | Same as Paper |
| `Commands` (registrar) | Brigadier command registrar | Same as Paper |
| `io.papermc.paper.command.brigadier.*` | All Brigadier classes | Identical on Purpur |

## Code Pattern

Purpur command registration is identical to Paper. See [../../paper/commands/brigadier-commands.md](../../paper/commands/brigadier-commands.md) for the complete pattern.

```java
// Purpur command registration — identical to Paper
import io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents;
import io.papermc.paper.command.brigadier.Commands;
import com.mojang.brigadier.Command;

@Override
public void onEnable() {
    this.getLifecycleManager().registerEventHandler(
        LifecycleEvents.COMMANDS,
        event -> {
            Commands cmds = event.registrar();
            cmds.register(
                Commands.literal("mypurpurcommand")
                    .requires(src -> src.getSender().hasPermission("myplugin.command"))
                    .executes(ctx -> {
                        ctx.getSource().getSender().sendMessage(
                            net.kyori.adventure.text.Component.text("Hello from Purpur!")
                        );
                        return Command.SINGLE_SUCCESS;
                    })
                    .build(),
                "A Purpur plugin command"
            );
        }
    );
}
```

## Common Pitfalls

- **No Purpur-specific command classes**: Do not search for `org.purpurmc.purpur.command.*` — it does not exist. Use `io.papermc.paper.command.brigadier.*` exclusively.

- **Testing on Paper then deploying on Purpur**: Since Purpur extends Paper, commands work identically. No additional testing specifically for Purpur command registration is required.

## Version Notes

- **Purpur 1.21.1**: Command API is 100% inherited from Paper 1.21.1.
- No `plugin.yml` differences for command declarations vs Paper.

## Related Skills

- [../../paper/commands/SKILL.md](../../paper/commands/SKILL.md) — Full Paper Brigadier commands overview
- [../../paper/commands/brigadier-commands.md](../../paper/commands/brigadier-commands.md) — Brigadier deep dive
- [../../paper/commands/command-completion.md](../../paper/commands/command-completion.md) — Tab completion
- [../OVERVIEW.md](../OVERVIEW.md) — Purpur platform setup
