import { describe, test, expect } from 'bun:test';
import { isValid, generateFullBoard, shuffle, getCandidates, validateBoard, checkWin, generatePuzzle, DIFFICULTY } from '../src/sudoku-core.js';

describe('isValid', () => {
    test('行衝突檢測', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[0][0] = 5;
        expect(isValid(board, 0, 1, 5)).toBe(false);
        expect(isValid(board, 0, 1, 3)).toBe(true);
    });

    test('列衝突檢測', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[0][0] = 5;
        expect(isValid(board, 1, 0, 5)).toBe(false);
        expect(isValid(board, 1, 0, 3)).toBe(true);
    });

    test('宮衝突檢測', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[0][0] = 5;
        expect(isValid(board, 1, 1, 5)).toBe(false);
        expect(isValid(board, 1, 1, 3)).toBe(true);
    });

    test('宮角落檢測', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[2][2] = 7;
        expect(isValid(board, 0, 0, 7)).toBe(false);
        expect(isValid(board, 0, 0, 1)).toBe(true);
    });

    test('宮邊緣檢測', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[3][4] = 9;
        expect(isValid(board, 4, 5, 9)).toBe(false);
    });

    test('空位可以填入任何數', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        expect(isValid(board, 4, 4, 1)).toBe(true);
    });
});

describe('generateFullBoard', () => {
    test('生成有效的完整數獨盤面', () => {
        const board = generateFullBoard();

        expect(board.length).toBe(9);
        expect(board.every(row => row.length === 9)).toBe(true);

        for (let i = 0; i < 9; i++) {
            const rowSet = new Set(board[i]);
            expect(rowSet.size).toBe(9);
            expect(rowSet.has(0)).toBe(false);
        }

        for (let col = 0; col < 9; col++) {
            const colValues = board.map(row => row[col]);
            const colSet = new Set(colValues);
            expect(colSet.size).toBe(9);
        }

        for (let blockRow = 0; blockRow < 3; blockRow++) {
            for (let blockCol = 0; blockCol < 3; blockCol++) {
                const blockValues = [];
                for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                    for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
                        blockValues.push(board[r][c]);
                    }
                }
                const blockSet = new Set(blockValues);
                expect(blockSet.size).toBe(9);
            }
        }
    });

    test('多次生成產生不同盤面', () => {
        const board1 = generateFullBoard();
        const board2 = generateFullBoard();
        const board3 = generateFullBoard();

        const isAllSame = (b1, b2) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b1[r][c] !== b2[r][c]) return false;
                }
            }
            return true;
        };

        const allSame = isAllSame(board1, board2) && isAllSame(board2, board3);
        expect(allSame).toBe(false);
    });
});

describe('shuffle', () => {
    test('洗牌不改變原陣列長度', () => {
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffled = shuffle(original);
        expect(shuffled.length).toBe(9);
    });

    test('洗牌包含所有原元素', () => {
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffled = shuffle(original);
        const sorted = [...shuffled].sort((a, b) => a - b);
        expect(sorted).toEqual(original);
    });

    test('多次洗牌結果應有差異', () => {
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const results = new Set();

        for (let i = 0; i < 100; i++) {
            const shuffled = shuffle(original);
            results.add(shuffled.join(','));
        }

        expect(results.size).toBeGreaterThan(1);
    });
});

describe('getCandidates', () => {
    test('空位返回1-9所有候選數', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        const candidates = getCandidates(board, 4, 4);
        expect(candidates.length).toBe(9);
        expect(candidates).toContain(1);
        expect(candidates).toContain(9);
    });

    test('有數字的位返回空陣列', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[4][4] = 5;
        const candidates = getCandidates(board, 4, 4);
        expect(candidates).toEqual([]);
    });

    test('排除同行已使用的數', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[4][0] = 3;
        board[4][1] = 5;
        const candidates = getCandidates(board, 4, 4);
        expect(candidates).not.toContain(3);
        expect(candidates).not.toContain(5);
    });

    test('排除同列已使用的數', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[0][4] = 7;
        board[1][4] = 2;
        const candidates = getCandidates(board, 4, 4);
        expect(candidates).not.toContain(7);
        expect(candidates).not.toContain(2);
    });

    test('排除同宮已使用的數', () => {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        board[3][3] = 1;
        board[4][5] = 2;
        board[5][4] = 3;
        const candidates = getCandidates(board, 4, 4);
        expect(candidates).not.toContain(1);
        expect(candidates).not.toContain(2);
        expect(candidates).not.toContain(3);
    });
});

