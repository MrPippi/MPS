# examples — generate-command-handler

## 範例 1：/warp 指令（建立、刪除、傳送）

**Input:**
```
command: warp
subcommands:
  - create <name>   (需要 warpplugin.admin)
  - delete <name>   (需要 warpplugin.admin)
  - list            (所有玩家)
  - <name>          (傳送，需要 warpplugin.use)
plugin_name: WarpPlugin
```

**Output — WarpCommand.java:**
```java
public class WarpCommand implements CommandExecutor, TabCompleter {

    private final WarpPlugin plugin;

    public WarpCommand(WarpPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§c此指令僅限玩家執行。");
            return true;
        }

        if (args.length == 0) {
            sendHelp(player);
            return true;
        }

        return switch (args[0].toLowerCase()) {
            case "create" -> handleCreate(player, args);
            case "delete" -> handleDelete(player, args);
            case "list"   -> handleList(player);
            default       -> handleTeleport(player, args[0]);
        };
    }

    private boolean handleCreate(Player player, String[] args) {
        if (!player.hasPermission("warpplugin.admin")) {
            player.sendMessage("§c你沒有權限建立傳送點。");
            return true;
        }
        if (args.length < 2) {
            player.sendMessage("§c用法：/warp create <名稱>");
            return true;
        }
        String name = args[1];
        // 建立傳送點邏輯 ...
        player.sendMessage("§a傳送點 " + name + " 已建立！");
        return true;
    }

    // ... handleDelete, handleList, handleTeleport 類似結構
}
```

**Output — plugin.yml commands 區段:**
```yaml
commands:
  warp:
    description: 傳送點管理指令
    usage: /<command> [create|delete|list|<name>]
    permission: warpplugin.use
    aliases: [w]
```

---

## 範例 2：/shop 指令（buy、sell、list）

**Input:**
```
command: shop
subcommands:
  - buy <item> [amount]   (需要 shopplugin.use)
  - sell <item> [amount]  (需要 shopplugin.use)
  - list [page]           (所有玩家)
  - reload                (需要 shopplugin.admin)
plugin_name: ShopPlugin
```

**Output — ShopCommand.java (節錄):**
```java
@Override
public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
    if (args.length == 0) {
        // 開啟 GUI 介面
        if (sender instanceof Player player) {
            plugin.getGuiManager().openShop(player);
        }
        return true;
    }

    return switch (args[0].toLowerCase()) {
        case "buy"    -> handleBuy(sender, args);
        case "sell"   -> handleSell(sender, args);
        case "list"   -> handleList(sender, args);
        case "reload" -> handleReload(sender);
        default -> {
            sender.sendMessage("§c未知的子指令。請輸入 /shop 查看說明。");
            yield true;
        }
    };
}
```

**Output — TabCompleter:**
```java
@Override
public List<String> onTabComplete(CommandSender sender, Command cmd, String alias, String[] args) {
    if (args.length == 1) {
        List<String> subs = new ArrayList<>(Arrays.asList("buy", "sell", "list"));
        if (sender.hasPermission("shopplugin.admin")) subs.add("reload");
        return StringUtil.copyPartialMatches(args[0], subs, new ArrayList<>());
    }
    if (args.length == 2 && (args[0].equalsIgnoreCase("buy") || args[0].equalsIgnoreCase("sell"))) {
        // 回傳商品清單
        return plugin.getShopManager().getItemIds();
    }
    return List.of();
}
```

---

## 範例 3：/ap（AdminPanel）管理員指令

**Input:**
```
command: ap
subcommands:
  - reload               (需要 ap.admin)
  - give <player> <item> (需要 ap.admin)
  - info <player>        (需要 ap.admin)
plugin_name: AdminPanel
```

**Output — plugin.yml commands 區段:**
```yaml
commands:
  ap:
    description: AdminPanel 管理指令
    usage: /<command> <reload|give|info> [引數]
    permission: ap.admin
    permissionMessage: "§c你沒有執行此指令的權限。"
```
