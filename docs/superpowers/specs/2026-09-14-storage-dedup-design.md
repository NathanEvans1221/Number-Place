# StorageManager 去重設計

日期：2026-09-14｜範圍：StorageManager 真共用（ES Module）｜不碰核心演算法

## 1. 背景與目標

`script.js:5-99` 內嵌的 `STORAGE_KEYS` + `StorageManager` 與
`src/storage.js` + `src/types.js` 邏輯完全重複。目標：以 `src/` 為
唯一來源，`script.js` 改為 import 使用，刪除約 95 行重複碼。

## 2. 架構

- Canonical：`src/storage.js`（`StorageManager`）、`src/types.js`
  （`STORAGE_KEYS`）維持不變，不改任何簽名與行為。
- `script.js` 轉為 ES Module，頂部
  `import { StorageManager } from './src/storage.js';`。
- `sudoku.html:79` 改為 `<script type="module" src="./script.js">`。
- `server.js` 已按副檔名回 `application/javascript`，`/src/*.js`
  可直接被瀏覽器載入，無需改動（需手動驗證）。

## 3. 異動清單

| 檔案 | 異動 |
|------|------|
| `sudoku.html:79` | `script` 加 `type="module"`、路徑改 `./script.js` |
| `script.js:1-99` | 刪除 `STORAGE_KEYS` + `StorageManager`，加 1 行 import |
| `src/storage.js`、`src/types.js` | 不動 |
| `README.md` | 使用方式改為必須走 http server（ES Module 在 `file://` 下被 CORS 擋下） |
| `tests/storage.test.js` | 新增（Bun 無 DOM，需 mock `localStorage`） |

`sudoku-core.js` 的重複（`DIFFICULTY/isValid/...`）本期刻意不碰，
控制爆炸半徑。

## 4. 資料流與錯誤處理

- 8 處呼叫點（`saveGame/loadGame/hasSavedGame/deleteSavedGame/`
  `saveTheme/loadTheme/addHistoryRecord/getHistoryRecords`）沿用
  同一 API，行為零變更。
- `localStorage` 不可用時既有 `try/catch`（回 `false`/`null` +
  `console.error`）保持不變。
- `file://` 直接開檔會載入失敗，屬已知限制，以 README 明示 +
  `server.js` / `python3 -m http.server` 為正規啟動方式。

## 5. 測試與驗收

- `bun test`：既有 28 例全綠 + 新增 storage 例（save/load
  round-trip、格式錯誤回 `null`、`hasSavedGame`、`theme` 預設
  `dark`、history 上限 50 筆）。
- 手動：`bun server.js`（或 `python3 -m http.server`）開
  `/sudoku.html`，驗存檔/讀檔/主題/歷史正常。
- `git diff --check` 通過；部署面 Cloudflare Pages（`wrangler.json`
  靜態目錄）不受影響。
