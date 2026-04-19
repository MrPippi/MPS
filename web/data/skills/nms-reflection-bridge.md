---
id: nms-reflection-bridge
title: NMS Reflection Bridge
titleZh: NMS 反射橋接器
description: Access NMS internals via cached MethodHandle without Paperweight compile dependency, enabling cross-version compatibility in a single JAR.
descriptionZh: 透過 MethodHandle 快取存取 NMS，不需 Paperweight 編譯依賴，同一 JAR 可在多個 MC 版本執行。
version: "1.0.0"
status: active
category: nms-bridge
categoryLabel: NMS 橋接
categoryLabelEn: NMS Bridge
tags: [nms, reflection, method-handle, cross-version, no-paperweight]
triggerKeywords:
  - "reflection bridge"
  - "反射橋接"
  - "NMS reflection"
  - "跨版本 NMS"
  - "cross-version"
  - "避開 Paperweight"
  - "no paperweight"
updatedAt: "2026-04-19"
githubPath: Skills/nms/nms-reflection-bridge/SKILL.md
featured: false
---

# NMS Reflection Bridge

## 目的

提供不依賴 Paperweight userdev 的 NMS 存取方式，透過 Java reflection 與 `MethodHandle` 快取取得跨版本相容性。適用於需要在多個 MC 版本發佈的 plugin。

> 若只需單一版本，優先使用 Paperweight 原生 API（更簡潔、型別安全）。

---

## 平台需求

- Paper 1.20.5+（原生使用 Mojang mappings，無需 remap）
- 不需 Paperweight 編譯依賴
- 僅需 `paper-api` 或 `spigot-api`

---

## 產生的代碼

### MethodHandleCache.java

```java
public final class MethodHandleCache {
    private static final Map<String, MethodHandle> METHOD_CACHE = new ConcurrentHashMap<>();

    public static MethodHandle method(Class<?> owner, String name, Class<?>... params) {
        return METHOD_CACHE.computeIfAbsent(key, k -> {
            Method m = owner.getDeclaredMethod(name, params);
            m.setAccessible(true);
            return LOOKUP.unreflect(m);
        });
    }

    public static MethodHandle fieldGetter(Class<?> owner, String name) {
        // 類似 method()，回傳 field getter handle
    }
}
```

### NmsBridge.java

```java
// 取得 NMS ServerPlayer
Object nmsPlayer = NmsBridge.getHandle(player);

// 發送封包（反射呼叫 connection.send）
NmsBridge.sendPacket(player, nmsPacket);

// 動態建立 NMS 物件
Object packet = NmsBridge.newInstance("net.minecraft.network.protocol.game.ClientboundSetActionBarTextPacket");
```

---

## 執行緒安全

- `MethodHandleCache` 使用 `ConcurrentHashMap`，多執行緒安全
- `MethodHandle` 本身執行緒安全，可跨執行緒重用
- 反射呼叫的 NMS 方法仍需遵守主執行緒規則
