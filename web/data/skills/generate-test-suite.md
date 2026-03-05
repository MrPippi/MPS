---
id: generate-test-suite
title: Generate Test Suite
titleZh: 測試套件生成器
description: Generate a JUnit 5 + MockBukkit test suite skeleton based on a plugin main class.
descriptionZh: 依插件主類產生 JUnit 5 + MockBukkit 測試套件骨架。
version: "1.0.0"
status: active
category: testing
categoryLabel: 測試
categoryLabelEn: Testing
tags: [test, junit5, mockbukkit, unit-test]
triggerKeywords:
  - "測試"
  - "MockBukkit"
  - "JUnit"
  - "單元測試"
updatedAt: "2026-03-05"
githubPath: Skills/generate-test-suite/SKILL.md
featured: false
---

# Generate Test Suite Skill


## 目標

依插件主類與功能說明，產生 JUnit 5 + MockBukkit 測試骨架，涵蓋插件初始化、指令執行、事件觸發等常見測試場景。

---

## 依賴設定

```xml
<dependency>
    <groupId>com.github.seeseemelk</groupId>
    <artifactId>MockBukkit-v1.20</artifactId>
    <version>3.86.0</version>
    <scope>test</scope>
</dependency>
```

---

## 預計產生的測試骨架

```java
@ExtendWith(MockBukkitExtension.class)
class MyPluginTest {

    private MyPlugin plugin;
    private ServerMock server;

    @BeforeEach
    void setUp() {
        server = MockBukkit.mock();
        plugin = MockBukkit.load(MyPlugin.class);
    }

    @Test
    void testPluginEnables() {
        assertTrue(plugin.isEnabled());
    }
}
```
