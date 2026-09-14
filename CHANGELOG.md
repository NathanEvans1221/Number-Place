# 更新日誌

本專案的所有重要變更都會記錄在此檔案中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

## [Unreleased]

### 新增

- 加入 OpenCode goal 外掛設定（`@prevalentware/opencode-goal-plugin`），支援 `/goal` 長期目標模式。

### 文件

- 補上數獨功能增強計畫的 F1 稽核結果：Must Have 4/4、Must NOT Have 4/4、Tasks 10/10，結論為通過。
- 更新啟動方式為必須經由 HTTP 伺服器（ES Module 不支援 `file://` 直接開檔）。

### 重構

- `script.js` 共用 `src/storage.js` 的 `StorageManager`，刪除約 95 行重複實作；`sudoku.html` 改以 `type="module"` 載入。

### 測試

- 新增 `StorageManager` 回歸測試（存檔/讀檔、主題、歷史記錄上限 50 筆）；`bun test` 36 例全數通過。
- 將 `generatePuzzle` 改為純函數並補回歸測試。

## [1.0.0] - 2026-09-14

### 新增

- 經典 9x9 數獨遊戲：三種難度、即時驗證、候選數、提示、重置、計時器。
- 存檔/讀檔、撤回（多步）、主題切換、歷史記錄功能。
- Bun 靜態檔案伺服器（`server.js`）。
