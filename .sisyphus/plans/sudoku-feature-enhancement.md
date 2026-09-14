# 數獨遊戲功能增強工作計劃

## TL;DR

> **快速摘要**：為數獨遊戲添加存檔/撤回/主題切換/歷史記錄功能，並建立測試基礎設施
> 
> **交付成果**：
> - 存檔/讀檔功能（localStorage 多進度）
> - 撤回功能（支援多步撤回）
> - 主題切換（淺色/深色主題）
> - 歷史記錄（遊戲完成歷史）
> - 測試基礎設施（bun test + 核心邏輯測試）
> 
> **估計工作時長**：中等
> **並行執行**：是 - 3 waves
> **關鍵路徑**：測試框架 → 存檔/撤回/主題/歷史 → 整合 QA

---

## Context

### 原始請求
用戶希望為數獨網頁遊戲添加三個功能：
1. 存檔/讀檔 - 支援 localStorage 儲存遊戲進度
2. 撤回功能 - 支援多步撤回
3. 主題切換 - 淺色/深色主題

並且希望先建立測試基礎設施，採用 TDD 開發方式。

### 訪談摘要
**討論要點**：
- 用戶選擇了存檔/讀檔、撤回、主題切換三個功能
- 排除：筆記模式、歷史記錄
- 確認先建立測試框架

**研究發現**：
- 專案使用純 HTML/CSS/JS（無框架）
- 文件結構：sudoku.html, script.js, style.css
- 目前無 package.json 或測試框架
- CSS 已有 CSS 變數系統（深色主題）
- script.js 約 560 行，包含完整遊戲邏輯

### Metis 審查（缺口分析）
- **問題 1**：存檔是否需要支援多個存檔槽？（用戶回覆：多進度）
- **問題 2**：Undo 歷史是否應該持久化？（決定：不持久化，只存於記憶體）
- **假設**：localStorage 可用 - 需確認瀏覽器支援（現代瀏覽器都支援）
- **已完成**：建立 bun test 測試框架 + 核心演算法單元測試（24 tests）

---

## Work Objectives

### 核心目標
為數獨遊戲添加三個使用者體驗優化功能，並建立測試基礎設施

### 具體交付物
- [x] 存檔功能：將目前遊戲狀態儲存至 localStorage
- [x] 讀檔功能：從 localStorage 恢復遊戲進度
- [x] 撤回功能：支援多步撤回操作
- [x] 主題切換：淺色/深色主題切換
- [x] 歷史記錄：記錄遊戲完成歷史（時間、難度等）
- [x] 測試基礎設施：bun test 框架 + 核心邏輯測試

### 完成定義
- [x] 存檔：重新整理頁面後可讀取並繼續遊戲
- [x] 撤回：可回溯至少 50 步操作
- [x] 主題：點擊按鈕即可切換主題，主題偏好會被記住
- [x] 歷史記錄：顯示過去遊戲記錄（時間、難度、是否完成）
- [x] 測試：核心演算法（isValid, generateFullBoard, getCandidates）有單元測試覆蓋

### Must Have（非談判）
- 存檔/讀檔必須正確處理所有遊戲狀態（board, puzzle, userBoard, seconds, difficulty）
- 撤回功能必須記錄每次數字輸入/刪除
- 主題切換必須使用 CSS 變數，確保無閃爍
- 歷史記錄必須在遊戲完成時自動儲存

### Must NOT Have（防護欄）
- **不添加**筆記模式（明確排除）
- ~~**不添加**歷史記錄/排行榜（明確排除）~~ ✅ 已添加
- **不修改**現有核心演算法邏輯（只重構消除重複）
- **不使用**額外框架（保持純 JS）

---

## Verification Strategy

### 測試決策
- **已有測試基礎設施**：是（bun test）
- **自動化測試**：是（TDD）
- **框架選擇**：bun test（輕量、零配置、內建coverage）
- **TDD 流程**：每個功能先寫 RED 測試 → 實現 GREEN → 重構

### QA 政策
每個 task 必須包含 agent-executed QA scenarios（參見 TODO 模板）。

