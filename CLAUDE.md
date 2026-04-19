# MPS — Minecraft NMS Claude Code Skills

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What is This Repository

MPS (Minecraft NMS Claude Code Skills) 是一套專注於 **Paper NMS（net.minecraft.server）底層開發** 的 Claude Code Agent Skills 集合。

目標 MC 版本：**1.21 – 1.21.3**
目標映射：**Mojang mappings**（透過 Paperweight userdev）
執行時目錄：**`.claude/skills/`**（Claude Code 專用）
規範來源：**`Skills/`**（authoritative source，與 `.claude/skills/` 內容相同）

Web app（`web/`）暫時保留但內容待更新；當前優先是 Skills 結構。

### Repository Layout

```
MPS/
├── CLAUDE.md                            ← 本檔（Claude Code 入口）
├── README.md / README.zh-TW.md
├── .github/workflows/nextjs.yml
├── .claude/
│   └── skills/                          ← Claude Code 執行時
│       ├── skills-registry.yml
│       ├── _shared/
│       │   ├── nms-threading.md
│       │   └── nms-obfuscation.md
│       └── nms/
│           ├── nms-packet-sender/
│           ├── nms-packet-interceptor/
│           ├── nms-custom-entity/
│           ├── nms-reflection-bridge/
│           └── nms-version-adapter/
├── Skills/                              ← Canonical source（與 .claude/skills/ 鏡像）
│   ├── skills-registry.yml              ← v5.0.0，5 個 NMS 技能
│   ├── README.md
│   ├── _shared/
│   │   ├── nms-threading.md
│   │   └── nms-obfuscation.md
│   ├── paper-nms/
│   │   └── PLATFORM.md                  ← Paperweight + Mojang 建置設定
│   └── nms/
│       ├── nms-packet-sender/{SKILL.md, examples.md}
│       ├── nms-packet-interceptor/{SKILL.md, examples.md}
│       ├── nms-custom-entity/{SKILL.md, examples.md}
│       ├── nms-reflection-bridge/{SKILL.md, examples.md}
│       └── nms-version-adapter/{SKILL.md, examples.md}
├── .cursor/                             ← Cursor 設定（歷史殘留，不再維護）
├── docs/
│   └── paper-nms/                       ← NMS API 速查表（深度參考資料）
│       ├── packets.md                   ← Clientbound/Serverbound 封包目錄
│       ├── entities.md                  ← 實體類層次、Goal 系統、Attribute 常數
│       ├── network.md                   ← Netty pipeline 結構與執行緒模型
│       └── bukkit-nms-bridge.md         ← Bukkit ↔ NMS 橋接轉換表
└── web/                                 ← Next.js 文件站
```

---

## How to Use This Skills Library

當使用者要求產生 NMS 代碼時，一律遵循：

1. **檢查 `.claude/skills/skills-registry.yml`** — 找出 `trigger_keywords` 匹配請求的技能
2. **讀取對應的 `SKILL.md`** — 取得完整指引與範本
3. **查看 `examples.md`** — 理解多種使用情境
4. **讀取 `paper-nms/PLATFORM.md`** — 確認正確的 `build.gradle` 與依賴聲明
5. **閱讀 `_shared/nms-threading.md` 與 `_shared/nms-obfuscation.md`** — 理解執行緒與映射規則
6. **深度 API 查詢**：若 SKILL.md 範本無法涵蓋需求，查閱 `docs/paper-nms/`：
   - `docs/paper-nms/packets.md` — 封包類名與建構子簽名
   - `docs/paper-nms/entities.md` — 實體 AI、Goal 系統、Attribute 常數
   - `docs/paper-nms/network.md` — Netty pipeline 與執行緒模型
   - `docs/paper-nms/bukkit-nms-bridge.md` — CraftXxx 橋接轉換

**絕對不要** 憑記憶產生 NMS 代碼 — 一律先讀取相關 `SKILL.md`、`PLATFORM.md` 與 `docs/paper-nms/`。

---

## Platform Reference

