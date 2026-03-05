---
id: generate-permission-system
title: Generate Permission System
titleZh: 權限系統生成器
description: Generate a PermissionManager utility class and plugin.yml permissions declarations with inheritance tree design based on provided permission nodes.
descriptionZh: 依提供的權限節點清單，產生 PermissionManager 工具類別與 plugin.yml permissions 區段宣告，含繼承樹設計與預設值設定。
version: "1.0.0"
status: active
category: permission
categoryLabel: 權限系統
categoryLabelEn: Permission
tags: [permission, bukkit, plugin-yml, permission-node, inheritance]
triggerKeywords:
  - "權限系統"
  - "PermissionManager"
  - "permission node"
  - "權限節點"
  - "plugin.yml 權限"
  - "權限繼承"
updatedAt: "2026-03-05"
githubPath: Skills/generate-permission-system/SKILL.md
featured: false
---

# Generate Permission System Skill

## 目標

依使用者提供的插件名稱與權限節點清單，自動產生：
- `PermissionManager.java` 工具類別（靜態方法封裝）
- `plugin.yml` 的 `permissions:` 區段（含描述、default、children 繼承）

---

## 輸入參數

| 參數 | 範例 | 說明 |
|------|------|------|
| `plugin_name` | `MyPlugin` | 插件名稱（CamelCase） |
| `permission_nodes` | `myplugin.admin`, `myplugin.use` | 權限節點清單 |
| `default_op_only` | `true` / `false` | 預設是否僅 OP 可用 |

---

## 輸出規格

### plugin.yml permissions 區段

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

### PermissionManager.java

```java
package com.example.myplugin.manager;

import org.bukkit.entity.Player;

public final class PermissionManager {

    public static final String PERM_ALL   = "myplugin.*";
    public static final String PERM_ADMIN = "myplugin.admin";
    public static final String PERM_USE   = "myplugin.use";

    private PermissionManager() {}

    public static boolean has(Player player, String node) {
        return player.hasPermission(node);
    }

    public static boolean isAdmin(Player player) {
        return player.hasPermission(PERM_ADMIN);
    }

    public static boolean canUse(Player player) {
        return player.hasPermission(PERM_USE);
    }
}
```

---

## 使用範例

```java
if (!PermissionManager.isAdmin(player)) {
    player.sendMessage("§c你沒有執行此指令的權限。");
    return true;
}
```
