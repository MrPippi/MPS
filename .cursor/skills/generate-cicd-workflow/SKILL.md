---
name: generate-cicd-workflow
description: 為 Bukkit/Paper 插件 Maven 專案產生 GitHub Actions CI/CD workflow，包含 build、test、release 三個 job，支援自動版本打標籤、上傳 JAR 至 Release。當使用者說「幫我建立 CI/CD」、「GitHub Actions workflow」、「自動化部署插件」、「自動發布 JAR」時自動應用。
---

# Generate CI/CD Workflow Skill

## 目標

為 Minecraft 插件 Maven 專案產生完整的 GitHub Actions workflow，涵蓋：
- **CI**：每次 push/PR 自動編譯 + 測試
- **Release**：推送版本 tag 時自動打包並發布至 GitHub Releases

---

## 使用流程

1. **詢問專案資訊**：Java 版本、是否有單元測試、Release JAR 命名規則
2. **產生 CI workflow**：`ci.yml`（build + test）
3. **產生 Release workflow**：`release.yml`（tag → GitHub Release）
4. **說明如何觸發 Release**：`git tag v1.0.0 && git push --tags`

---

## 代碼範本

### .github/workflows/ci.yml（Build + Test）

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build & Test

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn clean package -DskipTests

      - name: Run Tests
        run: mvn test

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: plugin-jar
          path: target/*.jar
          retention-days: 7
```

---

### .github/workflows/release.yml（Tag → GitHub Release）

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    name: Build & Release
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Extract version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF_NAME#v}" >> $GITHUB_OUTPUT

      - name: Set Maven version
        run: mvn versions:set -DnewVersion=${{ steps.version.outputs.VERSION }} -DgenerateBackupPoms=false

      - name: Build with Maven
        run: mvn clean package -DskipTests

      - name: Run Tests
        run: mvn test

      - name: Get JAR filename
        id: jar
        run: echo "JAR=$(ls target/*.jar | grep -v original | head -1)" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: "Release ${{ github.ref_name }}"
          body: |
            ## ${{ github.ref_name }}

            ### 下載
            請下載下方的 JAR 檔案並放入伺服器 `plugins/` 目錄。

            ### 變更記錄
            <!-- 在此填寫變更內容 -->
          files: ${{ steps.jar.outputs.JAR }}
          draft: false
          prerelease: ${{ contains(github.ref_name, '-') }}
```

---

### .github/workflows/ci-release.yml（合併版：CI + Release）

```yaml
name: CI & Release

on:
  push:
    branches: [main]
    tags:
      - 'v*.*.*'
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build & Test
    outputs:
      jar-path: ${{ steps.jar.outputs.JAR }}
      version: ${{ steps.version.outputs.VERSION }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Extract version
        id: version
        run: |
          if [[ "${GITHUB_REF}" == refs/tags/* ]]; then
            echo "VERSION=${GITHUB_REF_NAME#v}" >> $GITHUB_OUTPUT
          else
            echo "VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)" >> $GITHUB_OUTPUT
          fi

      - name: Build
        run: mvn clean package -DskipTests

      - name: Test
        run: mvn test

      - name: Get JAR path
        id: jar
        run: echo "JAR=$(ls target/*.jar | grep -v original | head -1)" >> $GITHUB_OUTPUT

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: plugin-${{ steps.version.outputs.VERSION }}
          path: ${{ steps.jar.outputs.JAR }}

  release:
    needs: build
    runs-on: ubuntu-latest
    name: GitHub Release
    if: startsWith(github.ref, 'refs/tags/v')
    permissions:
      contents: write

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: plugin-${{ needs.build.outputs.version }}
          path: artifacts/

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: artifacts/*.jar
          generate_release_notes: true
          prerelease: ${{ contains(github.ref_name, '-') }}
```

---

## 如何發布新版本

```bash
# 1. 確認 pom.xml 版本號（或讓 workflow 自動覆蓋）
# 2. 建立 tag 並推送
git tag v1.2.0
git push origin v1.2.0

# 3. GitHub Actions 自動觸發 release workflow
# 4. GitHub Releases 頁面會出現新的 Release 與 JAR 下載連結
```

---

## 可選進階設定

### 加入 Java 版本矩陣測試

```yaml
strategy:
  matrix:
    java: [17, 21]
steps:
  - uses: actions/setup-java@v4
    with:
      java-version: ${{ matrix.java }}
      distribution: 'temurin'
```

### 快取 Maven 本地倉庫加速

```yaml
- uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'temurin'
    cache: maven
```

### 發布至 Hangar（PaperMC 插件平台）

```yaml
- name: Publish to Hangar
  uses: pylakey/action-hangar-publish@v1
  with:
    api-key: ${{ secrets.HANGAR_API_KEY }}
    version: ${{ steps.version.outputs.VERSION }}
    files: target/*.jar
```

---

## 常見錯誤與修正

| 錯誤 | 原因 | 修正 |
|------|------|------|
| `Resource not accessible by integration` | Release job 缺少 write 權限 | 在 job 或 workflow 層級加上 `permissions: contents: write` |
| JAR 找不到 | `target/` 路徑不正確 | 用 `ls target/` 確認輸出檔名 |
| Tag 格式不觸發 | Tag 不符合 `v*.*.*` 規則 | 確認 tag 格式，例如 `v1.0.0` |
| Maven 測試失敗阻擋 Release | CI 與 Release 同一 job | 拆成兩個 job，Release `needs: build` |
| `original-*.jar` 被上傳 | Shade plugin 產生兩個 JAR | 用 `grep -v original` 過濾 |