| 項目 | 內容 |
|------|------|
| MC 版本 | 1.21 – 1.21.3 |
| Paper Dev Bundle | `1.21.1-R0.1-SNAPSHOT`（預設）、`1.21.3-R0.1-SNAPSHOT` |
| Paperweight | `io.papermc.paperweight.userdev` 1.7.2+ |
| Mapping | Mojang mappings（Paper 1.20.5+ runtime 原生支援） |
| Java | 21（toolchain） |
| 建置工具 | Gradle（Groovy DSL） |
| Javadoc | https://jd.papermc.io/paper/1.21/ |
| 平台檔案 | `Skills/paper-nms/PLATFORM.md` |

---

## Skills Index

所有技能以 `.claude/skills/skills-registry.yml` 為準。

| Skill ID | Category | Purpose |
|----------|----------|---------|
| `nms-packet-sender` | nms-packet | 發送自定義 Clientbound 封包 |
| `nms-packet-interceptor` | nms-packet | Netty pipeline 封包攔截與修改 |
| `nms-custom-entity` | nms-entity | 自定義 NMS 實體 + PathfinderGoal AI |
| `nms-reflection-bridge` | nms-bridge | 無 Paperweight 依賴的反射式 NMS 存取 |
| `nms-version-adapter` | nms-bridge | 多版本 NMS 相容的 Adapter 模式 |

---

## Workflow Rules

### 環境與版本

- **MC 版本範圍**：1.21 – 1.21.3
- **建置工具**：Gradle（Groovy DSL）— 不用 Maven
- **Java**：21（toolchain）
- **Paperweight**：預設所有 NMS skill 使用 Paperweight userdev
- **描述檔**：預設 `paper-plugin.yml`（非 `plugin.yml`）以確保 NMS 載入順序
- **註解**：所有存取 NMS 的類別加 `@SuppressWarnings("UnstableApiUsage")`

### 執行緒規則（NMS 特有）

| 情境 | 執行緒 |
|------|-------|
| 實體建立、世界寫入、`moveTo()`、`addFreshEntity()` | **Main thread** |
| `ServerPlayer.connection.send(packet)` | Any thread（Netty 自動排入 write queue） |
| 封包內容建構（依賴實體/世界狀態） | **Main thread** |
| Netty `channelRead` / `write` 內部 | **Netty IO thread**（禁呼叫 Bukkit API） |
| 阻塞 IO / DB / HTTP | Async（`Bukkit.getScheduler().runTaskAsynchronously`） |

Netty → Main 執行緒切換範例：

```java
@Override
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    if (msg instanceof ServerboundChatPacket chat) {
        // Netty 執行緒
        Bukkit.getScheduler().runTask(plugin, () -> {
            // 主執行緒：可安全操作 Bukkit/NMS 世界
            player.sendMessage(Component.text("Received"));
        });
    }
    super.channelRead(ctx, msg);
}
```

詳見 `Skills/_shared/nms-threading.md`。

### 映射與混淆

- **一律使用 Mojang mappings**（由 Paperweight 提供）
- Paper 1.20.5+ runtime 原生使用 Mojang mappings，無需 remap
- CraftBukkit 套件（如 `org.bukkit.craftbukkit.v1_21_R1`）的 `v1_21_R1` 部分**隨版本變動**；跨版本時用 `nms-reflection-bridge`
- 詳見 `Skills/_shared/nms-obfuscation.md`

### NMS 依賴宣告範本

```groovy
plugins {
    id 'java'
    id 'io.papermc.paperweight.userdev' version '1.7.2'
}

dependencies {
    paperweight.paperDevBundle('1.21.1-R0.1-SNAPSHOT')
}

java {
    toolchain.languageVersion = JavaLanguageVersion.of(21)
}
```

---

## Skills Structure

### Registry

`.claude/skills/skills-registry.yml` 與 `Skills/skills-registry.yml` **內容必須相同**，包含：

