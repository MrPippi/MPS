# examples — nms-packet-interceptor

## 範例 1：記錄所有 Clientbound 封包（除錯用）

**Input:**
```
package_name: com.example.debug
handler_name: PacketLogger
manager_name: LoggerManager
handler_id: debug_packet_logger
```

**使用端:**
```java
// 在 onEnable()
LoggerManager manager = new LoggerManager(
    (player, inbound) -> {
        // Serverbound: 客戶端送來的封包
        getLogger().fine("[IN ] " + player.getName() + " → " + inbound.getClass().getSimpleName());
        return inbound;
    },
    (player, outbound) -> {
        // Clientbound: 伺服器送出的封包
        getLogger().fine("[OUT] " + player.getName() + " ← " + outbound.getClass().getSimpleName());
        return outbound;
    }
);
Bukkit.getPluginManager().registerEvents(new InterceptorListener(manager), this);

// 對已在線玩家手動 inject（reload 場景）
Bukkit.getOnlinePlayers().forEach(manager::inject);
```

---

## 範例 2：取消玩家的聊天封包（靜音系統）

**Input:**
```
package_name: com.example.mute
handler_name: MuteInterceptor
manager_name: MuteManager
handler_id: mute_interceptor
```

**使用端:**
```java
import net.minecraft.network.protocol.game.ServerboundChatPacket;

Set<UUID> mutedPlayers = ConcurrentHashMap.newKeySet();

MuteManager manager = new MuteManager(
    (player, packet) -> {
        // 攔截 Serverbound 聊天封包
        if (packet instanceof ServerboundChatPacket chat &&
            mutedPlayers.contains(player.getUniqueId())) {
            // 通知玩家（切回主執行緒）
            Bukkit.getScheduler().runTask(plugin, () ->
                player.sendMessage(Component.text("你已被靜音", NamedTextColor.RED)));
            return null; // 取消封包
        }
        return packet;
    },
    null // 不處理 outbound
);
```

---

## 範例 3：修改 Clientbound Scoreboard 封包（隱藏特定分數）

**Input:**
```
package_name: com.example.hidden
handler_name: HiddenScoreInterceptor
manager_name: HiddenScoreManager
handler_id: hidden_score
```

**使用端:**
```java
import net.minecraft.network.protocol.game.ClientboundSetScorePacket;

HiddenScoreManager manager = new HiddenScoreManager(
    null, // 不處理 inbound
    (player, packet) -> {
        if (packet instanceof ClientboundSetScorePacket scorePacket) {
            // 隱藏特定玩家的分數
            if (scorePacket.owner().equals("[HIDDEN]")) {
                return null; // 不讓玩家看到這筆
            }
        }
        return packet;
    }
);
```

---

## 範例 4：動畫延遲與速率限制（反外掛用途）

**Input:**
```
package_name: com.example.anticheat
handler_name: RateLimitInterceptor
manager_name: RateLimitManager
handler_id: rate_limit
```

**使用端：偵測單位時間內 ServerboundSwingPacket 頻率過高:**
```java
import net.minecraft.network.protocol.game.ServerboundSwingPacket;
import java.util.concurrent.ConcurrentHashMap;

Map<UUID, Deque<Long>> swingTimes = new ConcurrentHashMap<>();
long WINDOW_MS = 1000L;
int MAX_SWINGS = 20;

RateLimitManager manager = new RateLimitManager(
    (player, packet) -> {
        if (packet instanceof ServerboundSwingPacket) {
            Deque<Long> times = swingTimes.computeIfAbsent(
                player.getUniqueId(), k -> new ConcurrentLinkedDeque<>());
            long now = System.currentTimeMillis();
            times.add(now);
            while (!times.isEmpty() && now - times.peek() > WINDOW_MS) times.poll();

            if (times.size() > MAX_SWINGS) {
                // 觸發反外掛動作（async 安全呼叫）
                Bukkit.getScheduler().runTask(plugin, () ->
                    player.kick(Component.text("Auto-Clicker 偵測")));
                return null;
            }
        }
        return packet;
    },
    null
);
```
