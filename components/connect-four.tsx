'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getAIMove } from '@/lib/ai'
import { checkWin } from '@/lib/checkWin'
import { Player, Cell } from '@/lib/ai/types'

const ROWS = 6
const COLS = 7

type AIStrategy = {
  name: string
  color: string
}

const aiStrategies: AIStrategy[] = [
  { name: 'Random', color: 'bg-green-500' },
  { name: 'Defensive', color: 'bg-yellow-500' },
  { name: 'Minimax', color: 'bg-orange-500' },
  { name: 'Negamax', color: 'bg-red-500' },
  { name: 'Alpha-Beta', color: 'bg-purple-500' },
]

export function ConnectFourComponent() {
  const [board, setBoard] = useState<Cell[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>('human')
  const [aiStrategy, setAiStrategy] = useState('Random')
  const [firstPlayer, setFirstPlayer] = useState<Player>('human')
  const [gameStarted, setGameStarted] = useState(false)
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)

  const makeMove = useCallback(
    (col: number) => {
      if (winner || board[0][col]) {
        return
      }
      const newBoard = board.map((row) => [...row])
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!newBoard[row][col]) {
          newBoard[row][col] = currentPlayer
          break
        }
      }
      setBoard(newBoard)

      const result = checkWin(newBoard)
      if (result) {
        setWinner(result)
      } else {
        setCurrentPlayer((prev) => (prev === 'human' ? 'ai' : 'human'))
      }
    },
    [board, currentPlayer, winner]
  )

  const aiMove = useCallback(() => {
    const col = getAIMove(board, aiStrategy)
    if (col !== -1) {
      makeMove(col)
    }
  }, [board, aiStrategy, makeMove])

  useEffect(() => {
    if (gameStarted && currentPlayer === 'ai' && !winner) {
      const aiTimeout = setTimeout(aiMove, 500)
      return () => clearTimeout(aiTimeout)
    }
  }, [gameStarted, currentPlayer, winner, aiMove])

  const resetGame = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)))
    setCurrentPlayer(firstPlayer)
    setGameStarted(false)
    setWinner(null)
  }, [firstPlayer])

  const handleCellClick = (col: number) => {
    if (gameStarted && currentPlayer === 'human' && !winner && !board[0][col]) {
      makeMove(col)
    }
  }

  const toggleFirstPlayer = () => {
    if (!gameStarted) {
      setFirstPlayer((prev) => (prev === 'human' ? 'ai' : 'human'))
      setCurrentPlayer((prev) => (prev === 'human' ? 'ai' : 'human'))
    }
  }

  const startGame = () => {
    if (!gameStarted) {
      setGameStarted(true)
      if (firstPlayer === 'ai') {
        setCurrentPlayer('ai')
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1d29] text-white p-4 sm:p-8">
      <h1 className="text-4xl sm:text-5xl font-bold mb-8">
        Connect Four: Human vs AI
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-4xl justify-center">
        <Select onValueChange={setAiStrategy} defaultValue={aiStrategy}>
          <SelectTrigger className="w-full sm:w-[200px] bg-[#2c303a] border-none rounded-full text-sm font-medium text-white">
            <SelectValue placeholder="Select AI strategy" />
          </SelectTrigger>
          <SelectContent className="bg-[#2c303a] border-none rounded-md">
            {aiStrategies.map((strategy) => (
              <SelectItem
                key={strategy.name}
                value={strategy.name}
                className="text-white"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${strategy.color}`}
                  ></div>
                  {strategy.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          onClick={toggleFirstPlayer}
          disabled={gameStarted}
          className={`w-full sm:w-auto bg-[#3a3f4b] hover:bg-[#4a4f5b] text-white rounded-full text-sm font-medium ${gameStarted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {firstPlayer === 'human' ? 'Human' : 'AI'} Goes First
        </Button>
        <Button
          variant="default"
          onClick={resetGame}
          className="w-full sm:w-auto bg-[#4caf50] hover:bg-[#45a049] text-white rounded-full text-sm font-medium"
        >
          New Game
        </Button>
        <Button
          variant="default"
          onClick={startGame}
          disabled={gameStarted}
          className={`w-full sm:w-auto bg-[#2196f3] hover:bg-[#1e88e5] text-white rounded-full text-sm font-medium ${gameStarted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Start Game
        </Button>
      </div>
      <div
        className="bg-[#2c303a] p-4 rounded-lg w-full max-w-4xl"
        style={{ aspectRatio: '7/5.5' }}
      >
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-[12%] aspect-square bg-[#3a3f4b] rounded-full m-1 cursor-pointer overflow-hidden"
                onClick={() => handleCellClick(colIndex)}
                style={{ pointerEvents: winner || !gameStarted ? 'none' : 'auto' }}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.div
                      className={`w-full h-full rounded-full ${cell === 'human' ? 'bg-[#e57373]' : 'bg-yellow-500'
                        }`}
                      initial={{ y: '-100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ))}
      </div>
      {winner && (
        <div className="mt-6 text-2xl font-bold">
          {winner === 'draw'
            ? 'Game is a Draw!'
            : `${winner === 'human' ? 'Human' : 'AI'} Wins!`}
        </div>
      )}
      {!winner && (
        <p className="mt-6 text-xl sm:text-2xl flex items-center">
          {gameStarted ? (
            <>
              Current Player:
              <span
                className={`font-bold ml-2 flex items-center ${currentPlayer === 'human' ? 'text-[#e57373]' : 'text-yellow-500'
                  }`}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-2 ${currentPlayer === 'human'
                    ? 'bg-[#e57373]'
                    : 'bg-yellow-500'
                    }`}
                ></div>
                {currentPlayer}
              </span>
            </>
          ) : (
            'Click "Start Game" to begin!'
          )}
        </p>
      )}
    </div>
  )
}