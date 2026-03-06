---
name: generate-message-system
description: 依使用者提供的訊息鍵值清單，產生 messages.yml 設定檔與 MessageManager Java 類別，支援 MiniMessage / Legacy 格式、PlaceholderAPI 佔位符替換、前綴設定。當使用者說「幫我建立訊息系統」、「MessageManager」、「messages.yml」、「MiniMessage」時自動應用。
---

# Generate Message System Skill

## 目標

依使用者提供的訊息鍵值清單，自動產生：
- `messages.yml` 設定檔（含前綴、所有訊息鍵值、繁體中文預設值）
- `MessageManager.java` 工具類別（讀取、替換佔位符、傳送給玩家/控制台）

---

## 使用流程

1. **詢問訊息鍵值清單**：使用者列出需要的訊息 key（例：`no-permission`, `reload-success`）
2. **詢問格式化系統**：`minimessage`（推薦）或 `legacy`（舊版色碼）
3. **詢問是否整合 PlaceholderAPI**：是否需要 `%player_name%` 等佔位符
4. **產生 messages.yml**：含前綴與所有訊息鍵值的繁體中文預設值
5. **產生 MessageManager.java**：依選擇格式輸出對應版本
6. **說明在主類中的初始化方式**

---

## 輸入參數說明

| 參數 | 說明 | 範例 |
|------|------|------|
| `message_keys` | 訊息鍵值清單 | `no-permission`, `player-only`, `reload-success` |
| `format` | 格式化系統 | `minimessage`（預設）或 `legacy`（&a, &c 色碼） |
| `use_papi` | 是否整合 PlaceholderAPI | `true` / `false` |

---

## 代碼範本

### 1. messages.yml

```yaml
# MPS — messages.yml
# 支援 MiniMessage 格式：https://docs.advntr.dev/minimessage/format.html
# 顏色標籤範例：<green>成功</green>、<red>錯誤</red>、<yellow>警告</yellow>
# 若使用 Legacy 格式（legacy: true），請使用 &a、&c、&e 等色碼。

prefix: "<dark_aqua>[MyPlugin]</dark_aqua> "

messages:
  no-permission: "<red>你沒有執行此操作的權限。</red>"
  player-only: "<yellow>此指令僅限玩家執行。</yellow>"
  reload-success: "<green>設定檔已重新載入。</green>"
  invalid-args: "<red>用法錯誤。請輸入 /<command> help 查看說明。</red>"
```

**規則：**
- 前綴統一放在 `prefix` 鍵，MessageManager 自動附加
- MiniMessage 格式使用 `<tag>` 語法；Legacy 格式使用 `&` 色碼
- 使用 `{placeholder}` 表示動態替換的佔位符

---

### 2. MessageManager.java（MiniMessage 版本）

```java
package com.example.myplugin.manager;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import net.kyori.adventure.text.minimessage.tag.resolver.TagResolver;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.util.Map;

/**
 * MyPlugin 訊息管理員
 * 從 messages.yml 讀取訊息，支援 MiniMessage 格式與佔位符替換。
 */
public class MessageManager {

    private static final MiniMessage MM = MiniMessage.miniMessage();

    private final JavaPlugin plugin;
    private FileConfiguration messages;
    private String prefix;

    public MessageManager(JavaPlugin plugin) {
        this.plugin = plugin;
        reload();
    }

    /** 重新載入 messages.yml */
    public void reload() {
        File file = new File(plugin.getDataFolder(), "messages.yml");
        if (!file.exists()) {
            plugin.saveResource("messages.yml", false);
        }
        messages = YamlConfiguration.loadConfiguration(file);
        prefix = messages.getString("prefix", "<dark_aqua>[Plugin]</dark_aqua> ");
    }

    /**
     * 取得訊息 Component（已附加前綴）
     *
     * @param key         messages.yml 中的鍵（例如 "no-permission"）
     * @param placeholders 成對的鍵值替換（例如 "player", player.getName()）
     */
    public Component get(String key, Map<String, String> placeholders) {
        String raw = messages.getString("messages." + key, "<red>Missing message: " + key + "</red>");

        TagResolver.Builder resolver = TagResolver.builder();
        placeholders.forEach((k, v) ->
            resolver.resolver(Placeholder.parsed(k, v))
        );

        Component msg = MM.deserialize(raw, resolver.build());
        Component pre = MM.deserialize(prefix);
        return pre.append(msg);
    }

    /** 取得訊息 Component（無佔位符替換） */
    public Component get(String key) {
        return get(key, Map.of());
    }

    /** 傳送訊息給 CommandSender */
    public void send(CommandSender sender, String key, Map<String, String> placeholders) {
        sender.sendMessage(get(key, placeholders));
    }

    /** 傳送訊息給 CommandSender（無佔位符替換） */
    public void send(CommandSender sender, String key) {
        sender.sendMessage(get(key));
    }
}
```

