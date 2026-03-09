# Adventure Components Reference — Paper

Full reference for the Adventure API component system used natively in Paper 1.21.

---

## Component Types

| Factory Method | Produces | Example |
|---------------|---------|---------|
| `Component.text(String)` | Literal text | `"Hello"` |
| `Component.translatable(String)` | Translation key | `"item.minecraft.diamond"` |
| `Component.keybind(String)` | Localised key name | `"key.jump"` → "Space" |
| `Component.score(String, String)` | Scoreboard score | player name + objective |
| `Component.selector(String)` | Entity selector | `"@a"` |
| `Component.empty()` | Zero-length component | Blank line in lore |
| `Component.newline()` | Line break in single component | |

---

## Styling

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextColor;
import net.kyori.adventure.text.format.TextDecoration;
import net.kyori.adventure.text.format.Style;

Component styled = Component.text("Important!")
    // Colour — use NamedTextColor for the 16 standard colours
    .color(NamedTextColor.RED)
    // Hex colour (24-bit)
    // .color(TextColor.fromHexString("#FF4500"))
    // Decorations
    .decoration(TextDecoration.BOLD, true)
    .decoration(TextDecoration.ITALIC, false)      // explicit disable
    .decoration(TextDecoration.UNDERLINED, true)
    .decoration(TextDecoration.STRIKETHROUGH, false)
    .decoration(TextDecoration.OBFUSCATED, false);

// Apply a style object
Style style = Style.style(NamedTextColor.GOLD, TextDecoration.BOLD);
Component withStyle = Component.text("Gold Bold").style(style);
```

### NamedTextColor Constants

`BLACK`, `DARK_BLUE`, `DARK_GREEN`, `DARK_AQUA`, `DARK_RED`, `DARK_PURPLE`,
`GOLD`, `GRAY`, `DARK_GRAY`, `BLUE`, `GREEN`, `AQUA`, `RED`, `LIGHT_PURPLE`,
`YELLOW`, `WHITE`

---

## Appending and Building Chains

```java
Component message = Component.text("[INFO] ")
    .color(NamedTextColor.GRAY)
    .append(Component.text("Server is online.")
        .color(NamedTextColor.GREEN))
    .append(Component.text(" (" + players + " players)")
        .color(NamedTextColor.DARK_GRAY));
```

---

## Hover Events

```java
import net.kyori.adventure.text.event.HoverEvent;
import org.bukkit.Material;
import org.bukkit.inventory.ItemStack;

// Show text tooltip
Component withHover = Component.text("Hover me")
    .hoverEvent(HoverEvent.showText(
        Component.text("This is a tooltip!").color(NamedTextColor.YELLOW)
    ));

// Show item tooltip (shows item card)
ItemStack diamond = new ItemStack(Material.DIAMOND);
Component withItemHover = Component.text("[Diamond]")
    .hoverEvent(HoverEvent.showItem(
        net.kyori.adventure.key.Key.key("minecraft:diamond"),
        1
    ));
```

---

## Click Events

```java
import net.kyori.adventure.text.event.ClickEvent;

// Run a command when clicked
Component runCmd = Component.text("[Warp Hub]")
    .clickEvent(ClickEvent.runCommand("/hub"));

// Suggest text into chat bar (player can edit before sending)
Component suggest = Component.text("[Report]")
    .clickEvent(ClickEvent.suggestCommand("/report "));

// Open a URL
Component url = Component.text("[Website]")
    .clickEvent(ClickEvent.openUrl("https://example.com"));

// Copy to clipboard
Component copy = Component.text("[Copy IP]")
    .clickEvent(ClickEvent.copyToClipboard("play.example.com"));
```

---

## MiniMessage Format

MiniMessage is a human-readable string format for components, ideal for config files.

### Tag Reference

| Tag | Effect | Example |
|-----|--------|---------|
| `<red>` | Named colour | `<red>Error</red>` |
| `<#RRGGBB>` | Hex colour | `<#FF6B6B>Custom</…>` |
| `<bold>` | Bold | `<bold>Title</bold>` |
| `<italic>` | Italic | |
| `<underlined>` | Underline | |
| `<strikethrough>` | Strikethrough | |
| `<obfuscated>` | Obfuscated | |
| `<reset>` | Clear all formatting | |
| `<gradient:color1:color2>` | Gradient | `<gradient:red:blue>Hello</gradient>` |
| `<rainbow>` | Rainbow gradient | `<rainbow>Rainbow!</rainbow>` |
| `<hover:show_text:'…'>` | Hover tooltip | `<hover:show_text:'<red>tip'>text</hover>` |
| `<click:run_command:'/cmd'>` | Click run | `<click:run_command:'/hub'>Go Hub</click>` |
| `<click:suggest_command:'/cmd'>` | Click suggest | |
| `<click:open_url:'https://…'>` | Open URL | |
| `<key:key.jump>` | Keybind | Shows client's jump key |
| `<lang:item.minecraft.diamond>` | Translation key | |
| `<newline>` | Line break | |

### Parsing with Placeholders

```java
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import net.kyori.adventure.text.minimessage.tag.resolver.TagResolver;

MiniMessage mm = MiniMessage.miniMessage();

// Static unparsed placeholder (safe — no MiniMessage injection)
Component msg = mm.deserialize(
    "<gold>Hello, <player>! You have <coins> coins.</gold>",
    Placeholder.unparsed("player", player.getName()),
    Placeholder.unparsed("coins", String.valueOf(coins))
);

// Component placeholder (allows rich formatting in the value)
Component badge = Component.text("[VIP]").color(NamedTextColor.GOLD);
Component withBadge = mm.deserialize(
    "<player_name> <badge>",
    Placeholder.unparsed("player_name", player.getName()),
    Placeholder.component("badge", badge)
);
```

---

## Translatable Components

Translatable components render in the player's client locale.

```java
// Item name in client's language
Component itemName = Component.translatable("item.minecraft.diamond")
    .color(NamedTextColor.AQUA);

// With fallback for unknown keys
Component withFallback = Component.translatable(
    "myplugin.message.welcome",
    Component.text("Welcome!")   // fallback content
);

// Minecraft death messages use translatable components
Component deathMsg = Component.translatable(
    "death.attack.fall",
    Component.text(player.getName())
);
```

---

## Serialisers

```java
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import net.kyori.adventure.text.serializer.legacy.LegacyComponentSerializer;
import net.kyori.adventure.text.serializer.json.JSONComponentSerializer;

// Strip all formatting → plain string
String plain = PlainTextComponentSerializer.plainText().serialize(component);

// Convert to legacy §-code string (for logging / old API compatibility only)
String legacy = LegacyComponentSerializer.legacySection().serialize(component);

// JSON (for storage / cross-server serialisation)
String json = JSONComponentSerializer.json().serialize(component);
Component fromJson = JSONComponentSerializer.json().deserialize(json);
```

---

## Common Pitfalls

- **`Placeholder.unparsed` vs `Placeholder.parsed`**: Use `unparsed` for user-input values (player names, config strings) to prevent MiniMessage injection attacks. Use `parsed` only when the value itself is trusted MiniMessage format.

- **Colour inheritance**: Child components inherit parent colour unless overridden. To reset to white, explicitly set `.color(NamedTextColor.WHITE)`.

- **`Component.text("")` not being truly empty**: Use `Component.empty()` for zero-content components (e.g., blank lore lines). `Component.text("")` has the same visual effect but is semantically different.

- **`Title` times in ticks vs Duration**: `Title.Times.times()` takes `java.time.Duration`, not ticks. Use `Duration.ofMillis(500)` or `Duration.ofSeconds(2)`.
