# examples — generate-permission-system

## 範例 1：基本雙節點插件

**Input:**
```
plugin_name: WarpPlugin
permission_nodes:
  - warpplugin.admin
  - warpplugin.use
  - warpplugin.teleport
default_op_only: false
```

**Output — plugin.yml permissions 區段:**
```yaml
permissions:
  warpplugin.*:
    description: WarpPlugin 所有權限
    default: op
    children:
      warpplugin.admin: true
      warpplugin.use: true
      warpplugin.teleport: true

  warpplugin.admin:
    description: WarpPlugin 管理員權限（建立/刪除傳送點）
    default: op

  warpplugin.use:
    description: WarpPlugin 一般使用權限
    default: true

  warpplugin.teleport:
    description: 允許使用 /warp 傳送
    default: true
```

**Output — PermissionManager.java (節錄):**
```java
public static final String PERM_ALL      = "warpplugin.*";
public static final String PERM_ADMIN    = "warpplugin.admin";
public static final String PERM_USE      = "warpplugin.use";
public static final String PERM_TELEPORT = "warpplugin.teleport";

public static boolean isAdmin(Player player) {
    return player.hasPermission(PERM_ADMIN);
}
public static boolean canTeleport(Player player) {
    return player.hasPermission(PERM_TELEPORT);
}
```

---

## 範例 2：僅 OP 可用（管理員插件）

**Input:**
```
plugin_name: AdminTools
permission_nodes:
  - admintools.ban
  - admintools.kick
  - admintools.mute
default_op_only: true
```

**Output — plugin.yml permissions 區段:**
```yaml
permissions:
  admintools.*:
    description: AdminTools 所有權限
    default: op
    children:
      admintools.ban: true
      admintools.kick: true
      admintools.mute: true

  admintools.ban:
    description: 允許使用封禁指令
    default: op

  admintools.kick:
    description: 允許使用踢出指令
    default: op

  admintools.mute:
    description: 允許使用靜音指令
    default: op
```

**Output — CommandExecutor 使用範例:**
```java
@Override
public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
    if (!(sender instanceof Player player)) {
        sender.sendMessage("§c僅玩家可執行此指令。");
        return true;
    }
    if (!PermissionManager.has(player, PermissionManager.PERM_BAN)) {
        player.sendMessage("§c你沒有執行此指令的權限。");
        return true;
    }
    // 執行封禁邏輯 ...
    return true;
}
```

---

## 範例 3：多層繼承（子節點群組）

**Input:**
```
plugin_name: ShopPlugin
permission_nodes:
  - shopplugin.admin
  - shopplugin.shop.open
  - shopplugin.shop.buy
  - shopplugin.shop.sell
default_op_only: false
```

**Output — plugin.yml permissions 區段:**
```yaml
permissions:
  shopplugin.*:
    description: ShopPlugin 所有權限
    default: op
    children:
      shopplugin.admin: true
      shopplugin.shop.open: true
      shopplugin.shop.buy: true
      shopplugin.shop.sell: true

  shopplugin.admin:
    description: ShopPlugin 管理員（新增/刪除商店）
    default: op

  shopplugin.shop.open:
    description: 允許開啟商店介面
    default: true

  shopplugin.shop.buy:
    description: 允許購買商品
    default: true

  shopplugin.shop.sell:
    description: 允許出售商品
    default: true
```
