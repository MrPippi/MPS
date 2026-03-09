# Vault Economy — Paper

Complete guide to integrating Vault's Economy API: setup, dependency declaration, safe hooking pattern, balance operations, and error handling for Paper 1.21.

---

## What is Vault?

Vault is a permissions/economy/chat API abstraction layer. Your plugin calls `Economy` methods; Vault delegates to the actual economy plugin (EssentialsX, CMI, TokenManager, etc.) installed on the server.

Your plugin never depends on a specific economy plugin — only on Vault itself.

---

## Gradle Dependencies

```groovy
repositories {
    maven { url = 'https://jitpack.io' }
}

dependencies {
    compileOnly 'com.github.MilkBowl:VaultAPI:1.7.1'
}
```

> `compileOnly` — Vault is provided by the server at runtime; do not shade it.

---

## `plugin.yml` Soft-Depend

```yaml
name: MyPlugin
version: '1.0.0'
main: com.yourorg.myplugin.MyPlugin
api-version: '1.21'

# softdepend — plugin loads without Vault but economy features are disabled
softdepend: [Vault]
```

Use `softdepend` (not `depend`) so the plugin still loads on servers without Vault installed.

---

## Hooking Vault in `onEnable`

```java
package com.yourorg.myplugin;

import net.milkbowl.vault.economy.Economy;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class MyPlugin extends JavaPlugin {

    // Nullable — null when Vault or an economy provider is absent
    private static Economy economy = null;

    @Override
    public void onEnable() {
        if (!setupEconomy()) {
            getSLF4JLogger().warn("Vault economy not found — economy features disabled.");
            // continue — plugin still loads
        }
    }

    private boolean setupEconomy() {
        if (getServer().getPluginManager().getPlugin("Vault") == null) {
            return false;
        }
        RegisteredServiceProvider<Economy> rsp =
            getServer().getServicesManager().getRegistration(Economy.class);
        if (rsp == null) return false;
        economy = rsp.getProvider();
        getSLF4JLogger().info("Economy provider: {}", economy.getName());
        return true;
    }

    /** Returns the Economy provider, or null if unavailable. */
    public static Economy getEconomy() {
        return economy;
    }
}
```

---

## `EconomyService` — Full Implementation

```java
package com.yourorg.myplugin.economy;

import net.milkbowl.vault.economy.Economy;
import net.milkbowl.vault.economy.EconomyResponse;
import org.bukkit.OfflinePlayer;

public class EconomyService {

    private final Economy economy;

    public EconomyService(Economy economy) {
        if (economy == null) throw new IllegalStateException("Economy provider is null");
        this.economy = economy;
    }

    // --- Balance queries ---

    public double getBalance(OfflinePlayer player) {
        return economy.getBalance(player);
    }

    public boolean has(OfflinePlayer player, double amount) {
        return economy.has(player, amount);
    }

    // --- Transactions ---

    /**
     * Deposits currency into a player's account.
     * @return true if successful
     */
    public boolean deposit(OfflinePlayer player, double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        EconomyResponse resp = economy.depositPlayer(player, amount);
        return resp.transactionSuccess();
    }

    /**
     * Withdraws currency from a player's account.
     * @return true if successful (also fails if balance is insufficient)
     */
    public boolean withdraw(OfflinePlayer player, double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdraw amount must be positive");
        if (!economy.has(player, amount)) return false;
        EconomyResponse resp = economy.withdrawPlayer(player, amount);
        return resp.transactionSuccess();
    }

    /**
     * Transfers currency from one player to another atomically.
     * Rolls back on partial failure.
     */
    public boolean transfer(OfflinePlayer from, OfflinePlayer to, double amount) {
        if (!withdraw(from, amount)) return false;
        if (!deposit(to, amount)) {
            // Roll back the withdrawal
            deposit(from, amount);
            return false;
        }
        return true;
    }

    // --- Formatting ---

    /** Returns a formatted currency string, e.g. "$1,250.00" */
    public String format(double amount) {
        return economy.format(amount);
    }

    /** Returns the currency name (singular/plural based on amount). */
    public String currencyName(double amount) {
        return amount == 1.0 ? economy.currencyNameSingular()
                             : economy.currencyNamePlural();
    }
}
```