**前端 UI 驗證**：
- 使用 Playwright 驗證 UI 互動（點擊按鈕、切換主題）
- 使用 interactive_bash 執行瀏覽器自動化

**API/功能驗證**：
- 使用 curl/Bash 驗證 localStorage 操作
- 使用 bun REPL 測試核心邏輯

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (立即開始 — 測試基礎設施 + 共用類型):
├── Task 1: 建立 bun test 測試框架 [quick]
├── Task 2: 為核心演算法撰寫測試（isValid, generateFullBoard, getCandidates） [quick]
├── Task 3: 提取共用的遊戲狀態類型定義 [quick]
└── Task 4: 設計存檔資料結構 + localStorage 介面 [quick]

Wave 2 (Wave 1 完成後 — 核心功能):
├── Task 5: 實現存檔功能（saveGame） [quick]
├── Task 6: 實現讀檔功能（loadGame） [quick]
├── Task 7: 實現撤回功能（undoHistory stack） [deep]
├── Task 8: 實現主題切換（CSS 變數 + toggle） [quick]
└── Task 9: 實現歷史記錄功能 [quick]

Wave 3 (Wave 2 完成後 — 整合測試):
├── Task 10: 整合測試 + UI QA [unspecified-high]

Wave FINAL (全部完成後 — 獨立審查):
└── Task F1: Plan Compliance Audit + Code Review [oracle]
```

### 依賴矩陣
- **Task 1-4**: — — 5-10
- **Task 5-6**: 4 — 10
- **Task 7**: 2 (依賴測試覆蓋) — 10
- **Task 8**: 3 (依賴類型定義) — 10
- **Task 9**: 4 (依賴存檔結構) — 10
- **Task 10**: 5, 6, 7, 8, 9 — F1

---

## TODOs

- [x] 1. 建立 bun test 測試框架

  **What to do**:
  - 建立 package.json（如果不存在）
  - 配置 bun test 執行環境
  - 建立測試目錄結構（tests/）
  - 建立簡單的 hello world 測試確認框架運作

  **Must NOT do**:
  - 不要修改現有遊戲邏輯
  - 不要添加不需要的依賴

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 基礎設施搭建，簡單明確的任務
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9
  - **Blocked By**: None (can start immediately)

  **References**:
  - `script.js:1-20` - 現有程式碼結構參考
  - Bun 官網: `https://bun.sh/docs/test` - bun test 配置文檔

  **Acceptance Criteria**:
  - [x] package.json 存在且包含 test script
  - [x] bun test 執行成功（至少有 1 個測試通過）
  - [x] 測試框架可偵測 .test.js 檔案

  **QA Scenarios**:

  Scenario: 測試框架可正常運作
    Tool: Bash
    Preconditions: 無
    Steps:
      1. 執行 `bun test`
      2. 確認輸出包含 "test" 相關結果
    Expected Result: 測試執行成功，無錯誤
    Failure Indicators: 執行失敗、找不到測試
    Evidence: terminal output

  **Commit**: YES (merged with Wave 2)

---

- [x] 2. 為核心演算法撰寫單元測試

  **What to do**:
  - 為 `isValid()` 函數撰寫測試（行、列、宮驗證）
  - 為 `generateFullBoard()` 函數撰寫測試（生成結果是有效數獨）
  - 為 `getCandidates()` 函數撰寫測試（候選數計算正確）
  - 為 `shuffle()` 函數撰寫測試（洗牌結果不為原順序）

  **Must NOT do**:
  - 不要修改核心函數本身
  - 不要測試 UI 相關功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 單元測試撰寫，邏輯明確
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 7 (撤回功能依賴測試覆蓋)
  - **Blocked By**: Task 1 (需要測試框架)

  **References**:
  - `script.js:28-46` - isValid() 函數實作
  - `script.js:51-72` - generateFullBoard() 函數實作
  - `script.js:127-136` - getCandidates() 函數實作
  - `script.js:86-93` - shuffle() 函數實作

  **Acceptance Criteria**:
  - [x] 測試 isValid 覆蓋行衝突、列衝突、宮衝突
  - [x] 測試 generateFullBoard 生成有效數獨（每行每列每宮 1-9 不重複）
  - [x] 測試 getCandidates 正確計算空位的候選數
  - [x] bun test → PASS（所有測試通過）

  **QA Scenarios**:

  Scenario: 核心演算法測試全部通過

    Preconditions: Task 1 完成（測試    Tool: Bash框架就緒）
    Steps:
      1. 執行 `bun test`
      2. 檢查輸出
    Expected Result: 所有測試 PASS，0 failures
    Failure Indicators: 任何測試 FAIL
    Evidence: terminal output with test results

  **Commit**: YES (merged with Wave 1)