describe('validateBoard', () => {
    test('空盤面無錯誤', () => {
        const userBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        const errors = validateBoard(userBoard);
        expect(errors.size).toBe(0);
    });

    test('行列重複檢測', () => {
        const userBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        userBoard[0][0] = 5;
        userBoard[0][8] = 5;
        const errors = validateBoard(userBoard);
        expect(errors.size).toBeGreaterThan(0);
    });

    test('宮重複檢測', () => {
        const userBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        userBoard[0][0] = 1;
        userBoard[2][2] = 1;
        const errors = validateBoard(userBoard);
        expect(errors.size).toBeGreaterThan(0);
    });

    test('完整解答盤面無錯誤', () => {
        const userBoard = generateFullBoard();
        const errors = validateBoard(userBoard);
        expect(errors.size).toBe(0);
    });
});

describe('checkWin', () => {
    test('未填滿返回false', () => {
        const userBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        userBoard[0][0] = 1;
        expect(checkWin(userBoard)).toBe(false);
    });

    test('填滿但有錯誤返回false', () => {
        const userBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        userBoard[0][0] = 5;
        userBoard[0][1] = 5;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (userBoard[r][c] === 0) userBoard[r][c] = 1;
            }
        }
        expect(checkWin(userBoard)).toBe(false);
    });

    test('完整正確解答返回true', () => {
        const userBoard = generateFullBoard();
        expect(checkWin(userBoard)).toBe(true);
    });
});

describe('generatePuzzle', () => {
    test('生成題目正確挖空', () => {
        const result = generatePuzzle('easy');

        expect(result.board.length).toBe(9);
        expect(result.puzzle.length).toBe(9);
        expect(result.userBoard.length).toBe(9);

        let puzzleCount = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (result.puzzle[r][c] === 0) puzzleCount++;
            }
        }

        expect(puzzleCount).toBe(DIFFICULTY.easy);
    });

    test('不同難度挖空數量不同', () => {
        const easy = generatePuzzle('easy');
        const medium = generatePuzzle('medium');
        const hard = generatePuzzle('hard');

        let easyHoles = 0, mediumHoles = 0, hardHoles = 0;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (easy.puzzle[r][c] === 0) easyHoles++;
                if (medium.puzzle[r][c] === 0) mediumHoles++;
                if (hard.puzzle[r][c] === 0) hardHoles++;
            }
        }

        expect(easyHoles).toBe(DIFFICULTY.easy);
        expect(mediumHoles).toBe(DIFFICULTY.medium);
        expect(hardHoles).toBe(DIFFICULTY.hard);
    });

    test('userBoard與puzzle一致', () => {
        const result = generatePuzzle('medium');
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                expect(result.userBoard[r][c]).toBe(result.puzzle[r][c]);
            }
        }
    });

    test('純函數：多次呼叫互不污染', () => {
        const first = generatePuzzle('medium');
        first.puzzle[0][0] = 99;
        first.userBoard[0][0] = 99;
        first.board[0][0] = 99;

        const second = generatePuzzle('medium');
        expect(second.puzzle[0][0]).not.toBe(99);
        expect(second.userBoard[0][0]).not.toBe(99);
        expect(second.board[0][0]).not.toBe(99);
    });

    test('純函數：回傳三盤面彼此獨立', () => {
        const result = generatePuzzle('easy');
        result.puzzle[0][0] = 99;
        expect(result.board[0][0]).not.toBe(99);
        expect(result.userBoard[0][0]).not.toBe(99);
    });
});
