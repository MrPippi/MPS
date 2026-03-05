---
name: generate-command-handler
description: 依使用者提供的指令名稱與子指令清單，產生完整的 Bukkit CommandExecutor + TabCompleter 類別，含子指令路由、權限節點、玩家/控制台環境判斷、參數驗證，以及 plugin.yml 宣告範例。當使用者說「幫我建立指令」、「新增 CommandExecutor」、「TabCompleter 怎麼寫」時自動應用。
---

# Generate Command Handler Skill

## 目標

依使用者提供的指令名稱與子指令清單，產生完整的 `CommandExecutor` + `TabCompleter` 實作類別。

---

## 使用流程

1. **詢問基本資訊**：插件名稱（小寫）、主指令名稱、子指令清單
2. **產生主指令類別**：`CommandExecutor` + `TabCompleter` 合併實作
3. **輸出 plugin.yml 片段**：`commands` 節點範例
4. **說明註冊方式**：在 `onEnable()` 中綁定

---

## 代碼範本

### 基礎單層指令（無子指令）

```java
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.jetbrains.annotations.NotNull;
import java.util.List;

public class MyCommand implements CommandExecutor, TabCompleter {

    private final MyPlugin plugin;

    public MyCommand(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command,
                             @NotNull String label, @NotNull String[] args) {

        if (!(sender instanceof Player player)) {
            sender.sendMessage("此指令僅限玩家使用。");
            return true;
        }

        if (!player.hasPermission("myplugin.command")) {
            player.sendMessage(Component.text("你沒有權限執行此指令。").color(NamedTextColor.RED));
            return true;
        }

        player.sendMessage(Component.text("指令執行成功！").color(NamedTextColor.GREEN));
        return true;
    }

    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command,
                                       @NotNull String alias, @NotNull String[] args) {
        return List.of();
    }
}
```

---

### 多子指令路由模式

```java
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.jetbrains.annotations.NotNull;
import java.util.List;

public class ShopCommand implements CommandExecutor, TabCompleter {

    private static final List<String> SUB_COMMANDS = List.of("buy", "sell", "list", "help");

    private final MyPlugin plugin;

    public ShopCommand(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command,
                             @NotNull String label, @NotNull String[] args) {

        if (!(sender instanceof Player player)) {
            sender.sendMessage("此指令僅限玩家使用。");
            return true;
        }

        if (args.length == 0) {
            sendUsage(player);
            return true;
        }

        return switch (args[0].toLowerCase()) {
            case "buy"  -> handleBuy(player, args);
            case "sell" -> handleSell(player, args);
            case "list" -> handleList(player);
            case "help" -> { sendUsage(player); yield true; }
            default     -> { sendUsage(player); yield true; }
        };
    }

    private boolean handleBuy(Player player, String[] args) {
        if (!player.hasPermission("myplugin.shop.buy")) {
            player.sendMessage(Component.text("你沒有購買權限。").color(NamedTextColor.RED));
            return true;
        }
        if (args.length < 2) {
            player.sendMessage(Component.text("用法：/shop buy <物品>").color(NamedTextColor.YELLOW));
            return true;
        }
        String itemName = args[1];
        player.sendMessage(Component.text("購買了：" + itemName).color(NamedTextColor.GREEN));
        return true;
    }

    private boolean handleSell(Player player, String[] args) {
        if (!player.hasPermission("myplugin.shop.sell")) {
            player.sendMessage(Component.text("你沒有出售權限。").color(NamedTextColor.RED));
            return true;
        }
        player.sendMessage(Component.text("出售成功！").color(NamedTextColor.GREEN));
        return true;
    }

    private boolean handleList(Player player) {
        if (!player.hasPermission("myplugin.shop.list")) {
            player.sendMessage(Component.text("你沒有查看清單的權限。").color(NamedTextColor.RED));
            return true;
        }
        player.sendMessage(Component.text("商品清單：...").color(NamedTextColor.AQUA));
        return true;
    }

    private void sendUsage(Player player) {
        player.sendMessage(Component.text("=== Shop 指令 ===").color(NamedTextColor.GOLD));
        player.sendMessage(Component.text("/shop buy <物品>  - 購買物品").color(NamedTextColor.YELLOW));
        player.sendMessage(Component.text("/shop sell        - 出售物品").color(NamedTextColor.YELLOW));
        player.sendMessage(Component.text("/shop list        - 查看商品清單").color(NamedTextColor.YELLOW));
    }

    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command,
                                       @NotNull String alias, @NotNull String[] args) {
        if (args.length == 1) {
            return SUB_COMMANDS.stream()
                .filter(s -> s.startsWith(args[0].toLowerCase()))
                .toList();
        }
        if (args.length == 2 && args[0].equalsIgnoreCase("buy")) {
            return List.of("diamond", "iron_ingot", "gold_ingot").stream()
                .filter(s -> s.startsWith(args[1].toLowerCase()))
                .toList();
        }
        return List.of();
    }
}
```

---

### plugin.yml 指令節點範例

```yaml
commands:
  shop:
    description: 商店主指令
    usage: /shop <buy|sell|list|help>
    permission: myplugin.shop
    aliases: [s]
```

---

### 在 onEnable() 中註冊

```java
@Override
public void onEnable() {
    ShopCommand shopCommand = new ShopCommand(this);
    PluginCommand cmd = getCommand("shop");
    if (cmd != null) {
        cmd.setExecutor(shopCommand);
        cmd.setTabCompleter(shopCommand);
    }
}
```

---

## 輸入參數說明

| 參數 | 範例 | 說明 |
|------|------|------|
| 插件名稱 | `MyPlugin` | 用於類別命名與權限節點前綴 |
| 主指令名稱 | `shop` | 主指令名稱 |
| 子指令清單 | `buy, sell, list` | 逗號分隔，每項說明功能 |
| 是否限玩家 | `true` | 控制台是否可執行 |
| 需要參數的子指令 | `buy <item>` | 指出哪些子指令有額外參數 |

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `getCommand()` 回傳 null | plugin.yml 未宣告該指令 | 在 `commands:` 節點加上指令 |
| Tab 補全不觸發 | 未呼叫 `setTabCompleter()` | `onEnable()` 中同時設定 executor 與 completer |
| 玩家傳入 null | `sender` 不是 `Player` 時轉型失敗 | 使用 `instanceof` + pattern variable 判斷 |
| 子指令大小寫不符 | 玩家輸入 `BUY` 但比對 `buy` | 用 `args[0].toLowerCase()` 正規化 |
