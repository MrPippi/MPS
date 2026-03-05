---
name: generate-permission-system
description: 依使用者提供的權限節點清單，產生完整的 Bukkit PermissionManager 工具類別、plugin.yml permissions 區段宣告，含繼承樹設計、預設值設定、OP 判斷。當使用者說「幫我建立權限系統」、「PermissionManager」、「permission node」、「權限節點」時自動應用。
version: "1.0.0"
---

# Skill: generate-permission-system

## 適用情境

當使用者提供插件名稱與權限節點清單，自動產生：
- `PermissionManager.java` 工具類別（靜態方法封裝）
- `plugin.yml` 的 `permissions:` 區段（含描述、default、children 繼承）

---

## 必要輸入

| 參數 | 說明 | 範例 |
|------|------|------|
| `plugin_name` | 插件名稱（CamelCase） | `MyPlugin` |
| `permission_nodes` | 權限節點清單（可含子節點） | `myplugin.admin`, `myplugin.use` |
| `default_op_only` | 預設是否僅 OP 可用（true/false） | `true` |

---

## 輸出規格

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

## 產生步驟

1. **讀取輸入**：取得 `plugin_name`、`permission_nodes`、`default_op_only`
2. **推導節點樹**：
   - 自動生成根萬用節點 `pluginid.*`（小寫 plugin_name）
   - 將所有節點列為 children
3. **產生 plugin.yml permissions 區段**（YAML）
4. **產生 PermissionManager.java**（靜態工具類，含每個節點的常數與便捷方法）
5. **說明如何在主類/指令中調用**

---

## 觸發關鍵詞

- 「幫我建立權限系統」
- 「PermissionManager」
- 「permission node」
- 「權限節點」
- 「plugin.yml 權限」
- 「權限繼承」