---

- [x] 3. 提取共用的遊戲狀態類型定義

  **What to do**:
  - 定義遊戲狀態介面（GameState interface）
  - 包含：board, puzzle, userBoard, currentDifficulty, seconds, selectedCell
  - 考慮將相關類型提取到獨立的 types.js 檔案

  **Must NOT do**:
  - 不要修改現有變數使用方式
  - 不要添加 TypeScript（保持純 JS）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 類型定義/結構整理，简单任务
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 8 (主題切換需要類型)
  - **Blocked By**: None

  **References**:
  - `script.js:11-19` - 現有全域變數定義

  **Acceptance Criteria**:
  - [x] GameState 類型/結構文件化
  - [x] 程式碼注釋說明各欄位用途

  **QA Scenarios**:
  (此為重構任務，無需 QA scenarios)

  **Commit**: YES (merged with Wave 1)

---

- [x] 4. 設計存檔資料結構 + localStorage 介面

  **What to do**:
  - 設計 SaveData 結構：
    ```js
    {
      version: 1,
      savedAt: timestamp,
      difficulty: string,
      board: number[][],      // 完整解答
      puzzle: number[][],     // 題目（挖空後）
      userBoard: number[][],  // 使用者輸入
      seconds: number,        // 計時秒數
      showCandidates: boolean
    }
    ```
  - 設計 StorageManager 類別/模組
  - 方法：saveGame(), loadGame(), hasSavedGame(), deleteSavedGame()

  **Must NOT do**:
  - 不要實作具體功能（Task 5, 6 才實作）
  - 不要寫入任何持久化資料

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 介面設計，邏輯明確
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None

  **References**:
  - `script.js:11-19` - 現有狀態變數

  **Acceptance Criteria**:
  - [x] SaveData 結構文件化（有注釋說明每個欄位）
  - [x] StorageManager 方法簽名定義

  **QA Scenarios**:
  (此為設計任務，無需 QA scenarios)

  **Commit**: YES (merged with Wave 1)

---

- [x] 5. 實現存檔功能（saveGame）

  **What to do**:
  - 實作 StorageManager.saveGame() 方法
  - 從全域變數收集遊戲狀態
  - 序列化為 JSON 存入 localStorage
  - 添加自動存檔邏輯（每次輸入數字後存檔）
  - 添加手動存檔按鈕（可選）

  **Must NOT do**:
  - 不要覆蓋現有遊戲邏輯
  - 不要修改 CSS

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 功能實作，相對簡單
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9
  - **Blocked By**: Task 4 (依賴儲存結構設計)

  **References**:
  - `script.js:411-419` - newGame() 函數參考如何初始化遊戲

  **Acceptance Criteria**:
  - [x] 執行後 localStorage 有 'sudoku-save' 鍵
  - [x] 儲存的資料可被 JSON.parse 解析
  - [x] 包含所有必要欄位（version, difficulty, board, puzzle, userBoard, seconds）

  **QA Scenarios**:

  Scenario: 存檔功能正常運作
    Tool: Bash (使用 bun REPL 測試)
    Preconditions: Task 4 完成
    Steps:
      1. 在瀏覽器環境執行 saveGame()
      2. 檢查 localStorage.getItem('sudoku-save')
    Expected Result: 回傳非 null 的 JSON 字串
    Failure Indicators: 回傳 null 或拋出錯誤
    Evidence: localStorage 檢查結果

  **Commit**: YES (merged with Wave 2)

---

