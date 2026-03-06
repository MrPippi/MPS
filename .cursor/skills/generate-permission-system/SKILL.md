---
name: generate-permission-system
description: 依使用者提供的權限節點清單，產生完整的 Bukkit PermissionManager 工具類別、plugin.yml permissions 區段宣告，含繼承樹設計、預設值設定、OP 判斷。當使用者說「幫我建立權限系統」、「PermissionManager」、「permission node」、「權限節點」時自動應用。
---

# Generate Permission System Skill

## 目標

依使用者提供的插件名稱與權限節點清單，自動產生：
- `PermissionManager.java` 工具類別（靜態方法封裝）
- `plugin.yml` 的 `permissions:` 區段（含描述、default、children 繼承）

---

## 使用流程

1. **詢問基本資訊**：插件名稱、權限節點清單、預設是否僅 OP 可用
2. **推導節點樹**：自動生成根萬用節點 `pluginid.*`，將所有節點列為 children
3. **產生 plugin.yml permissions 區段**（YAML）
4. **產生 PermissionManager.java**（靜態工具類，含每個節點的常數與便捷方法）
5. **說明如何在主類與指令中調用**

---

## 輸入參數說明

| 參數 | 說明 | 範例 |
|------|------|------|
| `plugin_name` | 插件名稱（CamelCase） | `MyPlugin` |
| `permission_nodes` | 權限節點清單（可含子節點） | `myplugin.admin`, `myplugin.use` |
| `default_op_only` | 預設是否僅 OP 可用（true/false） | `true` |

---

## 代碼範本

### 1. plugin.yml permissions 區段

```yaml
permissions:
  myplugin.*:
    description: MyPlugin 所有權限
    default: op
    children:
      myplugin.admin: true
      myplugin.use: true

  myplugin.admin:
    description: MyPlugin 管理員權限
    default: op

  myplugin.use:
    description: MyPlugin 一般使用權限
    default: true
```

**規則：**
- 根節點（`pluginid.*`）使用 `children` 聚合所有子節點
- `default` 值：`op`（僅 OP）、`true`（所有人）、`false`（無人）、`not op`（非 OP）
- 依 `default_op_only` 決定葉節點預設值

---

### 2. PermissionManager.java

```java
package com.example.myplugin.manager;

import org.bukkit.entity.Player;
import org.bukkit.permissions.Permission;
import org.bukkit.permissions.PermissionDefault;
import org.bukkit.plugin.PluginManager;

/**
 * MyPlugin 權限管理工具類別
 * 所有節點已在 plugin.yml 宣告，此類提供便捷的檢查方法。
 */
public final class PermissionManager {

    // 權限節點常數
    public static final String PERM_ALL   = "myplugin.*";
    public static final String PERM_ADMIN = "myplugin.admin";
    public static final String PERM_USE   = "myplugin.use";

    private PermissionManager() {}

    /** 檢查玩家是否擁有指定節點 */
    public static boolean has(Player player, String node) {
        return player.hasPermission(node);
    }

    /** 檢查玩家是否為管理員 */
    public static boolean isAdmin(Player player) {
        return player.hasPermission(PERM_ADMIN);
    }

    /** 檢查玩家是否可使用基本功能 */
    public static boolean canUse(Player player) {
        return player.hasPermission(PERM_USE);
    }

    /**
     * 在 plugin.yml 未宣告時，於執行期動態注冊權限（補救方案，一般不需要）。
     * 建議優先在 plugin.yml 宣告。
     */
    public static void registerDynamic(PluginManager pm) {
        Permission all = new Permission(PERM_ALL, "MyPlugin 所有權限", PermissionDefault.OP);
        safeRegister(pm, all);

        Permission admin = new Permission(PERM_ADMIN, "MyPlugin 管理員權限", PermissionDefault.OP);
        safeRegister(pm, admin);

        Permission use = new Permission(PERM_USE, "MyPlugin 一般使用權限", PermissionDefault.TRUE);
        safeRegister(pm, use);
    }

    private static void safeRegister(PluginManager pm, Permission perm) {
        try {
            pm.addPermission(perm);
        } catch (IllegalArgumentException ignored) {
            // 已存在，忽略
        }
    }
}
```

---

## 在主類中使用

```java
// onEnable()
// 若需要動態注冊（通常不需要，plugin.yml 已宣告）：
// PermissionManager.registerDynamic(getServer().getPluginManager());

// 在 CommandExecutor 中檢查：
if (!PermissionManager.isAdmin(player)) {
    player.sendMessage("§c你沒有執行此指令的權限。");
    return true;
}
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `hasPermission()` 永遠回傳 `false` | plugin.yml 未宣告該權限節點 | 在 `permissions:` 區段加入對應節點 |
| OP 玩家沒有子節點權限 | 根節點 `default: op` 但子節點未列入 `children` | 確認根節點 `children` 包含所有子節點 |
| `default: true` 設定沒效果 | 伺服器權限插件（如 LuckPerms）覆蓋了預設值 | 在權限插件中手動設定或使用 `isOp()` 作為備援 |
| 動態注冊拋出 `IllegalArgumentException` | 該節點名稱已被另一個插件注冊 | 使用 `safeRegister()` 包裝忽略重複注冊的例外 |
| 節點名稱大小寫不符 | Bukkit 權限節點大小寫敏感 | 統一使用全小寫，並在 `hasPermission()` 前不做大小寫轉換 |
