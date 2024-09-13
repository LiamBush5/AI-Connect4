// lib/ai/defensive.ts

import { Cell, } from './types';
import { makeMove, getAvailableColumns } from './utils';
import { checkWin } from '../checkWin';

export function defensiveMove(board: Cell[][]): number | null {
    const availableCols = getAvailableColumns(board);
    for (const col of availableCols) {
        const tempBoard = board.map(row => [...row]);
        makeMove(tempBoard, col, 'human');
        if (checkWin(tempBoard) === 'human') {
            return col; // Block the human player's winning move
        }
    }
    return null;
}