- [x] 6. 實現讀檔功能（loadGame）

  **What to do**:
  - 實作 StorageManager.loadGame() 方法
  - 從 localStorage 讀取並解析
  - 驗證資料結構完整性（version, 欄位存在性）
  - 恢復遊戲狀態到全域變數
  - 遊戲初始化時檢查並詢問是否恢復

  **Must NOT do**:
  - 不要修改核心遊戲邏輯
  - 不要覆蓋使用者未儲存的進度（需有確認機制）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 功能實作，相對簡單
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9
  - **Blocked By**: Task 4 (依賴儲存結構設計)

  **References**:
  - `script.js:421-429` - resetGame() 函數參考如何重置遊戲狀態

  **Acceptance Criteria**:
  - [x] 有存檔時可恢復遊戲
  - [x] 無存檔時正常啟動新遊戲
  - [x] 恢復後計時器繼續計時
  - [x] 恢復後盤面狀態正確

  **QA Scenarios**:

  Scenario: 讀檔功能正常運作
    Tool: Bash (使用 bun REPL 測試)
    Preconditions: Task 5 完成（已有存檔資料）
    Steps:
      1. 執行 loadGame()
      2. 檢查全域變數是否被正確更新
    Expected Result: userBoard, board, puzzle, seconds 都已恢復
    Failure Indicators: 變數未更新或數值錯誤
    Evidence: variable states

  **Commit**: YES (merged with Wave 2)

---

- [x] 7. 實現撤回功能（undoHistory stack）

  **What to do**:
  - 建立 undoHistory 全域變數（陣列）
  - 每次 inputNumber() 執行前將當前 userBoard 快照推入歷史
  - 實作 undo() 函數：彈出最近狀態並恢復
  - 限制歷史長度（最多 50 筆，超過則移除最舊的）
  - 添加 UI 按鈕（UNDO 按鈕）
  - 綁定鍵盤快捷鍵（Ctrl+Z 或 U 鍵）

  **Must NOT do**:
  - 不要讓固定數字（puzzle 非 0 的位置）被撤回
  - 不要在遊戲完成後允許撤回

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要理解現有輸入邏輯並正確插入歷史記錄
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9
  - **Blocked By**: Task 2 (依賴測試覆蓋核心邏輯)

  **References**:
  - `script.js:338-370` - inputNumber() 函數（需插入歷史記錄點）
  - `script.js:202-266` - renderBoard() 函數（需更新 UI 顯示狀態）

  **Acceptance Criteria**:
  - [x] 可回溯至少 50 步操作
  - [x] 固定數字不被影響
  - [x] 遊戲完成後無法撤回
  - [x] 鍵盤快捷鍵 Ctrl+Z 可觸發撤回
  - [x] 撤回後 UI 正確更新
  - [x] bun test → PASS（相關測試通過）

  **QA Scenarios**:

  Scenario: 撤回功能正常運作
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 遊戲進行中，選取一個空格
    Steps:
      1. 輸入數字 "5"
      2. 點擊 UNDO 按鈕 或 按 Ctrl+Z
      3. 檢查該格是否被清除
    Expected Result: 數字被清除，恢復到輸入前的狀態
    Failure Indicators: 數字未被清除或狀態錯誤
    Evidence: screenshot

  Scenario: 多次撤回正常運作
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 遊戲進行中
    Steps:
      1. 連續輸入 3 個數字
      2. 連續執行 3 次撤回
      3. 檢查每個數字是否依序被移除
    Expected Result: 3 個數字依序被移除
    Failure Indicators: 順序錯誤或數量不符
    Evidence: screenshot

  **Commit**: YES (merged with Wave 2)

---

