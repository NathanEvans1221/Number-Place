/**
 * 數獨核心演算法模組
 * 可獨立測試的純函數
 */

export const DIFFICULTY = {
    easy: 35,
    medium: 45,
    hard: 55
};

export function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
    }
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

export function generateFullBoard() {
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    fillBoard(newBoard);
    return newBoard;
}

function fillBoard(board) {
    const empty = findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of nums) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

export function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

export function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generatePuzzle(difficulty) {
    const board = generateFullBoard();
    const puzzle = board.map(row => [...row]);
    const cells = shuffle([...Array(81).keys()]);
    const holes = DIFFICULTY[difficulty];

    for (let i = 0; i < holes && i < cells.length; i++) {
        const idx = cells[i];
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        puzzle[row][col] = 0;
    }

    const userBoard = puzzle.map(row => [...row]);
    return { board, puzzle, userBoard };
}

export function getCandidates(board, row, col) {
    if (board[row][col] !== 0) return [];
    const candidates = [];
    for (let n = 1; n <= 9; n++) {
        if (isValid(board, row, col, n)) {
            candidates.push(n);
        }
    }
    return candidates;
}

export function validateBoard(userBoard) {
    const errors = new Set();

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = userBoard[row][col];
            if (num === 0) continue;

            for (let c = 0; c < 9; c++) {
                if (c !== col && userBoard[row][c] === num) {
                    errors.add(`${row},${col}`);
                    errors.add(`${row},${c}`);
                }
            }

            for (let r = 0; r < 9; r++) {
                if (r !== row && userBoard[r][col] === num) {
                    errors.add(`${row},${col}`);
                    errors.add(`${r},${col}`);
                }
            }

            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if ((r !== row || c !== col) && userBoard[r][c] === num) {
                        errors.add(`${row},${col}`);
                        errors.add(`${r},${c}`);
                    }
                }
            }
        }
    }

    return errors;
}

export function checkWin(userBoard) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0) return false;
        }
    }

    const errors = validateBoard(userBoard);
    return errors.size === 0;
}
