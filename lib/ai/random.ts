// lib/ai/random.ts

import { Cell } from './types';
import { getAvailableColumns } from './utils';

export function randomMove(board: Cell[][]): number {
    const availableCols = getAvailableColumns(board);
    if (availableCols.length === 0) {
        return -1; // Board is full
    }
    const randomIndex = Math.floor(Math.random() * availableCols.length);
    return availableCols[randomIndex];
}
