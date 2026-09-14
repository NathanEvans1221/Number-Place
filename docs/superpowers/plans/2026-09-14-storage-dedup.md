# StorageManager 去重 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 刪除 `script.js` 內重複的 StorageManager，以 `src/storage.js` 為唯一來源並補測試。

**Architecture:** `script.js` 轉 ES Module 並 import canonical 實作；`sudoku.html` 加 `type="module"`；行為零變更。

**Tech Stack:** Vanilla JS (ES Module)、Bun (`bun test`、`bun server.js`)、localStorage。

**Spec:** `docs/superpowers/specs/2026-09-14-storage-dedup-design.md`

## Global Constraints

- `src/storage.js`、`src/types.js` 簽名與行為不動。
- `sudu-core` 重複本期不碰。
- `file://` 直接開檔不再支援，正規啟動為 http server。
- Commit 格式 `<type>(<scope>): <subject>`，主旨繁體中文。

---

### Task 1: 新增 StorageManager 回歸測試

**Files:**
- Create: `tests/storage.test.js`
- Modify: 無
- Test: `tests/storage.test.js`

**Interfaces:**
- Consumes: `StorageManager`（`src/storage.js`）、`STORAGE_KEYS`（`src/types.js`）、Bun 內建 `bun:test`。
- Produces: 覆蓋 save/load/validate/theme/history 的測試套件；後續 Task 改 `script.js` 時以此套件守行為。

- [x] **Step 1: 先寫無 mock 版，確認在 Bun 下失敗**

```js
import { describe, test, expect } from 'bun:test';
import { StorageManager } from '../src/storage.js';

describe('storage smoke', () => {
    test('saveGame 可寫入', () => {
        expect(StorageManager.saveGame({
            difficulty: 'easy', board: [], puzzle: [],
            userBoard: [], seconds: 0, showCandidates: false
        })).toBe(true);
    });
});
```

Run: `bun test tests/storage.test.js`
Expected: FAIL（`localStorage is not defined`，證明 Bun 無 DOM，需 mock）

- [x] **Step 2: 寫入完整測試（含 in-memory localStorage mock）**

```js
import { describe, test, expect, beforeEach } from 'bun:test';
import { StorageManager } from '../src/storage.js';

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
};

const saveData = () => ({
    difficulty: 'medium',
    board: Array(9).fill(null).map(() => Array(9).fill(1)),
    puzzle: Array(9).fill(null).map(() => Array(9).fill(1)),
    userBoard: Array(9).fill(null).map(() => Array(9).fill(1)),
    seconds: 42,
    showCandidates: true
});

describe('StorageManager.saveGame/loadGame', () => {
    beforeEach(() => { store.clear(); });

    test('round-trip 保留欄位', () => {
        expect(StorageManager.saveGame(saveData())).toBe(true);
        const loaded = StorageManager.loadGame();
        expect(loaded.difficulty).toBe('medium');
        expect(loaded.seconds).toBe(42);
        expect(loaded.showCandidates).toBe(true);
        expect(loaded.board.length).toBe(9);
    });

    test('無存檔回 null', () => {
        expect(StorageManager.loadGame()).toBeNull();
        expect(StorageManager.hasSavedGame()).toBe(false);
    });

    test('格式錯誤回 null', () => {
        store.set('sudoku-save', JSON.stringify({ foo: 1 }));
        expect(StorageManager.loadGame()).toBeNull();
    });

    test('deleteSavedGame 清除', () => {
        StorageManager.saveGame(saveData());
        expect(StorageManager.hasSavedGame()).toBe(true);
        StorageManager.deleteSavedGame();
        expect(StorageManager.hasSavedGame()).toBe(false);
    });
});

describe('StorageManager theme', () => {
    beforeEach(() => { store.clear(); });

    test('預設 dark，切換 light 可讀回', () => {
        expect(StorageManager.loadTheme()).toBe('dark');
        StorageManager.saveTheme('light');
        expect(StorageManager.loadTheme()).toBe('light');
    });
});

describe('StorageManager history', () => {
    beforeEach(() => { store.clear(); });

    test('空歷史回空陣列，新增可讀回', () => {
        expect(StorageManager.getHistoryRecords()).toEqual([]);
        StorageManager.addHistoryRecord({
            id: 'a1', completedAt: 1700000000000,
            difficulty: 'hard', timeSeconds: 600, wasCompleted: true
        });
        const records = StorageManager.getHistoryRecords();
        expect(records.length).toBe(1);
        expect(records[0].difficulty).toBe('hard');
    });

    test('超過 50 筆只保留最新 50 筆', () => {
        for (let i = 0; i < 55; i++) {
            StorageManager.addHistoryRecord({
                id: `id-${i}`, completedAt: i,
                difficulty: 'easy', timeSeconds: i, wasCompleted: true
            });
        }
        const records = StorageManager.getHistoryRecords();
        expect(records.length).toBe(50);
        expect(records[0].id).toBe('id-54');
    });

    test('clearHistory 清空', () => {
        StorageManager.addHistoryRecord({
            id: 'x', completedAt: 1,
            difficulty: 'easy', timeSeconds: 1, wasCompleted: true
        });
        StorageManager.clearHistory();
        expect(StorageManager.getHistoryRecords()).toEqual([]);
    });
});
```

