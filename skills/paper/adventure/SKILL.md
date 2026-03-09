# Adventure Components Skill — Paper

## Purpose
Reference this skill when building rich text messages, titles, action bars, or interactive hover/click text in Paper 1.21. Paper natively uses the [Adventure](https://docs.advntr.xyz/) library — never use legacy `ChatColor` in new code.

## When to Use This Skill
- Sending formatted messages with colours, bold, or strikethrough
- Parsing MiniMessage format from config files (e.g., `"<gold>Hello <player>!"`)
- Adding hover tooltips or click actions to text
- Sending title screens, subtitles, or action bar messages

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Component.text(String)` | Literal text component | |
| `Component.translatable(String)` | Translation key component | Supports client locale |
| `Component.keybind(String)` | Localised keybind display | e.g., `"key.jump"` |
| `Component.empty()` | Empty component (blank line in lore) | |
| `.color(TextColor)` | Set colour | `NamedTextColor.*` or `TextColor.fromHexString("#RRGGBB")` |
| `.decoration(TextDecoration, boolean)` | Bold, italic, underline, etc. | `false` to explicitly disable |
| `.append(Component)` | Chain components | |
| `.hoverEvent(HoverEvent)` | Tooltip on hover | `HoverEvent.showText(Component)` |
| `.clickEvent(ClickEvent)` | Action on click | `ClickEvent.runCommand(String)` |
| `MiniMessage.miniMessage()` | MiniMessage parser singleton | |
| `MiniMessage#deserialize(String)` | Parse `<tag>text</tag>` format | |
| `MiniMessage#deserialize(String, TagResolver...)` | Parse with placeholders | `Placeholder.unparsed("name", value)` |
| `PlainTextComponentSerializer` | Strip formatting to plain string | `.plainText().serialize(component)` |
| `Player#sendMessage(Component)` | Send chat message | |
| `Player#showTitle(Title)` | Show title/subtitle screen | `Title.title(main, sub, times)` |
| `Player#sendActionBar(Component)` | Show action bar text | Above hotbar |

## Code Pattern

```java
package com.yourorg.myplugin.messages;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;
import net.kyori.adventure.text.event.HoverEvent;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextColor;
import net.kyori.adventure.text.format.TextDecoration;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import net.kyori.adventure.title.Title;
import org.bukkit.entity.Player;

import java.time.Duration;

public class MessageService {

    private static final MiniMessage MM = MiniMessage.miniMessage();

    // --- Basic component ---
    public void sendWelcome(Player player) {
        Component msg = Component.text("Welcome, ")
            .color(NamedTextColor.GOLD)
            .append(Component.text(player.getName())
                .color(NamedTextColor.YELLOW)
                .decoration(TextDecoration.BOLD, true))
            .append(Component.text("!").color(NamedTextColor.GOLD));

        player.sendMessage(msg);
    }

    // --- MiniMessage with placeholder ---
    public void sendFromConfig(Player player, String configValue, String balance) {
        // configValue example: "<green>Your balance: <gold><amount> coins</gold></green>"
        Component parsed = MM.deserialize(configValue,
            Placeholder.unparsed("amount", balance),
            Placeholder.unparsed("player", player.getName())
        );
        player.sendMessage(parsed);
    }

    // --- Hover + click events ---
    public void sendClickable(Player player) {
        Component link = Component.text("[Visit Website]")
            .color(NamedTextColor.AQUA)
            .decoration(TextDecoration.UNDERLINED, true)
            .hoverEvent(HoverEvent.showText(
                Component.text("Click to open our website!").color(NamedTextColor.GRAY)
            ))
            .clickEvent(ClickEvent.openUrl("https://example.com"));

        player.sendMessage(link);
    }

    // --- Hex colour ---
    public void sendHexColor(Player player) {
        Component msg = Component.text("Custom Hex Colour!")
            .color(TextColor.fromHexString("#FF6B6B"));
        player.sendMessage(msg);
    }

    // --- Title + subtitle ---
    public void showTitle(Player player, String mainText, String subText) {
        Title title = Title.title(
            Component.text(mainText).color(NamedTextColor.GOLD),
            Component.text(subText).color(NamedTextColor.GRAY),
            Title.Times.times(
                Duration.ofMillis(500),    // fade in
                Duration.ofSeconds(3),     // stay
                Duration.ofMillis(500)     // fade out
            )
        );
        player.showTitle(title);
    }

    // --- Action bar (above hotbar) ---
    public void sendActionBar(Player player, int cooldown) {
        player.sendActionBar(
            Component.text("Cooldown: " + cooldown + "s")
                .color(NamedTextColor.RED)
        );
    }

    // --- Plain text extraction ---
    public String toPlainText(Component component) {
        return PlainTextComponentSerializer.plainText().serialize(component);
    }
}
```

## Common Pitfalls

- **Mixing legacy `ChatColor` with Adventure**: Using `"§6Hello"` strings alongside Adventure components causes double-rendering artefacts. In Paper 1.21, commit fully to Adventure components.

- **Not disabling `ITALIC` on item names / lore**: Minecraft applies italic styling to all custom item names and lore. Explicitly set `.decoration(TextDecoration.ITALIC, false)` unless italic is intentional.

- **Using `MiniMessage.miniMessage()` inside hot paths**: `MiniMessage.miniMessage()` is a singleton — call it once and store it. Don't call it on every message send.

- **Storing `Component` objects in `config.yml`**: Components are not serialisable to YAML. Store MiniMessage format strings in config and parse them at display time.

- **`HoverEvent.showText()` with unsupported actions in older clients**: `SHOW_TEXT`, `SHOW_ITEM`, `SHOW_ENTITY` are all supported in 1.21 clients.

## Version Notes

- **1.21 / 1.21.1**: Adventure is fully native in Paper — no extra adapter dependency needed.
- `Title.Times` uses `java.time.Duration` (not tick counts).

## Related Skills

- [components.md](components.md) — Full MiniMessage tag reference, translatable components, keybinds
- [../items/item-meta.md](../items/item-meta.md) — Components in item display names and lore
- [../inventory/SKILL.md](../inventory/SKILL.md) — Components as inventory titles
