# Spigot / Paper API 完整參考

## 版本對應

| MC 版本 | API 重大變更 |
|---------|-------------|
| 1.16+   | Adventure API 取代 ChatColor |
| 1.17+   | `getLocation().getWorld()` 回傳 `@NotNull` |
| 1.19+   | 簽署訊息系統、Chat Event 更動 |
| 1.20+   | `ItemMeta.displayName()` 全面改用 Component |
| Paper   | `AsyncChatEvent` 取代 `AsyncPlayerChatEvent` |

## 常用事件清單

### 玩家事件
- `PlayerJoinEvent` / `PlayerQuitEvent`
- `PlayerMoveEvent`（高頻，需優化）
- `PlayerInteractEvent`（含 `Action` 判斷）
- `PlayerChatEvent`（Paper: `AsyncChatEvent`）
- `PlayerDeathEvent` / `PlayerRespawnEvent`
- `PlayerChangedWorldEvent`

### 方塊事件
- `BlockBreakEvent` / `BlockPlaceEvent`
- `BlockFromToEvent`（液體流動）
- `SignChangeEvent`

### 實體事件
- `EntityDamageEvent` / `EntityDamageByEntityEvent`
- `EntitySpawnEvent` / `EntityDeathEvent`
- `ProjectileHitEvent`

### 世界事件
- `ChunkLoadEvent` / `ChunkUnloadEvent`
- `WeatherChangeEvent`

## Paper 專屬 API

### AsyncChatEvent（Paper 1.19+）
```java
import io.papermc.paper.event.player.AsyncChatEvent;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;

@EventHandler
public void onChat(AsyncChatEvent event) {
    String message = PlainTextComponentSerializer.plainText()
        .serialize(event.message());
}
```

### RegionScheduler（Folia 相容）
```java
// 在特定 Location 的 Region 執行
plugin.getServer().getRegionScheduler().execute(plugin, location, () -> {
    // Region 安全操作
});
```

## pom.xml 依賴範例

```xml
<repositories>
    <repository>
        <id>papermc</id>
        <url>https://repo.papermc.io/repository/maven-public/</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>io.papermc.paper</groupId>
        <artifactId>paper-api</artifactId>
        <version>1.20.4-R0.1-SNAPSHOT</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```