- `skills` 陣列：5 個 NMS 技能條目（`id`, `version`, `status`, `platform`, `category`, `skill_file`, `examples_file`, `inputs`, `outputs`, `tags`, `trigger_keywords`）
- `platforms` 陣列：`paper-nms` 平台定義
- `shared` 陣列：指向 `_shared/` 下的共享參考文件

### SKILL.md 結構

```markdown
---
name: nms-{skill-id}
description: "中英雙語描述（含 NMS Paperweight 要求）"
---

# Skill Title / 技能標題

## 技能名稱 / Skill Name
## 目的 / Purpose
## NMS 版本需求 / NMS Version Requirements
## 觸發條件 / Triggers
## 輸入參數 / Inputs
## 輸出產物 / Outputs
## Paperweight 建置設定 / Build Setup
## 代碼範本 / Code Template
## 推薦目錄結構 / Recommended Directory Structure
## 執行緒安全注意事項 / Thread Safety
## 失敗回退 / Fallback
```

### 新增技能流程（7 步）

1. 在 `Skills/nms/<slug>/` 建立目錄
2. 撰寫 `SKILL.md`（含 YAML frontmatter：`name`, `description`）
3. 撰寫 `examples.md`（**至少 2 個範例**，涵蓋不同使用情境）
4. 同步至 `.claude/skills/nms/<slug>/`
5. 將新條目加入 `Skills/skills-registry.yml` 與 `.claude/skills/skills-registry.yml`
6. 若涉及新平台，建立 `Skills/<platform>/PLATFORM.md`
7. 驗證觸發關鍵字無與既有技能衝突

---

## Web App (`web/`)

Web 文件站（Next.js 16，靜態匯出至 `web/out/`）目前仍含舊 Paper 技能內容；**待後續更新至 NMS**。當前 NMS 轉換的核心工作是 Skills 結構，Web 內容同步延後。

開發指令（保留自舊版）：

```bash
cd web
npm run dev           # dev server（http://localhost:3000）
npx tsc --noEmit      # TypeScript 型別檢查
npm run build         # 靜態匯出至 web/out/
```

### 技術堆疊

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6（App Router） |
| UI | React 19.2.3, TypeScript（strict） |
| Styling | Tailwind CSS v4 |
| Markdown | gray-matter, remark, remark-gfm, remark-html |
| Search | Fuse.js v7.1.0 |
| Deployment | GitHub Pages（`output: 'export'`） |

### 關鍵路徑

| Path | Purpose |
|------|---------|
| `web/data/skills/` | 每個技能一個 `.md`；YAML frontmatter 驅動所有元資料 |
| `web/config/site.ts` | `SITE_NAME`, `GITHUB_REPO_URL` 等常數 |
| `web/shared/types/skill.ts` | TypeScript 介面 |
| `web/features/skills/api/skills.ts` | 資料存取（模組級快取） |

---

## Git Workflow

- 預設分支：`main`（開發與 CI/CD deploy）
- 功能分支：`claude/*` 或描述性名稱
- Commit message：使用 imperative mood，引用技能 ID 或元件名
- 絕不跳過 CI 直接推 `main`

---

## Key Invariants

1. **雙路徑同步**：`Skills/nms/<path>/` 與 `.claude/skills/nms/<path>/` 內容必須相同。`skills-registry.yml` 同理。

2. **`.cursor/` 不再維護**：歷史殘留，日後可能移除；Claude Code 工作一律以 `.claude/skills/` 為準。

3. **MC 版本範圍**：所有技能預設支援 1.21 – 1.21.3；若需擴展版本，更新 `paper-nms/PLATFORM.md` 的對照表。

4. **Mojang mappings 強制**：不產生 Spigot/CraftBukkit 混淆映射的代碼。

5. **執行緒安全**：所有產生的 Java 代碼必須遵守平台執行緒規則（見 Workflow Rules）。

6. **雙語要求**：技能標題、描述、觸發關鍵字皆須中英並陳。

7. **無資料庫**：Web app 直讀檔案系統，不引入 DB。

8. **Paperweight 依賴預設**：五個核心 NMS 技能皆預設使用 Paperweight；若需避免，使用 `nms-reflection-bridge`。
