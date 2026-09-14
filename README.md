# Number-Place 數獨網頁版

經典 9x9 數獨遊戲，單一 HTML 檔案，無需任何框架或依賴。)

![demo](./images/demo.png)

## 功能特點

- **三種難度**：簡單、中等、困難
- **視覺輔助**：選取高亮、同數字標示、行列表標示
- **即時驗證**：衝突數字紅色警示
- **輔助功能**：候選數顯示、提示、重置
- **鍵盤操作**：支援方向鍵移動、數字鍵輸入
- **響應式設計**：支援桌面與行動裝置

## 使用方式

需透過 HTTP 伺服器開啟（ES Module 不支援 `file://` 直接開檔）：

```bash
bun server.js
# 然後訪問 http://localhost:3001/sudoku.html
```

或使用 Python 內建伺服器：

```bash
python3 -m http.server 8000
# 然後訪問 http://localhost:8000/sudoku.html
```

## 技術棧

- HTML5
- CSS3 (內嵌)
- JavaScript (無框架)

## 專案結構

```
Number-Place/
├── README.md      # 專案說明
├── sudoku.html    # 數獨遊戲（單一檔案）
└── PRD.md         # 產品需求文件
```

## 授權

MIT License

---

[😸SAM]
