// lib/ai/utils.ts

import { Cell, Player } from './types';

export function getAvailableColumns(board: Cell[][]): number[] {
    const availableCols: number[] = [];
    for (let col = 0; col < board[0].length; col++) {
        if (board[0][col] === null) {
            availableCols.push(col);
        }
    }
    return availableCols;
}

export function makeMove(board: Cell[][], col: number, player: Player): boolean {
    const ROWS = board.length;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            board[row][col] = player;
            return true;
        }
    }
    return false; // Column is full
}
