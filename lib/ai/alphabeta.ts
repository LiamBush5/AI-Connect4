// lib/ai/alphabeta.ts

import { Cell } from './types';
import { makeMove, getAvailableColumns } from './utils';
import { checkWin } from '../checkWin';

export function alphaBetaMove(board: Cell[][], depth: number): number {
    const [, column] = alphaBeta(board, depth, -Infinity, Infinity, true);
    return column !== null ? column : randomFallback(board);
}

function alphaBeta(board: Cell[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): [number, number | null] {
    const winner = checkWin(board);
    if (winner === 'ai') return [1000, null];
    if (winner === 'human') return [-1000, null];
    if (depth === 0 || getAvailableColumns(board).length === 0) return [0, null];

    let bestCol: number | null = null;

    for (const col of getAvailableColumns(board)) {
        const tempBoard = board.map(row => [...row]);
        makeMove(tempBoard, col, isMaximizing ? 'ai' : 'human');
        const [evaluation] = alphaBeta(tempBoard, depth - 1, alpha, beta, !isMaximizing);

        if (isMaximizing) {
            if (evaluation > alpha) {
                alpha = evaluation;
                bestCol = col;
            }
        } else {
            if (evaluation < beta) {
                beta = evaluation;
                bestCol = col;
            }
        }

        if (alpha >= beta) break; // Prune branch
    }

    return [isMaximizing ? alpha : beta, bestCol];
}

function randomFallback(board: Cell[][]): number {
    const availableCols = getAvailableColumns(board);
    return availableCols.length > 0 ? availableCols[0] : -1;
}
