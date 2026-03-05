# examples — generate-cicd-workflow

## 範例 1：基本 build + test + release workflow

**Input:**
```
plugin_name: MyPlugin
java_version: 21
release_on_tag: true
```

**Output — .github/workflows/ci.yml:**
```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'
  pull_request:
    branches: [ main ]

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn -B clean package --no-transfer-progress

      - name: Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: MyPlugin-jar
          path: target/MyPlugin-*.jar
          if-no-files-found: error

  release:
    name: Publish Release
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build release JAR
        run: mvn -B clean package -DskipTests --no-transfer-progress

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: target/MyPlugin-*.jar
          generate_release_notes: true
```

---

## 範例 2：帶有 Javadoc 產生的 workflow

**Input:**
```
plugin_name: AdvancedPlugin
java_version: 17
release_on_tag: true
generate_javadoc: true
```

**Output — 額外的 javadoc job（節錄）:**
```yaml
  javadoc:
    name: Generate Javadoc
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven

      - name: Generate Javadoc
        run: mvn -B javadoc:javadoc --no-transfer-progress

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: target/site/apidocs
```

---

## 範例 3：多 Java 版本矩陣測試

**Input:**
```
plugin_name: CompatPlugin
java_versions: [17, 21]
release_on_tag: false
```

**Output — build job 使用 matrix strategy:**
```yaml
  build:
    strategy:
      matrix:
        java: [17, 21]
    name: Build (Java ${{ matrix.java }})
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK ${{ matrix.java }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ matrix.java }}
          distribution: 'temurin'
          cache: maven

      - name: Build & Test
        run: mvn -B clean verify --no-transfer-progress
```
