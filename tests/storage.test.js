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

    test('寫入拋錯回 false', () => {
        const orig = globalThis.localStorage.setItem;
        globalThis.localStorage.setItem = () => { throw new Error('quota'); };
        try {
            expect(StorageManager.saveGame(saveData())).toBe(false);
        } finally {
            globalThis.localStorage.setItem = orig;
        }
    });

    test('JSON 損壞回 null', () => {
        store.set('sudoku-save', '{broken');
        expect(StorageManager.loadGame()).toBeNull();
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

    test('寫入拋錯不拋出異常', () => {
        const orig = globalThis.localStorage.setItem;
        globalThis.localStorage.setItem = () => { throw new Error('quota'); };
        try {
            expect(() => StorageManager.addHistoryRecord({
                id: 'z', completedAt: 1,
                difficulty: 'easy', timeSeconds: 1, wasCompleted: true
            })).not.toThrow();
        } finally {
            globalThis.localStorage.setItem = orig;
        }
    });
});
