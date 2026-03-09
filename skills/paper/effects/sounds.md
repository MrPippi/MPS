# Sounds — Paper

Sound enum reference, play/stop patterns, `SoundCategory`, pitch/volume guide, and custom resource-pack sounds for Paper 1.21.

---

## `Sound` Enum — Commonly Used Values

### UI & Feedback

| Constant | Description |
|----------|-------------|
| `UI_TOAST_CHALLENGE_COMPLETE` | Achievement / challenge complete jingle |
| `UI_TOAST_IN` | Toast notification slide in |
| `UI_TOAST_OUT` | Toast notification slide out |
| `UI_BUTTON_CLICK` | Generic button click |
| `UI_CARTOGRAPHY_TABLE_TAKE_RESULT` | Soft confirm sound |

### Player

| Constant | Description |
|----------|-------------|
| `ENTITY_PLAYER_LEVELUP` | Level-up fanfare |
| `ENTITY_PLAYER_HURT` | Player hurt grunt |
| `ENTITY_PLAYER_DEATH` | Player death sound |
| `ENTITY_PLAYER_SPLASH` | Water splash |
| `ENTITY_EXPERIENCE_ORB_PICKUP` | XP orb pickup |
| `ENTITY_ITEM_PICKUP` | Item pickup |

### World / Environment

| Constant | Description |
|----------|-------------|
| `ENTITY_GENERIC_EXPLODE` | Standard explosion |
| `ENTITY_LIGHTNING_BOLT_THUNDER` | Thunder crack |
| `BLOCK_NOTE_BLOCK_PLING` | Note block pling |
| `BLOCK_CHEST_OPEN` | Chest open creak |
| `BLOCK_CHEST_CLOSE` | Chest close thud |
| `BLOCK_ANVIL_USE` | Anvil use clank |
| `BLOCK_FIRE_AMBIENT` | Crackling fire |

### Misc

| Constant | Description |
|----------|-------------|
| `ENTITY_ENDERMAN_TELEPORT` | Enderman teleport whoosh |
| `ENTITY_ENDER_DRAGON_GROWL` | Ender dragon roar |
| `ITEM_TOTEM_USE` | Totem of undying activation |
| `ENTITY_FIREWORK_ROCKET_LAUNCH` | Firework launch |
| `ENTITY_FIREWORK_ROCKET_BLAST` | Firework explosion |

---

## `SoundCategory` Reference

| Category | Player Volume Slider |
|----------|---------------------|
| `MASTER` | Master |
| `MUSIC` | Music |
| `RECORD` | Jukebox/Noteblocks |
| `WEATHER` | Weather |
| `BLOCK` | Blocks |
| `HOSTILE` | Hostile creatures |
| `NEUTRAL` | Friendly creatures |
| `PLAYERS` | Players |
| `AMBIENT` | Ambient/Environment |
| `VOICE` | Voice/Speech |

---

## Volume and Pitch Guide

| Volume | Effect |
|--------|--------|
| `0.0f` | Silent (still sent to client, just inaudible) |
| `1.0f` | Normal volume; audible range ≈ 16 blocks |
| `2.0f` | Double volume; audible range ≈ 32 blocks |
| `3.0f+` | Increasing range; no louder past client max |

| Pitch | Effect |
|-------|--------|
| `0.5f` | One octave lower |
| `1.0f` | Normal pitch |
| `2.0f` | One octave higher |

---

## API Methods

```java
import org.bukkit.Location;
import org.bukkit.Sound;
import org.bukkit.SoundCategory;
import org.bukkit.World;
import org.bukkit.entity.Player;

public class SoundExamples {

    // --- Per-player sounds ---

    // Play to one player at their location
    public void playLevelUp(Player player) {
        player.playSound(
            player.getLocation(),
            Sound.ENTITY_PLAYER_LEVELUP,
            SoundCategory.PLAYERS,
            1.0f,   // volume
            1.0f    // pitch
        );
    }

    // Play at a specific location (spatial audio — louder when closer)
    public void playChestOpen(Player player, Location chestLoc) {
        player.playSound(
            chestLoc,
            Sound.BLOCK_CHEST_OPEN,
            SoundCategory.BLOCK,
            1.0f,
            1.0f
        );
    }

    // Play to all players within range
    public void playExplosion(Location location) {
        location.getWorld().playSound(
            location,
            Sound.ENTITY_GENERIC_EXPLODE,
            SoundCategory.HOSTILE,
            2.0f,
            1.0f
        );
    }

    // Stop a specific sound for a player
    public void stopMusic(Player player) {
        player.stopSound(Sound.MUSIC_GAME);
    }

    // Stop ALL sounds for a player (e.g., on teleport)
    public void stopAllSounds(Player player) {
        player.stopAllSounds();
    }

    // Stop by category (e.g., mute all hostile sounds)
    public void stopHostileSounds(Player player) {
        player.stopSound(SoundCategory.HOSTILE);
    }
}
```

