# Permissions Skill — Paper

## Purpose
Reference this skill when checking or granting permissions in a Paper 1.21 plugin. Covers native Bukkit `hasPermission` / `addAttachment`, plugin.yml permission node declaration, and integrating with Vault for economy and permission group lookups.

## When to Use This Skill
- Checking whether a player has a permission node before executing a command or action
- Granting temporary per-session permissions at runtime (e.g., after a mini-game win)
- Reading a player's economy balance or transferring currency via Vault
- Detecting whether Vault and an economy/permissions provider are installed

## API Quick Reference

| Class / Method | Purpose | Notes |
|---------------|---------|-------|
| `Permissible#hasPermission(String)` | Check a permission node | Returns `true` for ops if node undefined |
| `Permissible#isPermissionSet(String)` | Check if node is explicitly set | Does NOT fall back to op status |
| `Permissible#addAttachment(Plugin)` | Create a runtime `PermissionAttachment` | Removed on plugin disable |
| `PermissionAttachment#setPermission(String, boolean)` | Set/revoke a specific node | |
| `PermissionAttachment#remove()` | Remove all nodes in this attachment | Call when session ends |
| `Bukkit.getPluginManager().addPermission(Permission)` | Register a permission node | Optional; enables inheritance |
| `Permission(String, PermissionDefault)` | Declare a node with default | `TRUE`, `FALSE`, `OP`, `NOT_OP` |
| `RegisteredServiceProvider<Economy>` | Vault economy hook | `net.milkbowl.vault.economy.Economy` |
| `Economy#getBalance(OfflinePlayer)` | Get balance | Returns `double` |
| `Economy#depositPlayer(OfflinePlayer, double)` | Add currency | Returns `EconomyResponse` |
| `Economy#withdrawPlayer(OfflinePlayer, double)` | Remove currency | Returns `EconomyResponse` |

## Code Pattern

```java
package com.yourorg.myplugin.permissions;

import net.milkbowl.vault.economy.Economy;
import net.milkbowl.vault.economy.EconomyResponse;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;
import org.bukkit.permissions.PermissionAttachment;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class PermissionManager {

    private final JavaPlugin plugin;

    // Economy is nullable — only available when Vault + an economy plugin are present
    private Economy economy;

    // Track runtime attachments so they can be revoked
    private final Map<UUID, PermissionAttachment> attachments = new HashMap<>();

    public PermissionManager(JavaPlugin plugin) {
        this.plugin = plugin;
        setupEconomy();   // attempt to hook Vault
    }

    // --- Native permission checks ---

    public boolean has(Player player, String node) {
        return player.hasPermission(node);
    }

    // --- Runtime attachment (temporary per-session permissions) ---

    /** Grant a permission node for the remainder of this session. */
    public void grantTemporary(Player player, String node) {
        PermissionAttachment attachment = attachments.computeIfAbsent(
            player.getUniqueId(),
            uuid -> player.addAttachment(plugin)
        );
        attachment.setPermission(node, true);
    }

    /** Revoke a previously granted temporary node. */
    public void revokeTemporary(Player player, String node) {
        PermissionAttachment attachment = attachments.get(player.getUniqueId());
        if (attachment != null) {
            attachment.unsetPermission(node);
        }
    }

    /** Remove ALL temporary permissions for a player (call on logout). */
    public void clearTemporary(Player player) {
        PermissionAttachment attachment = attachments.remove(player.getUniqueId());
        if (attachment != null) {
            attachment.remove();
        }
    }

    // --- Vault economy ---

    private void setupEconomy() {
        if (plugin.getServer().getPluginManager().getPlugin("Vault") == null) {
            plugin.getSLF4JLogger().warn("Vault not found — economy features disabled.");
            return;
        }
        RegisteredServiceProvider<Economy> rsp =
            plugin.getServer().getServicesManager().getRegistration(Economy.class);
        if (rsp == null) {
            plugin.getSLF4JLogger().warn("No economy provider found — economy features disabled.");
            return;
        }
        economy = rsp.getProvider();
        plugin.getSLF4JLogger().info("Vault economy hooked: {}", economy.getName());
    }

    /** Returns true when an economy provider is available. */
    public boolean hasEconomy() {
        return economy != null;
    }

    public double getBalance(OfflinePlayer player) {
        if (!hasEconomy()) return 0.0;
        return economy.getBalance(player);
    }

    public boolean deposit(OfflinePlayer player, double amount) {
        if (!hasEconomy()) return false;
        EconomyResponse response = economy.depositPlayer(player, amount);
        return response.transactionSuccess();
    }

    public boolean withdraw(OfflinePlayer player, double amount) {
        if (!hasEconomy()) return false;
        if (economy.getBalance(player) < amount) return false;
        EconomyResponse response = economy.withdrawPlayer(player, amount);
        return response.transactionSuccess();
    }
}
```

**Register and clean up in your main class:**
```java
@Override
public void onEnable() {
    permissionManager = new PermissionManager(this);
    getServer().getPluginManager().registerEvents(new PlayerQuitListener(permissionManager), this);
}

// PlayerQuitListener clears attachments on logout:
// permissionManager.clearTemporary(event.getPlayer());
```

## Common Pitfalls

- **`hasPermission` returns `true` for ops when node is undefined**: If a node is not declared in `plugin.yml` and has no explicit set, operators return `true` by default. Declare nodes in `plugin.yml` with `default: op` (or `false`) to control this.

- **Not removing `PermissionAttachment` on logout**: Attachments are linked to the `Player` object. If the player logs out and back in, they get a fresh player object — the old attachment is effectively lost but the `Map` entry remains, leaking memory. Always call `clearTemporary()` in `PlayerQuitEvent`.

- **`isPermissionSet` vs `hasPermission`**: `isPermissionSet("node")` is `false` when a permission plugin hasn't explicitly set the node; `hasPermission("node")` falls back to op status. Use `isPermissionSet` only when you need to distinguish "explicitly granted" from "granted by op fallback".

- **Vault economy called before `onEnable` completes**: `setupEconomy()` must run after all plugins are loaded. Call it in `onEnable`, never in the constructor of a field that initialises before `onEnable`.

- **`EconomyResponse.transactionSuccess()` not checked**: Always check the response before assuming money was transferred — the provider may return a failure for reasons like server-side economy caps.

## Version Notes

- **Paper 1.21**: No changes to the core permission API. Vault still uses the legacy `net.milkbowl.vault.*` API; modern Vault 2 is in development but not yet widely deployed.
- LuckPerms is the most common permission plugin. Its API is separate from Vault but can also be used directly for group/meta queries.

## Related Skills

- [vault-economy.md](vault-economy.md) — Full Vault economy integration guide
- [../commands/brigadier-commands.md](../commands/brigadier-commands.md) — `.requires(src -> src.getSender().hasPermission(...))` predicate
- [../storage/pdc.md](../storage/pdc.md) — Storing permission state in PDC
