---
id: nms-version-adapter
title: NMS Version Adapter
titleZh: NMS 多版本適配器
description: Abstract adapter interface with version-specific implementations and runtime dispatch for multi-version NMS compatibility across Paper 1.21.x versions.
descriptionZh: 抽象 Adapter 介面搭配版本特定實作與 runtime dispatch，讓同一 plugin 支援多個 Paper 1.21.x 版本。
version: "1.0.0"
status: active
category: nms-bridge
categoryLabel: NMS 橋接
categoryLabelEn: NMS Bridge
tags: [nms, adapter, multi-version, strategy-pattern, paperweight]
triggerKeywords:
  - "version adapter"
  - "版本適配器"
  - "multi-version"
  - "多版本相容"
  - "adapter pattern NMS"
updatedAt: "2026-04-19"
githubPath: Skills/nms/nms-version-adapter/SKILL.md
featured: false
---

# NMS Version Adapter

## 目的

建立抽象 Adapter 介面定義共通 NMS 操作，為每個支援的 MC 版本提供具體實作，runtime 時根據伺服器版本自動選擇。

---

## 平台需求

- Paper 1.21 – 1.21.3
- 建議搭配 multi-module Gradle build（每個版本各自 module 使用 Paperweight 編譯）

---

## 產生的代碼

### NmsAdapter.java（介面）

```java
public interface NmsAdapter {
    NmsVersion version();
    void sendActionBar(Player player, Component message);
    int getLatency(Player player);
    void spawnParticleClient(Location loc, String particleKey, int count);
}
```

### AdapterRegistry.java

```java
// 啟動時注冊各版本 adapter
AdapterRegistry.register(new V1_21_Adapter());
AdapterRegistry.register(new V1_21_3_Adapter());
AdapterRegistry.initialize(); // 自動偵測版本並選擇

// 使用（版本無關）
AdapterRegistry.get().sendActionBar(player, Component.text("歡迎！"));
```

### NmsVersion.java

```java
public enum NmsVersion {
    V1_21, V1_21_1, V1_21_3, UNSUPPORTED;

    public static NmsVersion detect() {
        return switch (Bukkit.getMinecraftVersion()) {
            case "1.21" -> V1_21;
            case "1.21.1" -> V1_21_1;
            case "1.21.3" -> V1_21_3;
            default -> UNSUPPORTED;
        };
    }
}
```

---

## Multi-module Gradle 結構

```
my-plugin/
├── core/           # NmsAdapter 介面（只依賴 paper-api）
├── adapter-v1_21/  # Paperweight 1.21.1 編譯
├── adapter-v1_21_3/# Paperweight 1.21.3 編譯
└── plugin/         # shadowJar 整合打包
```
