import { Cell } from './types';
import { randomMove } from './random';
import { defensiveMove } from './defensive';
import { minimaxMove } from './minimax';
import { alphaBetaMove } from './alphabeta';
import { negamaxMove } from './negmax'; // Updated import

export function getAIMove(board: Cell[][], strategy: string): number {
    switch (strategy) {
        case 'Random':
            return randomMove(board);
        case 'Defensive':
            return defensiveMove(board) ?? randomMove(board);
        case 'Minimax':
            return minimaxMove(board, 4); // Adjust depth as needed
        case 'Negamax':
            return negamaxMove(board, 7); // Set maxDepth as needed
        case 'Alpha-Beta':
            return alphaBetaMove(board, 5); // Adjust depth as needed

        default:
            return randomMove(board);
    }
}
