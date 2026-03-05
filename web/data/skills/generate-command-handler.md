---
id: generate-command-handler
title: Generate Command Handler
titleZh: 指令處理器生成器
description: Generate a Bukkit Command handler class with TabCompleter, permission nodes, and usage messages.
descriptionZh: 產生 Bukkit Command 處理類，含 TabCompleter、權限節點與使用說明。
version: "0.1.0"
status: planned
category: commands
categoryLabel: 指令系統
categoryLabelEn: Commands
tags: [command, tabcompleter, bukkit, permission]
triggerKeywords:
  - "指令處理"
  - "CommandExecutor"
  - "TabCompleter"
  - "新增指令"
updatedAt: "2026-03-05"
githubPath: Skills/generate-command-handler/SKILL.md
featured: false
---

# Generate Command Handler Skill

> **狀態：規劃中** — 此 Skill 尚未完成，內容為預覽草稿。

## 目標

依使用者提供的指令名稱與子指令清單，產生完整的 `CommandExecutor` + `TabCompleter` 實作類別。

---

## 預計產生的代碼

```java
public class MyCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                             String label, String[] args) {
        // 子指令路由邏輯
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command,
                                      String alias, String[] args) {
        // Tab 補全邏輯
        return List.of();
    }
}
```

---

## 支援功能

- 子指令路由（switch/case 或 Map 模式）
- 權限節點自動命名（`pluginname.command.subcommand`）
- 玩家 / 控制台執行環境判斷
- 參數數量驗證與使用說明回傳
