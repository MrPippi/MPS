---
id: generate-cicd-workflow
title: Generate CI/CD Workflow
titleZh: CI/CD 工作流程生成器
description: Generate GitHub Actions workflow with build, test, and release jobs for Minecraft plugins.
descriptionZh: 產生 GitHub Actions workflow，包含 build、test、release 三個 job。
version: "0.1.0"
status: planned
category: devops
categoryLabel: DevOps
categoryLabelEn: DevOps
tags: [cicd, github-actions, build, release, automation]
triggerKeywords:
  - "CI/CD"
  - "GitHub Actions"
  - "自動化部署"
  - "workflow"
updatedAt: "2026-03-05"
githubPath: Skills/generate-cicd-workflow/SKILL.md
featured: false
---

# Generate CI/CD Workflow Skill

> **狀態：規劃中** — 此 Skill 尚未完成，內容為預覽草稿。

## 目標

產生完整的 GitHub Actions CI/CD workflow，自動化 Minecraft 插件的建置、測試與發布流程。

---

## 預計產生的 Workflow 結構

```yaml
name: Build and Release

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: mvn clean package -DskipTests

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: mvn test

  release:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: softprops/action-gh-release@v2
```

---

## 支援功能

- Maven / Gradle 建置系統自動偵測
- Java 版本設定（11 / 17 / 21）
- MockBukkit 測試執行
- GitHub Release 自動建立與 JAR 上傳
