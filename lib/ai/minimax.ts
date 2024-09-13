// lib/ai/minimax.ts

import { Cell } from './types';
import { makeMove, getAvailableColumns } from './utils';
import { checkWin } from '../checkWin';

export function minimaxMove(board: Cell[][], depth: number): number {
    const [, column] = minimax(board, depth, true);
    return column !== null ? column : randomFallback(board);
}

function minimax(board: Cell[][], depth: number, isMaximizing: boolean): [number, number | null] {
    const winner = checkWin(board);
    if (winner === 'ai') return [1000, null];
    if (winner === 'human') return [-1000, null];
    if (depth === 0 || getAvailableColumns(board).length === 0) return [0, null];

    let bestEval = isMaximizing ? -Infinity : Infinity;
    let bestCol: number | null = null;

    for (const col of getAvailableColumns(board)) {
        const tempBoard = board.map(row => [...row]);
        makeMove(tempBoard, col, isMaximizing ? 'ai' : 'human');
        const [evaluation] = minimax(tempBoard, depth - 1, !isMaximizing);

        if (isMaximizing) {
            if (evaluation > bestEval) {
                bestEval = evaluation;
                bestCol = col;
            }
        } else {
            if (evaluation < bestEval) {
                bestEval = evaluation;
                bestCol = col;
            }
        }
    }

    return [bestEval, bestCol];
}

function randomFallback(board: Cell[][]): number {
    const availableCols = getAvailableColumns(board);
    return availableCols.length > 0 ? availableCols[0] : -1;
}