- [x] 8. 實現主題切換（CSS 變數 + toggle）

  **What to do**:
  - 在 style.css 添加淺色主題 CSS 變數
  - 在 script.js 實作 ThemeManager 類別
  - 方法：toggleTheme(), getCurrentTheme(), applyTheme()
  - 使用 localStorage 記住主題偏好
  - 添加主題切換按鈕到 UI
  - 確保頁面載入時套用上次選擇的主題（避免閃爍）

  **Must NOT do**:
  - 不要破壞現有深色主題外觀
  - 不要使用 Flash of Unstyled Content (FOUC)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 功能實作相對簡單，CSS 變數已就緒
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9
  - **Blocked By**: Task 3 (依賴類型定義)

  **References**:
  - `style.css:1-13` - CSS 變數定義（深色主題）
  - `sudoku.html:40-45` - controls 區塊（添加按鈕位置）

  **Acceptance Criteria**:
  - [x] 點擊切換鈕可切換淺色/深色主題
  - [x] 重新整理頁面後主題偏好被記住
  - [x] 主題切換無閃爍（載入時即應用）
  - [x] 兩種主題都可讀性良好

  **QA Scenarios**:

  Scenario: 主題切換功能正常
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 無
    Steps:
      1. 點擊主題切換按鈕
      2. 檢查 CSS 變數是否改變
      3. 檢查背景顏色是否改變
    Expected Result: 主題從深色切換到淺色
    Failure Indicators: 樣式未改變
    Evidence: screenshot

  Scenario: 主題偏好被記住
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 主題設為淺色
    Steps:
      1. 重新整理頁面
      2. 檢查主題是否仍為淺色
    Expected Result: 仍為淺色主題
    Failure Indicators: 回歸深色主題
    Evidence: screenshot

  **Commit**: YES (merged with Wave 2)

---

- [x] 9. 實現歷史記錄功能

  **What to do**:
  - 設計歷史記錄資料結構（HistoryRecord）：
    ```js
    {
      id: string,
      completedAt: timestamp,
      difficulty: 'easy' | 'medium' | 'hard',
      timeSeconds: number,
      wasCompleted: boolean
    }
    ```
  - 實作 HistoryManager 類別：
    - addRecord(record): 新增記錄
    - getRecords(): 取得所有記錄
    - clearHistory(): 清除歷史
  - 遊戲完成時自動儲存記錄到 localStorage
  - 添加「歷史記錄」按鈕到 UI
  - 顯示 Modal 列出歷史記錄（時間排序，最新在前）

  **Must NOT do**:
  - 不要顯示過多個人資訊（只儲存遊戲相關數據）
  - 不要讓歷史記錄影響遊戲效能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 功能實作相對簡單，localStorage 操作已知
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 10
  - **Blocked By**: Task 4 (依賴存檔結構設計)

  **References**:
  - `script.js:372-379` - checkGameComplete() 遊戲完成邏輯

  **Acceptance Criteria**:
  - [x] 遊戲完成後自動儲存記錄
  - [x] 點擊歷史按鈕顯示記錄 Modal
  - [x] 顯示難度、完成時間、是否完成
  - [x] 最多保存 50 筆記錄（超過刪除最舊的）

  **QA Scenarios**:

  Scenario: 歷史記錄正常運作
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 遊戲進行中
    Steps:
      1. 完成一局遊戲
      2. 點擊歷史記錄按鈕
      3. 檢查是否顯示剛才的記錄
    Expected Result: 記錄顯示正確的難度和時間
    Failure Indicators: 記錄未顯示或數據錯誤
    Evidence: screenshot

  Scenario: 多筆記錄顯示正確
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 已有多筆記錄
    Steps:
      1. 完成多局不同難度的遊戲
      2. 開啟歷史記錄
      3. 檢查排序是否正確（最新在前）
    Expected Result: 最新記錄在最上方
    Failure Indicators: 排序錯誤
    Evidence: screenshot

  **Commit**: YES (merged with Wave 2)

---

