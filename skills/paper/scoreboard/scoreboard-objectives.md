# Scoreboard Objectives & Teams — Paper

Full reference for objectives, display slots, teams, and tab-list in Paper 1.21.

---

## Criteria Reference

| Criteria Constant | Tracks |
|------------------|--------|
| `Criteria.DUMMY` | Plugin-controlled, set with `score.setScore(int)` |
| `Criteria.HEALTH` | Player's current health (auto-updated) |
| `Criteria.PLAYER_KILLS` | Kill count (auto-updated) |
| `Criteria.TOTAL_KILLS` | All kills (player + mob) |
| `Criteria.DEATHS` | Death count |
| `Criteria.FOOD` | Hunger level |
| `Criteria.XP` | Experience level |

---

## Display Slots

| `DisplaySlot` | Location | Notes |
|--------------|----------|-------|
| `SIDEBAR` | Right-side sidebar | Most common for plugin UIs |
| `BELOW_NAME` | Below player nametag | Visible to all nearby players |
| `PLAYER_LIST` | Tab-list player list | Shows value next to player name |
| `SIDEBAR_TEAM_*` | Team-coloured sidebar | Requires team member |

---

## Multi-Line Sidebar with Dynamic Updates

```java
import org.bukkit.scoreboard.Objective;
import org.bukkit.scoreboard.Score;
import org.bukkit.scoreboard.Scoreboard;

public class DynamicSidebar {

    private final Scoreboard board;
    private final Objective obj;

    // Line registry — maps slot index to its current entry string
    private final String[] lineCache = new String[15];

    public DynamicSidebar(Scoreboard board, Objective obj) {
        this.board = board;
        this.obj = obj;
    }

    // Set a line at a specific slot (1 = bottom, 15 = top)
    public void setLine(int slot, String text) {
        // Remove old entry to prevent duplicate lines
        if (lineCache[slot] != null) {
            board.resetScores(lineCache[slot]);
        }
        lineCache[slot] = text;
        obj.getScore(text).setScore(slot);
    }

    public void clearLine(int slot) {
        if (lineCache[slot] != null) {
            board.resetScores(lineCache[slot]);
            lineCache[slot] = null;
        }
    }
}
```

---

## Teams

Teams group players (or other string entries) and let you control:
- Nametag colour
- Prefix/suffix
- Name visibility (hide nametags through walls)
- Collision rules

```java
import org.bukkit.ChatColor;
import org.bukkit.scoreboard.NameTagVisibility;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.Team;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

Scoreboard board = Bukkit.getScoreboardManager().getMainScoreboard();

// Register or get a team
Team vipTeam = board.getTeam("vip");
if (vipTeam == null) {
    vipTeam = board.registerNewTeam("vip");
}

// Team display settings
vipTeam.color(ChatColor.GOLD);   // Legacy ChatColor for nametag colour
vipTeam.prefix(Component.text("[VIP] ").color(NamedTextColor.GOLD));
vipTeam.suffix(Component.empty());

// Nametag visibility
vipTeam.setOption(Team.Option.NAME_TAG_VISIBILITY, Team.OptionStatus.FOR_OTHER_TEAMS);
// Other values: ALWAYS, NEVER, FOR_OWN_TEAM

// Collision
vipTeam.setOption(Team.Option.COLLISION_RULE, Team.OptionStatus.NEVER);

// Add/remove players
vipTeam.addEntry(player.getName());
vipTeam.removeEntry(player.getName());

// Check membership
boolean isVip = vipTeam.hasEntry(player.getName());
```

---

## Tab-List Header and Footer

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

player.sendPlayerListHeaderAndFooter(
    Component.text("My Network").color(NamedTextColor.GOLD),
    Component.text("play.example.com").color(NamedTextColor.GRAY)
);

// Update periodically with a repeating task:
Bukkit.getScheduler().runTaskTimer(plugin, () ->
    Bukkit.getOnlinePlayers().forEach(p ->
        p.sendPlayerListHeaderAndFooter(
            Component.text("Players: " + Bukkit.getOnlinePlayers().size())
                .color(NamedTextColor.AQUA),
            Component.text("ping: " + p.getPing() + "ms")
                .color(NamedTextColor.GRAY)
        )
    ),
0L, 20L);
```

---

## Health Below Nametag

```java
// Show each player's health below their name (visible to all nearby)
Objective healthObj = board.registerNewObjective(
    "health_display",
    Criteria.HEALTH,
    Component.text("❤").color(NamedTextColor.RED),
    RenderType.HEARTS
);
healthObj.setDisplaySlot(DisplaySlot.BELOW_NAME);
```

---

## Removing Objectives and Teams

```java
// Remove an objective (hides it from display)
Objective obj = board.getObjective("sidebar");
if (obj != null) obj.unregister();

// Remove a team (players leave automatically)
Team team = board.getTeam("vip");
if (team != null) team.unregister();
```

---

## Per-Player vs Shared Scoreboards

| Approach | When | API |
|---------|------|-----|
| Per-player `getNewScoreboard()` | Each player sees different values | `player.setScoreboard(newBoard)` |
| Shared main scoreboard | All players see the same data | `getMainScoreboard()` |

**Recommendation**: Use per-player scoreboards for player-specific stats (kills, coins). Use the main scoreboard only for shared state (e.g., game-wide countdown visible to everyone the same way).

---

## Common Pitfalls

- **Team names over 16 characters**: Team names have a 16-character limit. Use short internal names like `"rank_vip"`.

- **Calling `team.color(ChatColor)` with Adventure colours**: `team.color()` only accepts legacy `ChatColor`. To set nametag colour to a specific colour, use `ChatColor.valueOf("GOLD")` or the constant directly. The Adventure-based `Team#prefix(Component)` works for prefix display but the actual nametag glowing colour uses `ChatColor`.

- **Forgetting `board.resetScores(entry)` before updating**: Changing a line by setting a new `Score` at the same slot number but with a different string text creates two entries (both visible). Always remove the old entry string first.

- **Unregistering teams on plugin disable**: Unregistered teams from the main scoreboard persist across reloads. In `onDisable`, call `team.unregister()` for any teams you registered.