---

## Custom Resource-Pack Sounds

Custom sounds from a resource pack are identified by a namespaced key (e.g., `myplugin:level_up`). Use the `String` overloads:

```java
// Play a custom resource-pack sound
public void playCustom(Player player, String soundKey) {
    // soundKey format: "namespace:path"  e.g. "myplugin:ui_confirm"
    player.playSound(
        player.getLocation(),
        soundKey,                    // String form — no Sound enum needed
        SoundCategory.MASTER,
        1.0f,
        1.0f
    );
}

// World-wide custom sound
public void broadcastCustom(Location location, String soundKey) {
    location.getWorld().playSound(
        location,
        soundKey,
        SoundCategory.MASTER,
        1.0f,
        1.0f
    );
}
```

**Example `sounds.json` in a resource pack:**
```json
{
  "ui_confirm": {
    "sounds": ["myplugin/ui_confirm"]
  },
  "level_up": {
    "sounds": ["myplugin/level_up"]
  }
}
```
Placed at `assets/myplugin/sounds.json`; audio files at `assets/myplugin/sounds/myplugin/level_up.ogg`.

---

## Jukebox / Note Block Pitches

To play note block notes at specific pitches:

```java
// Note block pling in chromatic scale
// Pitch values for semitones: 0.5 = F#3, 1.0 = F#4, 2.0 = F#5
// Exact semitone formula: pitch = Math.pow(2, semitone / 12.0)
// where semitone 0 = F#4 (pitch 1.0)

for (int semitone = -12; semitone <= 12; semitone++) {
    float pitch = (float) Math.pow(2.0, semitone / 12.0);
    player.playSound(player.getLocation(),
        Sound.BLOCK_NOTE_BLOCK_PLING, SoundCategory.RECORD, 1.0f, pitch);
}
```

---

## Sound Sequence (Melody)

Play sounds with delays using the scheduler:

```java
import org.bukkit.Bukkit;
import org.bukkit.Sound;
import org.bukkit.SoundCategory;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public void playFanfare(Player player, JavaPlugin plugin) {
    long[] delays = {0L, 5L, 10L, 15L, 20L};   // ticks between notes
    float[] pitches = {1.0f, 1.12f, 1.26f, 1.41f, 1.59f};

    for (int i = 0; i < delays.length; i++) {
        final float pitch = pitches[i];
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (player.isOnline()) {
                player.playSound(player.getLocation(),
                    Sound.BLOCK_NOTE_BLOCK_PLING,
                    SoundCategory.RECORD, 0.8f, pitch);
            }
        }, delays[i]);
    }
}
```

---

## Common Pitfalls

- **`Sound.MUSIC_*` constants loop infinitely**: Music sounds loop on the client until stopped with `stopSound()`. Call `player.stopSound(Sound.MUSIC_GAME)` before replacing music.

- **Volume `> 1.0f` does not make the sound louder**: Past `1.0f`, volume only extends the audible distance. For maximum loudness, `1.0f` is the correct value; higher values simply allow players further away to hear it.

- **Playing sounds in async callbacks**: `Player#playSound()` is a Bukkit world operation. Always call it on the main thread. If inside an async callback, use `Bukkit.getScheduler().runTask(plugin, ...)`.

- **Using the wrong `SoundCategory`**: A sound under `SoundCategory.HOSTILE` is muted when the player sets "Hostile Creatures" to 0% in settings. Match the category semantically so player volume sliders work intuitively.

- **Resource-pack sound not playing**: Ensure `sounds.json` uses the correct namespace (`myplugin`, not `minecraft`) and the `.ogg` file path inside the JAR matches exactly. The `String` key must be `"namespace:path"` without the file extension.
