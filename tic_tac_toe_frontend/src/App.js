import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

/**
 * Minimalistic Tic Tac Toe app with a centered board, header, turn indicator,
 * reset controls, winner announcement, and basic score display.
 * Uses a light theme with project-provided color scheme via CSS variables.
 */

// Helpers
const initialBoard = Array(9).fill(null);
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// PUBLIC_INTERFACE
function App() {
  /** Theme handling (default light theme) */
  const [theme] = useState('light'); // Keep theme light per requirements

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Game State
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Derived state
  const winnerInfo = useMemo(() => calculateWinner(board), [board]);
  const currentPlayer = xIsNext ? 'X' : 'O';
  const isDraw = !winnerInfo && board.every(Boolean);

  useEffect(() => {
    if (winnerInfo && !gameOver) {
      setGameOver(true);
      setScores((prev) => ({
        ...prev,
        [winnerInfo.winner]: prev[winnerInfo.winner] + 1
      }));
    } else if (isDraw && !gameOver) {
      setGameOver(true);
    }
  }, [winnerInfo, isDraw, gameOver]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /**
     * Handles a click on a board square. Ignores clicks if:
     * - The square is already filled
     * - The game is over (winner or draw)
     */
    if (board[index] || gameOver) return;
    setBoard((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function resetBoard() {
    /** Resets only the board for the next round, preserving scores. */
    setBoard(initialBoard);
    setXIsNext(true);
    setGameOver(false);
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    /** Resets the board and the accumulated scores. */
    resetBoard();
    setScores({ X: 0, O: 0 });
  }

  // Compute UI texts
  const statusText = winnerInfo
    ? `Winner: ${winnerInfo.winner}`
    : isDraw
      ? 'It’s a draw!'
      : `Turn: ${currentPlayer}`;

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div className="ttt-scoreboard" role="status" aria-live="polite">
          <div className="score">
            <span className="label">X</span>
            <span className="value">{scores.X}</span>
          </div>
          <div className="score">
            <span className="label">O</span>
            <span className="value">{scores.O}</span>
          </div>
        </div>
      </header>

      <main className="ttt-main">
        <div className="ttt-status" aria-live="polite">{statusText}</div>

        <Board
          board={board}
          onSquareClick={handleSquareClick}
          highlightLine={winnerInfo ? winnerInfo.line : null}
        />

        <div className="ttt-controls">
          <button className="btn" onClick={resetBoard} aria-label="Reset board">
            Reset Round
          </button>
          <button
            className="btn btn-outline"
            onClick={resetGame}
            aria-label="Reset game and scores"
          >
            Reset Game
          </button>
        </div>
      </main>

      <footer className="ttt-footer">
        <small>Light theme • Minimal UI</small>
      </footer>
    </div>
  );
}

function calculateWinner(squares) {
  for (const [a, b, c] of winningLines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function Board({ board, onSquareClick, highlightLine }) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((value, idx) => {
        const isHighlight = highlightLine ? highlightLine.includes(idx) : false;
        return (
          <Square
            key={idx}
            index={idx}
            value={value}
            onClick={() => onSquareClick(idx)}
            highlight={isHighlight}
          />
        );
      })}
    </div>
  );
}

function Square({ value, onClick, index, highlight }) {
  return (
    <button
      className={`square ${value ? 'filled' : ''} ${highlight ? 'highlight' : ''}`}
      aria-label={`Square ${index + 1}${value ? `, ${value}` : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

export default App;
