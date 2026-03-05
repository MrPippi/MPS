# examples — generate-event-listener

## 範例 1：PlayerJoinEvent + PlayerQuitEvent

**Input:**
```
event_names:
  - PlayerJoinEvent
  - PlayerQuitEvent
plugin_name: WelcomePlugin
priority: NORMAL
```

**Output — WelcomeListener.java:**
```java
package com.example.welcomeplugin.listener;

import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public class WelcomeListener implements Listener {

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerJoin(PlayerJoinEvent event) {
        event.setJoinMessage(null); // 隱藏原生訊息
        event.getPlayer().sendMessage("§a歡迎來到伺服器，" + event.getPlayer().getName() + "！");
    }

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerQuit(PlayerQuitEvent event) {
        event.setQuitMessage(null); // 隱藏原生訊息
    }
}
```

**Output — 在主類中注冊：**
```java
getServer().getPluginManager().registerEvents(new WelcomeListener(), this);
```

---

## 範例 2：BlockBreakEvent（保護特定方塊）

**Input:**
```
event_names:
  - BlockBreakEvent
plugin_name: ProtectPlugin
priority: HIGH
ignoreCancelled: true
```

**Output — BlockProtectListener.java:**
```java
public class BlockProtectListener implements Listener {

    private final ProtectPlugin plugin;

    public BlockProtectListener(ProtectPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        Block block = event.getBlock();

        if (plugin.getProtectionManager().isProtected(block.getLocation())) {
            if (!player.hasPermission("protectplugin.bypass")) {
                event.setCancelled(true);
                player.sendMessage("§c此區域受到保護，無法破壞方塊！");
            }
        }
    }
}
```

---

## 範例 3：EntityDamageByEntityEvent（PvP 控制）

**Input:**
```
event_names:
  - EntityDamageByEntityEvent
plugin_name: NoPvP
priority: LOWEST
```

**Output — PvpListener.java:**
```java
public class PvpListener implements Listener {

    @EventHandler(priority = EventPriority.LOWEST)
    public void onEntityDamageByEntity(EntityDamageByEntityEvent event) {
        if (!(event.getDamager() instanceof Player attacker)) return;
        if (!(event.getEntity() instanceof Player victim)) return;

        // 檢查是否在允許 PvP 的世界
        if (!attacker.getWorld().getPVP()) {
            event.setCancelled(true);
            attacker.sendMessage("§c此世界不允許 PvP！");
            return;
        }

        // 其他 PvP 邏輯 ...
    }
}
```

---

## 範例 4：多事件合併 Listener

**Input:**
```
event_names:
  - PlayerMoveEvent
  - PlayerTeleportEvent
  - PlayerRespawnEvent
plugin_name: SpawnProtect
```

**Output — SpawnListener.java（節錄）:**
```java
public class SpawnListener implements Listener {

    @EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
    public void onPlayerMove(PlayerMoveEvent event) {
        // 只比較方塊座標，避免頭部旋轉也觸發
        if (!event.hasChangedBlock()) return;
        // 移動邏輯 ...
    }

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPlayerTeleport(PlayerTeleportEvent event) {
        // 傳送邏輯 ...
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerRespawn(PlayerRespawnEvent event) {
        // 重生邏輯（MONITOR 確保最後執行）...
    }
}
```
