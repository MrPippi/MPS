# examples — generate-placeholder-expansion

## 範例 1：經濟插件 placeholder

**Input:**
```
plugin_name: EconomyPlugin
placeholder_keys:
  - balance          → 玩家餘額（數字）
  - balance_formatted → 玩家餘額（格式化，含貨幣符號）
  - rank             → 玩家財富排名
```

**Output — EconomyExpansion.java:**
```java
package com.example.economyplugin.placeholder;

import com.example.economyplugin.EconomyPlugin;
import me.clip.placeholderapi.expansion.PlaceholderExpansion;
import org.bukkit.OfflinePlayer;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class EconomyExpansion extends PlaceholderExpansion {

    private final EconomyPlugin plugin;

    public EconomyExpansion(EconomyPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public @NotNull String getIdentifier() {
        return "economy";  // %economy_<key>%
    }

    @Override
    public @NotNull String getAuthor() {
        return String.join(", ", plugin.getDescription().getAuthors());
    }

    @Override
    public @NotNull String getVersion() {
        return plugin.getDescription().getVersion();
    }

    @Override
    public boolean persist() {
        return true;  // 讓 PAPI 在插件重載後仍保留此 Expansion
    }

    @Override
    public @Nullable String onRequest(OfflinePlayer player, @NotNull String params) {
        if (player == null) return "";

        return switch (params.toLowerCase()) {
            case "balance" -> {
                double bal = plugin.getEconomyManager().getBalance(player.getUniqueId());
                yield String.valueOf(bal);
            }
            case "balance_formatted" -> {
                double bal = plugin.getEconomyManager().getBalance(player.getUniqueId());
                yield String.format("$%.2f", bal);
            }
            case "rank" -> {
                int rank = plugin.getEconomyManager().getRank(player.getUniqueId());
                yield String.valueOf(rank);
            }
            default -> null;  // 返回 null 表示不處理此 placeholder
        };
    }
}
```

**使用範例（聊天/計分板）:**
```
玩家餘額：%economy_balance%
格式化：%economy_balance_formatted%
排名：第 %economy_rank% 名
```

---

## 範例 2：玩家統計插件 placeholder

**Input:**
```
plugin_name: StatsPlugin
placeholder_keys:
  - kills        → 擊殺數
  - deaths       → 死亡數
  - kdr          → K/D 比（保留2位小數）
  - playtime     → 遊玩時間（格式：Xh Ym）
```

**Output — onRequest 方法（節錄）:**
```java
return switch (params.toLowerCase()) {
    case "kills" -> String.valueOf(
        plugin.getStatsManager().getKills(player.getUniqueId())
    );
    case "deaths" -> String.valueOf(
        plugin.getStatsManager().getDeaths(player.getUniqueId())
    );
    case "kdr" -> {
        int kills  = plugin.getStatsManager().getKills(player.getUniqueId());
        int deaths = plugin.getStatsManager().getDeaths(player.getUniqueId());
        yield deaths == 0
            ? String.valueOf(kills)
            : String.format("%.2f", (double) kills / deaths);
    }
    case "playtime" -> {
        long minutes = plugin.getStatsManager().getPlaytimeMinutes(player.getUniqueId());
        yield String.format("%dh %dm", minutes / 60, minutes % 60);
    }
    default -> null;
};
```

---

## 範例 3：在主類中注冊 Expansion

```java
@Override
public void onEnable() {
    if (getServer().getPluginManager().isPluginEnabled("PlaceholderAPI")) {
        new EconomyExpansion(this).register();
        getLogger().info("PlaceholderAPI 整合已啟用。");
    } else {
        getLogger().warning("PlaceholderAPI 未找到，placeholder 功能停用。");
    }
}
```

**plugin.yml 軟依賴宣告:**
```yaml
softdepend: [PlaceholderAPI]
```
