# Scoreboard Skill — Paper

## Purpose
Reference this skill when displaying scores, sidebars, nametag colours, or tab-list headers using the Paper/Bukkit Scoreboard API in Paper 1.21. Covers objectives, scores, sidebar display, and team management.

## When to Use This Skill
- Showing a per-player sidebar with stats (kills, coins, time remaining)
- Colouring player nametags above their head
- Creating teams that share a colour, prefix, or collision rule
- Displaying tab-list (player-list) header and footer

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Bukkit.getScoreboardManager()` | Get the `ScoreboardManager` | |
| `ScoreboardManager#getNewScoreboard()` | Create a fresh per-player scoreboard | Separate from server main scoreboard |
| `ScoreboardManager#getMainScoreboard()` | Shared server scoreboard | All plugins share; prefer per-player boards |
| `Scoreboard#registerNewObjective(name, criteria, displayName)` | Create an objective | `criteria`: `"dummy"`, `"health"`, etc. |
| `Objective#setDisplaySlot(DisplaySlot)` | Show in sidebar / below name / player list | |
| `Objective#getScore(String)` | Get a `Score` for an entry | `entry` = player name or string |
| `Score#setScore(int)` | Set the numeric score | Triggers sidebar re-render |
| `Scoreboard#registerNewTeam(String)` | Create a team | |
| `Team#addEntry(String)` | Add a player/entry to team | Pass `player.getName()` |
| `Team#setColor(ChatColor)` | Set team nametag colour | Legacy `ChatColor` for team colour |
| `Team#setPrefix(Component)` | Set prefix before player name | Adventure component |
| `Team#setSuffix(Component)` | Set suffix after player name | |
| `Player#setScoreboard(Scoreboard)` | Assign a scoreboard to a player | |
| `Player#sendPlayerListHeaderAndFooter` | Set tab-list header/footer | Adventure components |

## Code Pattern

```java
package com.yourorg.myplugin.scoreboard;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.scoreboard.Criteria;
import org.bukkit.scoreboard.DisplaySlot;
import org.bukkit.scoreboard.Objective;
import org.bukkit.scoreboard.RenderType;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.ScoreboardManager;
import org.bukkit.scoreboard.Team;

public class PlayerScoreboard {

    private final Scoreboard board;
    private final Objective sidebar;
    private final Player player;

    public PlayerScoreboard(Player player) {
        this.player = player;
        ScoreboardManager mgr = Bukkit.getScoreboardManager();

        // Each player gets their own scoreboard so scores don't bleed across players
        this.board = mgr.getNewScoreboard();

        // Register a "dummy" sidebar objective (plugin-controlled scores)
        this.sidebar = board.registerNewObjective(
            "sidebar",                                           // internal name
            Criteria.DUMMY,                                      // dummy = manually set
            Component.text("★ My Server").color(NamedTextColor.GOLD)
                .decoration(TextDecoration.BOLD, true),
            RenderType.INTEGER                                   // show as number
        );
        sidebar.setDisplaySlot(DisplaySlot.SIDEBAR);

        player.setScoreboard(board);
        setupLines();
    }

    // Team-based approach: entry key is fixed; dynamic value lives in team prefix.
    // This avoids ghost lines because the scoreboard entry string never changes.
    private void registerLine(String entryKey, int slot) {
        sidebar.getScore(entryKey).setScore(slot);
        if (board.getTeam(entryKey) == null) {
            Team team = board.registerNewTeam(entryKey);
            team.addEntry(entryKey);
        }
    }

    private void setLinePrefix(String entryKey, String prefix) {
        Team team = board.getTeam(entryKey);
        if (team != null) {
            team.setPrefix(prefix);
        }
    }

    public void setupLines() {
        // Register fixed entry keys once; score = sort order (higher = top)
        sidebar.getScore(" ").setScore(7);          // blank line (static, never changes)
        registerLine("kills",  6);
        registerLine("deaths", 5);
        sidebar.getScore("  ").setScore(4);         // blank line (static)
        registerLine("coins",  3);
        sidebar.getScore("   ").setScore(2);        // blank line (static)
        sidebar.getScore("§7play.example.com").setScore(1);  // static line
    }

    public void update(int kills, int deaths, int coins) {
        // Update only the team prefix — the entry key stays constant,
        // so no old entry accumulates as a ghost line.
        setLinePrefix("kills",  "§fKills: §a"  + kills);
        setLinePrefix("deaths", "§fDeaths: §c" + deaths);
        setLinePrefix("coins",  "§fCoins: §6"  + coins);
    }

    public void remove() {
        // Reset player to main scoreboard before discarding
        player.setScoreboard(Bukkit.getScoreboardManager().getMainScoreboard());
    }
}
```

## Common Pitfalls

- **Using the main scoreboard for per-player data**: All players share the main scoreboard's scores. If two players have different kill counts, put each player on their own `getNewScoreboard()`.

- **Score entry strings over 40 characters**: Vanilla clients truncate scoreboard line strings at 40 characters. Keep sidebar entries short or abbreviate them.

- **Duplicate sidebar entries**: Each unique entry string must be distinct. If you set `kills` to 10 and then call `getScore("§fKills: §a10").setScore(6)` again, you get two lines. Use `resetScores(entry)` to remove the old line before setting a new value, or always construct the same key and update its score.

- **Not resetting the player's scoreboard on disconnect**: If you don't reset to the main scoreboard on `PlayerQuitEvent`, memory leaks occur because the per-player `Scoreboard` object is held alive.

## Version Notes

- **1.21**: `Objective` constructor using `Criteria` enum (e.g., `Criteria.DUMMY`, `Criteria.HEALTH`) is preferred over raw string criteria.
- `RenderType.INTEGER` shows integer scores; `RenderType.HEARTS` shows heart icons (only useful with health criteria).

## Related Skills

- [scoreboard-objectives.md](scoreboard-objectives.md) — Team management, tab-list header/footer, nametag colours
- [../scheduling/SKILL.md](../scheduling/SKILL.md) — Updating scoreboards on a repeating timer
