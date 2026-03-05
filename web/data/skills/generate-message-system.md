---
id: generate-message-system
title: Generate Message System
titleZh: 訊息系統生成器
description: Generate a messages.yml config file and MessageManager class supporting MiniMessage / Legacy formats and PlaceholderAPI placeholder replacement.
descriptionZh: 依訊息鍵值清單產生 messages.yml 設定檔與 MessageManager 類別，支援 MiniMessage / Legacy 格式、PlaceholderAPI 佔位符替換。
version: "1.0.0"
status: active
category: configuration
categoryLabel: 訊息系統
categoryLabelEn: Message System
tags: [message, minimessage, legacy, bukkit, config, papi]
triggerKeywords:
  - "訊息系統"
  - "MessageManager"
  - "messages.yml"
  - "MiniMessage"
  - "訊息管理"
updatedAt: "2026-03-05"
githubPath: Skills/generate-message-system/SKILL.md
featured: false
---

# Generate Message System Skill

## 目標

依使用者提供的訊息鍵值清單，自動產生：
- `messages.yml` 設定檔（含前綴、所有訊息鍵值、繁體中文預設值）
- `MessageManager.java` 工具類別（讀取、替換佔位符、傳送給玩家）

---

## 輸入參數

| 參數 | 說明 | 範例 |
|------|------|------|
| `message_keys` | 訊息鍵值清單 | `no-permission`, `reload-success` |
| `format` | 格式化系統 | `minimessage`（預設）或 `legacy` |
| `use_papi` | 是否整合 PlaceholderAPI | `true` / `false` |

---

## 輸出規格

### messages.yml

```yaml
prefix: "<dark_aqua>[MyPlugin]</dark_aqua> "

messages:
  no-permission: "<red>你沒有執行此操作的權限。</red>"
  player-only: "<yellow>此指令僅限玩家執行。</yellow>"
  reload-success: "<green>設定檔已重新載入。</green>"
```

---

### MessageManager.java（MiniMessage 版）

```java
public class MessageManager {

    private static final MiniMessage MM = MiniMessage.miniMessage();
    private final JavaPlugin plugin;
    private FileConfiguration messages;
    private String prefix;

    public MessageManager(JavaPlugin plugin) {
        this.plugin = plugin;
        reload();
    }

    public void reload() {
        File file = new File(plugin.getDataFolder(), "messages.yml");
        if (!file.exists()) plugin.saveResource("messages.yml", false);
        messages = YamlConfiguration.loadConfiguration(file);
        prefix = messages.getString("prefix", "<dark_aqua>[Plugin]</dark_aqua> ");
    }

    public Component get(String key, Map<String, String> placeholders) {
        String raw = messages.getString("messages." + key,
            "<red>Missing: " + key + "</red>");
        TagResolver.Builder resolver = TagResolver.builder();
        placeholders.forEach((k, v) -> resolver.resolver(Placeholder.parsed(k, v)));
        return MM.deserialize(prefix, resolver.build())
            .append(MM.deserialize(raw, resolver.build()));
    }

    public void send(CommandSender sender, String key) {
        sender.sendMessage(get(key, Map.of()));
    }
}
```

---

## 在主類中初始化

```java
private MessageManager messageManager;

@Override
public void onEnable() {
    saveResource("messages.yml", false);
    this.messageManager = new MessageManager(this);
}
```
