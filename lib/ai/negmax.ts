// lib/ai/negamax.ts

import { Cell, Player } from './types';
import { makeMove, getAvailableColumns } from './utils';
import { checkWin } from '../checkWin';

type MemoTable = { [key: string]: number };

export function negamaxMove(board: Cell[][], maxDepth: number = 6): number {
    const memo: MemoTable = {};

    const availableCols = getAvailableColumns(board);

    // Determine whose turn it is
    const aiPieces = board.flat().filter(cell => cell === 'ai').length;
    const humanPieces = board.flat().filter(cell => cell === 'human').length;
    const totalPieces = aiPieces + humanPieces;

    const isAITurn = totalPieces % 2 === 0; // AI moves if even number of pieces
    const color = isAITurn ? 1 : -1; // 1 for AI, -1 for human

    // 1. Check for AI's immediate winning moves
    if (isAITurn) {
        for (const col of availableCols) {
            const tempBoard = board.map(row => [...row]);
            makeMove(tempBoard, col, 'ai');
            if (checkWin(tempBoard) === 'ai') {
                return col; // Take the winning move immediately
            }
        }
    }

    // 2. Check for human's immediate winning moves and block them
    if (isAITurn) {
        for (const col of availableCols) {
            const tempBoard = board.map(row => [...row]);
            makeMove(tempBoard, col, 'human');
            if (checkWin(tempBoard) === 'human') {
                return col; // Block the human's winning move
            }
        }
    }

    // 3. Proceed with the Negamax algorithm
    const [, column] = negamax(board, 0, -Infinity, Infinity, color, memo, maxDepth);
    return column !== null ? column : randomFallback(board);
}

function negamax(
    board: Cell[][],
    depth: number,
    alpha: number,
    beta: number,
    color: number,
    memo: MemoTable,
    maxDepth: number
): [number, number | null] {
    const winner = checkWin(board);
    if (winner === 'ai') return [100000 - depth, null]; // Large positive value for AI win
    if (winner === 'human') return [-100000 + depth, null]; // Large negative value for human win

    if (depth >= maxDepth) return [evaluateBoard(board, color), null];
    if (getAvailableColumns(board).length === 0) return [0, null]; // Draw

    const boardKey = boardToString(board) + color;
    if (memo[boardKey] !== undefined) {
        return [memo[boardKey], null];
    }

    let maxEval = -Infinity;
    let bestCol: number | null = null;

    const availableCols = getOrderedColumns(board);

    for (const col of availableCols) {
        const tempBoard = board.map(row => [...row]);
        makeMove(tempBoard, col, color === 1 ? 'ai' : 'human');

        // Check for immediate win after making the move
        const moveWinner = checkWin(tempBoard);
        if (moveWinner === (color === 1 ? 'ai' : 'human')) {
            const winScore = (color === 1 ? 100000 : -100000) - depth;
            memo[boardKey] = winScore;
            return [winScore, col];
        }

        const [evaluation] = negamax(tempBoard, depth + 1, -beta, -alpha, -color, memo, maxDepth);

        const score = -evaluation;
        if (score > maxEval) {
            maxEval = score;
            bestCol = col;
        }
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break; // Alpha-beta pruning
    }

    memo[boardKey] = maxEval;
    return [maxEval, bestCol];
}

function boardToString(board: Cell[][]): string {
    return board.flat().map(cell => (cell === 'ai' ? 'A' : cell === 'human' ? 'H' : 'N')).join('');
}

function randomFallback(board: Cell[][]): number {
    const availableCols = getAvailableColumns(board);
    return availableCols.length > 0 ? availableCols[0] : -1;
}

// Heuristic evaluation function
function evaluateBoard(board: Cell[][], color: number): number {
    const aiPlayer: Player = color === 1 ? 'ai' : 'human';
    const opponent: Player = aiPlayer === 'ai' ? 'human' : 'ai';

    let score = 0;

    // Center column preference
    const centerCol = Math.floor(board[0].length / 2);
    let centerCount = 0;
    for (let row = 0; row < board.length; row++) {
        if (board[row][centerCol] === aiPlayer) {
            centerCount++;
        }
    }
    score += centerCount * 3;

    // Score horizontal, vertical, and diagonal lines
    score += evaluateLines(board, aiPlayer, opponent);

    return score;
}
function evaluateLines(board: Cell[][], aiPlayer: Player, opponent: Player): number {
    let score = 0;

    const ROWS = board.length;
    const COLS = board[0].length;

    // Directions: [rowIncrement, colIncrement]
    const directions = [
        [0, 1],  // Horizontal
        [1, 0],  // Vertical
        [1, 1],  // Diagonal up-right
        [1, -1], // Diagonal up-left
    ];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            for (const [dRow, dCol] of directions) {
                const line: Cell[] = [];
                for (let i = 0; i < 4; i++) {
                    const r = row + i * dRow;
                    const c = col + i * dCol;
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        line.push(board[r][c]);
                    }
                }
                if (line.length === 4) {
                    score += evaluateLine(line, aiPlayer, opponent);
                }
            }
        }
    }

    return score;
}
function evaluateLine(line: (Cell)[], aiPlayer: Player, opponent: Player): number {
    let score = 0;
    const aiCount = line.filter(cell => cell === aiPlayer).length;
    const opponentCount = line.filter(cell => cell === opponent).length;
    const emptyCount = line.filter(cell => cell === null).length;

    if (aiCount === 4) {
        score += 1000;
    } else if (aiCount === 3 && emptyCount === 1) {
        score += 100;
    } else if (aiCount === 2 && emptyCount === 2) {
        score += 10;
    }

    if (opponentCount === 4) {
        score -= 1000;
    } else if (opponentCount === 3 && emptyCount === 1) {
        score -= 120; // Increase penalty to prioritize blocking
    } else if (opponentCount === 2 && emptyCount === 2) {
        score -= 5;
    }

    return score;
}

// Move ordering to improve pruning efficiency
function getOrderedColumns(board: Cell[][]): number[] {
    const center = Math.floor(board[0].length / 2);
    const availableCols = getAvailableColumns(board);
    availableCols.sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
    return availableCols;
}

