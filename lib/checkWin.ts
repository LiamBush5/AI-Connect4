// lib/checkWin.ts

type Player = 'human' | 'ai';
type Cell = Player | null;

export function checkWin(board: Cell[][]): Player | 'draw' | null {
    const ROWS = board.length;
    const COLS = board[0].length;

    // Check horizontal lines
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            const cell = board[row][col];
            if (
                cell &&
                cell === board[row][col + 1] &&
                cell === board[row][col + 2] &&
                cell === board[row][col + 3]
            ) {
                return cell;
            }
        }
    }

    // Check vertical lines
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row <= ROWS - 4; row++) {
            const cell = board[row][col];
            if (
                cell &&
                cell === board[row + 1][col] &&
                cell === board[row + 2][col] &&
                cell === board[row + 3][col]
            ) {
                return cell;
            }
        }
    }

    // Check diagonal (bottom-left to top-right)
    for (let row = 3; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            const cell = board[row][col];
            if (
                cell &&
                cell === board[row - 1][col + 1] &&
                cell === board[row - 2][col + 2] &&
                cell === board[row - 3][col + 3]
            ) {
                return cell;
            }
        }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            const cell = board[row][col];
            if (
                cell &&
                cell === board[row + 1][col + 1] &&
                cell === board[row + 2][col + 2] &&
                cell === board[row + 3][col + 3]
            ) {
                return cell;
            }
        }
    }

    // Check for draw
    const isDraw = board[0].every(cell => cell !== null);
    if (isDraw) {
        return 'draw';
    }

    // No winner yet
    return null;
}