---

## `EconomyResponse` Fields

```java
EconomyResponse resp = economy.withdrawPlayer(player, 100.0);

resp.transactionSuccess()  // boolean — true if completed
resp.amount                // double — requested amount
resp.balance               // double — new balance after transaction
resp.type                  // EconomyResponse.ResponseType: SUCCESS, FAILURE, NOT_IMPLEMENTED
resp.errorMessage          // String — human-readable failure reason (may be null on success)
```

---

## Command Example: Paying Another Player

```java
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;

public void handlePay(Player sender, String targetName, double amount) {
    Economy econ = MyPlugin.getEconomy();
    if (econ == null) {
        sender.sendMessage(Component.text("Economy is not available.").color(NamedTextColor.RED));
        return;
    }

    if (amount <= 0) {
        sender.sendMessage(Component.text("Amount must be positive.").color(NamedTextColor.RED));
        return;
    }

    @SuppressWarnings("deprecation")
    OfflinePlayer target = Bukkit.getOfflinePlayer(targetName);

    if (!econ.has(sender, amount)) {
        sender.sendMessage(
            Component.text("Insufficient balance. You have " + econ.format(econ.getBalance(sender)))
                .color(NamedTextColor.RED)
        );
        return;
    }

    boolean success = new EconomyService(econ).transfer(sender, target, amount);
    if (success) {
        sender.sendMessage(
            Component.text("Paid " + econ.format(amount) + " to " + target.getName())
                .color(NamedTextColor.GREEN)
        );
    } else {
        sender.sendMessage(Component.text("Transaction failed.").color(NamedTextColor.RED));
    }
}
```

---

## Checking Economy Availability (Guard Pattern)

Always null-check before using economy anywhere it might be called outside `onEnable`:

```java
public boolean chargePlayer(Player player, double cost) {
    Economy econ = MyPlugin.getEconomy();
    if (econ == null) {
        // Economy unavailable — decide whether to allow or block the action
        return true;   // lenient: allow free use when no economy installed
    }
    return new EconomyService(econ).withdraw(player, cost);
}
```

---

## Common Pitfalls

- **Calling `getEconomy()` before `onEnable` finishes**: Economy hook happens in `onEnable`, not in static initialization or constructor. Any code that runs before `onEnable` will see `null`.

- **Using `depend: [Vault]` instead of `softdepend`**: Hard-depending on Vault prevents the plugin from loading on servers without Vault. Use `softdepend` and degrade gracefully.

- **Not checking `transactionSuccess()`**: The economy provider may reject a transaction for server-specific reasons. Always inspect `EconomyResponse.transactionSuccess()` before assuming money moved.

- **Using `Bukkit.getOfflinePlayer(name)` (string form)**: This method is deprecated because it does a blocking web request on offline (never-joined) players. Prefer `Bukkit.getOfflinePlayer(UUID)` when you have the UUID. For players who have joined, names are cached locally.

- **Negative or zero amounts**: Most economy providers throw exceptions or return error responses for `<= 0` amounts. Validate before calling.

- **Not handling Vault loading order**: Vault registers its services after plugin `onLoad`. Hooking economy in `onLoad` instead of `onEnable` will always return null — always hook in `onEnable`.

---

## Related Skills

- [SKILL.md](SKILL.md) — Permissions overview, native `hasPermission`, `PermissionAttachment`
- [../commands/brigadier-commands.md](../commands/brigadier-commands.md) — Command registration where economy checks live
- [../storage/database-hikari.md](../storage/database-hikari.md) — Persisting economy-related data