---

### 3. MessageManager.java（Legacy 版本）

```java
package com.example.myplugin.manager;

import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.util.Map;

/**
 * MyPlugin 訊息管理員（Legacy 色碼版）
 * 從 messages.yml 讀取訊息，支援 & 色碼與簡單字串替換。
 */
public class MessageManager {

    private final JavaPlugin plugin;
    private FileConfiguration messages;
    private String prefix;

    public MessageManager(JavaPlugin plugin) {
        this.plugin = plugin;
        reload();
    }

    public void reload() {
        File file = new File(plugin.getDataFolder(), "messages.yml");
        if (!file.exists()) {
            plugin.saveResource("messages.yml", false);
        }
        messages = YamlConfiguration.loadConfiguration(file);
        prefix = color(messages.getString("prefix", "&8[Plugin]&r "));
    }

    public String get(String key, Map<String, String> placeholders) {
        String raw = messages.getString("messages." + key, "&cMissing message: " + key);
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            raw = raw.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return prefix + color(raw);
    }

    public String get(String key) {
        return get(key, Map.of());
    }

    public void send(CommandSender sender, String key, Map<String, String> placeholders) {
        sender.sendMessage(get(key, placeholders));
    }

    public void send(CommandSender sender, String key) {
        sender.sendMessage(get(key));
    }

    private static String color(String text) {
        return ChatColor.translateAlternateColorCodes('&', text);
    }
}
```

---

## PlaceholderAPI 整合（選用）

當 `use_papi: true` 時，在 `get()` 方法中加入 PAPI 解析：

```java
// 在 messages.yml 中可使用 %player_name%、%vault_eco_balance% 等
import me.clip.placeholderapi.PlaceholderAPI;
import org.bukkit.entity.Player;

public Component get(Player player, String key, Map<String, String> placeholders) {
    String raw = messages.getString("messages." + key, "<red>Missing: " + key + "</red>");
    // PAPI 解析（需先替換 PAPI 佔位符，再做 MiniMessage 解析）
    if (plugin.getServer().getPluginManager().isPluginEnabled("PlaceholderAPI")) {
        raw = PlaceholderAPI.setPlaceholders(player, raw);
    }
    // ... 後續 MiniMessage 解析同上
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

public MessageManager getMessageManager() {
    return messageManager;
}
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `missing message: xxx` 顯示在遊戲中 | messages.yml 中找不到該 key | 確認鍵名拼寫正確，確保 `messages.yml` 包含該 key |
| MiniMessage 標籤未渲染（顯示原始 `<red>`）| 使用 Legacy 模式但訊息是 MiniMessage 格式 | 確認 `format` 設定與訊息格式一致 |
| `FileNotFoundException` 於 reload() | messages.yml 不存在且未呼叫 `saveResource` | 在 `onEnable()` 呼叫 `saveResource("messages.yml", false)` |
| PlaceholderAPI 佔位符未替換 | PAPI 未安裝或 `setPlaceholders()` 未呼叫 | 確認伺服器已安裝 PlaceholderAPI，且 `use_papi: true` 時有正確整合 |
| 前綴重複出現 | 在 messages.yml 的訊息值中又加了前綴 | 前綴統一由 `MessageManager` 附加，訊息值本身不含前綴 |
