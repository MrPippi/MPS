# examples — generate-message-system

## 範例 1：MiniMessage 格式（基本插件）

**Input:**
```
message_keys:
  - no-permission
  - player-only
  - reload-success
  - warp-created
  - warp-deleted
  - warp-not-found
format: minimessage
use_papi: false
```

**Output — messages.yml:**
```yaml
prefix: "<dark_aqua>[WarpPlugin]</dark_aqua> "

messages:
  no-permission: "<red>你沒有執行此操作的權限。</red>"
  player-only: "<yellow>此指令僅限玩家執行。</yellow>"
  reload-success: "<green>設定檔已重新載入。</green>"
  warp-created: "<green>傳送點 <white><bold>{name}</bold></white> 已建立。</green>"
  warp-deleted: "<yellow>傳送點 <white>{name}</white> 已刪除。</yellow>"
  warp-not-found: "<red>找不到傳送點 <white>{name}</white>。</red>"
```

**Output — MessageManager 使用範例:**
```java
// 在 CommandExecutor 中
messageManager.send(player, "warp-created", Map.of("name", warpName));
messageManager.send(player, "no-permission");
```

---

## 範例 2：Legacy 色碼格式（舊版相容）

**Input:**
```
message_keys:
  - no-permission
  - balance-display
  - transaction-success
  - insufficient-funds
format: legacy
use_papi: false
```

**Output — messages.yml:**
```yaml
prefix: "&8[&6Economy&8]&r "

messages:
  no-permission: "&c你沒有執行此操作的權限。"
  balance-display: "&a你目前的餘額：&e{amount} &a元。"
  transaction-success: "&a交易成功！轉帳 &e{amount} &a元給 &b{player}&a。"
  insufficient-funds: "&c餘額不足，無法完成此交易。"
```

**Output — MessageManager 使用範例:**
```java
messageManager.send(player, "balance-display",
    Map.of("amount", String.format("%.2f", balance)));

messageManager.send(player, "transaction-success",
    Map.of("amount", String.valueOf(amount), "player", target.getName()));
```

---

## 範例 3：MiniMessage + PlaceholderAPI 整合

**Input:**
```
message_keys:
  - welcome
  - stats-display
  - rank-display
format: minimessage
use_papi: true
```

**Output — messages.yml:**
```yaml
prefix: "<gradient:#5e4fa2:#f79459>[MyPlugin]</gradient> "

messages:
  welcome: "<green>歡迎回來，<white><bold>%player_displayname%</bold></white>！</green>"
  stats-display: "<aqua>你的等級：<white>%vault_rank%</white>，餘額：<gold>%vault_eco_balance%</gold></aqua>"
  rank-display: "<yellow>目前身分組：<white>%luckperms_prefix%%player_name%</white></yellow>"
```

**Output — MessageManager get() 方法（含 PAPI 解析）:**
```java
public Component get(Player player, String key, Map<String, String> placeholders) {
    String raw = messages.getString("messages." + key, "<red>Missing: " + key + "</red>");

    // 先套用 PlaceholderAPI 解析（%placeholder% 語法）
    if (plugin.getServer().getPluginManager().isPluginEnabled("PlaceholderAPI")) {
        raw = PlaceholderAPI.setPlaceholders(player, raw);
    }

    // 再套用自訂 {placeholder} 替換
    TagResolver.Builder resolver = TagResolver.builder();
    placeholders.forEach((k, v) -> resolver.resolver(Placeholder.parsed(k, v)));

    Component msg = MM.deserialize(raw, resolver.build());
    Component pre = MM.deserialize(prefix);
    return pre.append(msg);
}
```

**使用範例:**
```java
// 傳送歡迎訊息（含 PAPI 解析）
messageManager.send(player, player, "welcome", Map.of());
```

---

## 範例 4：reload 指令整合

```java
// ReloadCommand.java
@Override
public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
    if (!PermissionManager.isAdmin((Player) sender)) {
        plugin.getMessageManager().send(sender, "no-permission");
        return true;
    }
    plugin.reloadConfig();
    plugin.getMessageManager().reload();
    plugin.getMessageManager().send(sender, "reload-success");
    return true;
}
```