- [x] **Step 3: 執行全部測試**

Run: `bun test`
Expected: PASS（既有 28 例 + 新增 9 例 = 37 例，0 fail）

- [x] **Step 4: Commit**

```bash
git add tests/storage.test.js
git commit -m "test(storage): 新增 StorageManager 回歸測試"
```

### Task 2: script.js 改 import  canonical 實作

**Files:**
- Modify: `script.js:1-99`（刪除 `STORAGE_KEYS` 常數 + `StorageManager` 類別共 95 行，頂部加 1 行 import）
- Modify: `sudoku.html:79`（`<script src="script.js">` 改 `<script type="module" src="./script.js">`）
- Test: `bun test`（Task 1 套件守行為）+ http 手動驗證

**Interfaces:**
- Consumes: Task 1 的測試套件；`StorageManager` 8 處呼叫點 API 不變（`saveGame/loadGame/hasSavedGame/deleteSavedGame/saveTheme/loadTheme/addHistoryRecord/getHistoryRecords`）。
- Produces: 零重複的 `script.js`；`sudoku.html` 以 module 載入。

- [x] **Step 1: script.js 刪除重複並加 import**

刪除 `script.js` 第 1–99 行（從 `// ===...` 註解到 `}` 結尾的整個
`STORAGE_KEYS` + `StorageManager` 區塊），檔案頂部寫入：

```js
import { StorageManager } from './src/storage.js';

// ============================================
// 數獨遊戲核心邏輯
// ============================================

const DIFFICULTY = {
```

其餘 700+ 行（`DIFFICULTY` 以下）一字不動。

- [x] **Step 2: sudoku.html 改 module 載入**

```html
<script type="module" src="./script.js"></script>
```

- [x] **Step 3: 跑測試確認行為未變**

Run: `bun test`
Expected: PASS（37 例全綠；`script.js` 未被測試直接引用，守的是 `src/` 行為）

- [x] **Step 4: http 手動驗證（`server.js` 會以 `application/javascript` 回傳 `/src/*.js`）**

```bash
bun server.js &
# 瀏覽器開 http://localhost:3001/sudoku.html
# 驗：切難度開新局 → F12 Application 看到 sudoku-save → 重整出現「發現存檔」→ 切主題重整仍保留 → 完成一局（可用提示加速）後歷史有記錄
kill %1
```

- [x] **Step 5: Commit**

```bash
git add script.js sudoku.html
git commit -m "refactor(storage): script.js 共用 src StorageManager 刪除重複實作"
```

### Task 3: README 更新使用方式並收尾

**Files:**
- Modify: `README.md:14-22`（使用方式區塊）
- Test: `bun test` + `git diff --check`

**Interfaces:**
- Consumes: Task 2 的 module 化結果。
- Produces: 正確的啟動文件；push 到 `main`。

- [x] **Step 1: 更新 README 使用方式**

```markdown
## 使用方式

需透過 HTTP 伺服器開啟（ES Module 不支援 `file://` 直接開檔）：

```bash
bun server.js
# 然後訪問 http://localhost:3001/sudoku.html
# 或 python3 -m http.server 8000
```
```

- [x] **Step 2: 最終驗證並 push**

```bash
bun test
git diff --check
git push
```

Expected: 測試全綠、`diff --check` 無輸出、push 成功。

- [x] **Step 3: Commit（含 push）**

```bash
git add README.md
git commit -m "docs(readme): 更新啟動方式為 HTTP 伺服器"
git push
```
