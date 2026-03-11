# Effects Skill — Paper

## Purpose
Reference this skill when adding visual or audio feedback to plugin actions in Paper 1.21. Covers the Particle API for visual effects and `Player#playSound` / `World#playSound` for audio.

## When to Use This Skill
- Spawning particles at a location (explosions, sparkles, trails)
- Playing a sound when a player earns a reward or completes an action
- Creating ambient area effects with repeating tasks
- Using resource-pack custom sounds via namespaced keys

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `World#spawnParticle(Particle, Location, count)` | Spawn particles for all nearby | Main thread |
| `World#spawnParticle(Particle, Location, count, dx, dy, dz, speed)` | Spray particles in a range | |
| `World#spawnParticle(Particle, Location, count, dx, dy, dz, speed, data)` | With particle data (e.g., colour) | |
| `Player#spawnParticle(...)` | Spawn particles visible to one player only | Same overloads |
| `Particle.DustOptions` | Coloured dust particle data | `new DustOptions(Color, size)` |
| `Particle.DustTransition` | Fade from one colour to another | |
| `Player#playSound(Location, Sound, volume, pitch)` | Play a sound to one player | Main thread |
| `Player#playSound(Location, String, SoundCategory, volume, pitch)` | Namespaced custom sound | |
| `World#playSound(Location, Sound, volume, pitch)` | Play sound to all nearby | |
| `Player#stopSound(Sound)` | Stop a specific sound | |
| `Player#stopAllSounds()` | Stop all sounds | |
| `SoundCategory` | Channel for volume slider | `MASTER`, `MUSIC`, `PLAYERS`, etc. |

## Code Pattern

```java
package com.yourorg.myplugin.effects;

import org.bukkit.Color;
import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.SoundCategory;
import org.bukkit.entity.Player;

public class EffectService {

    // --- Particles ---

    // Simple burst of flame particles at a location
    public void playFireBurst(Location location) {
        location.getWorld().spawnParticle(
            Particle.FLAME,
            location,
            30,      // count
            0.5,     // dx spread
            0.5,     // dy spread
            0.5,     // dz spread
            0.05     // speed
        );
    }

    // Coloured dust (for custom colour effects)
    public void playColoredDust(Location location, Color color) {
        Particle.DustOptions dust = new Particle.DustOptions(color, 1.5f);  // size 1.5
        location.getWorld().spawnParticle(
            Particle.DUST,
            location,
            50,
            0.3, 0.3, 0.3,
            0,      // speed must be 0 for dust
            dust    // particle data
        );
    }

    // Spawn particles only visible to a single player
    public void playPersonalEffect(Player player, Location location) {
        player.spawnParticle(
            Particle.TOTEM_OF_UNDYING,
            location,
            20,
            0.2, 0.5, 0.2,
            0.1
        );
    }

    // --- Sounds ---

    // Play a sound to a specific player
    public void playLevelUp(Player player) {
        player.playSound(
            player.getLocation(),
            Sound.UI_TOAST_CHALLENGE_COMPLETE,
            SoundCategory.PLAYERS,
            1.0f,    // volume (0.0–1.0, can exceed 1.0 to increase range)
            1.0f     // pitch (0.5 = low, 2.0 = high)
        );
    }

    // Play to all players in range
    public void playExplosionArea(Location location) {
        location.getWorld().playSound(
            location,
            Sound.ENTITY_GENERIC_EXPLODE,
            SoundCategory.HOSTILE,
            1.0f,
            1.0f
        );
    }

    // Custom resource-pack sound via namespaced key
    public void playCustomSound(Player player, String soundKey) {
        // soundKey example: "myplugin:level_up"
        player.playSound(
            player.getLocation(),
            soundKey,          // String form of namespaced key
            SoundCategory.MASTER,
            1.0f,
            1.0f
        );
    }
}
```

## Common Pitfalls

- **Using `speed = 0` for non-directional particles**: For particles that have a direction concept (`FLAME`, `SMOKE`), setting `speed = 0` makes them stationary. Set a small value like `0.05` for natural spread.

- **Dust particles require `speed = 0`**: For `Particle.DUST`, the `speed` parameter is unused. Always pass `0` — nonzero values do nothing but are confusing.

- **`count = 0` with offset for directional particles**: Setting `count = 0` and non-zero `dx/dy/dz` creates a single particle fired in a specific direction. This is the Minecraft particle API's directional mode.

- **`spawnParticle` on an async thread**: Particle spawning is a world mutation. Must run on the main thread.

- **High particle counts on large servers**: Spawning 500+ particles per event handler will overwhelm clients. Keep burst counts under 100 and use repeating tasks sparingly for ambient effects.

## Version Notes

- **1.21**: `Particle.REDSTONE` was renamed to `Particle.DUST`. Update legacy code that uses `Particle.REDSTONE`.
- `Particle.DustTransition` (colour-fade dust) is available since 1.17 and stable in 1.21.

## Related Skills

- [particles.md](particles.md) — Full particle type reference, circle/sphere patterns
- [sounds.md](sounds.md) — Sound enum reference, stop sound, custom resource-pack sounds
- [../scheduling/scheduler-tasks.md](../scheduling/scheduler-tasks.md) — Repeating tasks for ambient effects