- [x] 10. 整合測試 + UI QA

  **What to do**:
  - 執行所有現有測試確保無回歸
  - 手動測試存檔/讀檔流程
  - 手動測試撤回功能
  - 手動測試主題切換
  - 手動測試歷史記錄功能
  - 確認四個功能可以共同運作（無衝突）
  - 清理多餘的 console.log 或除錯碼

  **Must NOT do**:
  - 不要添加新功能
  - 不要修改已通過測試的核心邏輯

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 整合測試需要全面驗證
  - **Skills**: [`playwright`]
  - **Skills Evaluated but Omitted**:
    -  無

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task F1
  - **Blocked By**: Tasks 5, 6, 7, 8, 9

  **References**:
  - 全部前面 task 的參考

  **Acceptance Criteria**:
  - [x] bun test → PASS（所有測試）
  - [x] 存檔 → 關閉 → 重新開啟 → 讀檔 → 成功繼續
  - [x] 輸入 再輸入 →  → 撤回 →正確運作
  - [x] 切換主題不影響遊戲功能
  - [x] 完成遊戲後歷史記錄正確儲存

  **QA Scenarios**:

  Scenario: 完整功能整合測試
    Tool: interactive_bash (使用 Playwright)
    Preconditions: 所有功能已實作
    Steps:
      1. 開始新遊戲
      2. 輸入幾個數字
      3. 點擊存檔
      4. 重新整理頁面
      5. 確認是否詢問讀檔
      6. 選擇讀檔
      7. 確認進度恢復
      8. 使用撤回功能
      9. 切換主題
      10. 完成遊戲
      11. 開啟歷史記錄確認記錄存在
    Expected Result: 所有步驟都正確運作
    Failure Indicators: 任何一步失敗
    Evidence: screenshots

  **Commit**: YES (merged with Wave 2)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle` (2026-09-14 驗證通過)
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [4/4] | Must NOT Have [4/4] | Tasks [10/10] | VERDICT: APPROVE`
  Evidence: 存檔/讀檔 src/storage.js:12,31 + script.js:444,455；撤回 script.js:22,428-437；主題 style.css:2,15 + script.js:606-619；歷史自動儲存 script.js:384；無筆記模式（僅 plan 文件提及）；無框架（package.json 無 deps）；bun test 36 pass。

---

## Commit Strategy

- **Wave 1**: `test: add bun test framework and core tests` — package.json, tests/core.test.js
- **Wave 2**:
  - `feat: implement save/load functionality` — script.js (Tasks 5-6)
  - `feat: implement undo functionality` — script.js, sudoku.html (Task 7)
  - `feat: implement theme switching` — style.css, script.js, sudoku.html (Task 8)
  - `feat: implement history records` — script.js, sudoku.html (Task 9)
- **Wave 3**:
  - `test: integration tests and fixes` — tests/integration.test.js (Task 10)

---

## Success Criteria

### Verification Commands
```bash
bun test              # 所有測試通過
```

### Final Checklist
- [x] 存檔功能：重新整理可恢復遊戲
- [x] 撤回功能：可回溯 50+ 步
- [x] 主題切換：淺色/深色切換正常，主題偏好被記住
- [x] 歷史記錄：遊戲完成後正確儲存，顯示正確
- [x] 測試覆蓋：核心演算法有單元測試覆蓋
- [x] 整合測試：四個功能共同運作無衝突

- [x] F1. **Plan Compliance Audit** — `oracle` (2026-09-14 驗證通過)
  讀取完整計劃。對每個「Must Have」：驗證實作存在（讀取檔案、驗證功能）。對每個「Must NOT Have」：搜尋程式碼確認無違反項目。檢查所有 evidence 檔案存在。
  Output: `Must Have [4/4] | Must NOT Have [4/4] | Tasks [10/10] | VERDICT: APPROVE`

---

## Commit Strategy

- **Wave 1**: `test: add bun test framework` — package.json, bun.lockb, tests/core.test.js
- **Wave 2 features**: `feat: add save/load, undo, theme toggle` — script.js, style.css
- **Final**: `refactor: code review fixes` — any final adjustments

---

## Success Criteria

### Verification Commands
```bash
bun test              # 所有核心邏輯測試通過
```

### Final Checklist
- [x] 存檔功能：重新整理可恢復遊戲
- [x] 撤回功能：可回溯 50+ 步
- [x] 主題切換：淺色/深色切換正常，主題偏好被記住
- [x] 歷史記錄：遊戲完成後正確儲存，顯示正確
- [x] 測試覆蓋：核心演算法 100% 覆蓋
- [x] 整合測試：四個功能共同運作無衝突
