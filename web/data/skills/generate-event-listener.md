---
id: generate-event-listener
title: Generate Event Listener
titleZh: 事件監聽器生成器
description: Generate a Bukkit Event Listener class that listens to specified events with common boilerplate logic.
descriptionZh: 產生 Bukkit Event Listener 類，監聽指定事件並套用常見樣板邏輯。
version: "1.0.0"
status: active
category: events
categoryLabel: 事件系統
categoryLabelEn: Events
tags: [event, listener, bukkit, eventhandler]
triggerKeywords:
  - "監聽事件"
  - "Listener"
  - "EventHandler"
  - "事件監聽"
updatedAt: "2026-03-05"
githubPath: Skills/generate-event-listener/SKILL.md
featured: false
---

# Generate Event Listener Skill


## 目標

依使用者指定的事件清單，產生完整的 `Listener` 實作類別，含正確的 `@EventHandler` 註解、優先級設定與常見判斷邏輯。

---

## 支援事件分類

- **玩家事件**：PlayerJoinEvent、PlayerQuitEvent、PlayerMoveEvent 等
- **方塊事件**：BlockBreakEvent、BlockPlaceEvent 等
- **實體事件**：EntityDamageEvent、EntitySpawnEvent 等
- **世界事件**：ChunkLoadEvent、WeatherChangeEvent 等
- **Paper 專屬**：AsyncChatEvent（Paper 1.19+）

---

## 預計輸出

```java
@EventHandler(priority = EventPriority.NORMAL, ignoreCancelled = true)
public void onPlayerJoin(PlayerJoinEvent event) {
    Player player = event.getPlayer();
    // 自動填入常見操作樣板
}
```
