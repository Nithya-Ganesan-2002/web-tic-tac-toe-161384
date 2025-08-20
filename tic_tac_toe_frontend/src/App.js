import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

/**
 * Minimalistic Tic Tac Toe app with:
 * - Single-player mode vs simple AI (random with light heuristics)
 * - Two-player mode
 * - Scoreboard, status, reset controls
 * Theme is kept light per project requirements.
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

// Simple AI utilities
function getEmptyIndices(squares) {
  const res = [];
  for (let i = 0; i < squares.length; i += 1) {
    if (!squares[i]) res.push(i);
  }
  return res;
}

function simulateMoveAndCheckWin(squares, index, symbol) {
  const clone = squares.slice();
  clone[index] = symbol;
  const win = calculateWinner(clone);
  return win ? { win, clone } : null;
}

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

  // Mode state
  // "human" means Human vs Human; "ai" means Human vs AI (human is X, AI is O)
  const [mode, setMode] = useState('ai');

  // Derived state
  const winnerInfo = useMemo(() => calculateWinner(board), [board]);
  const currentPlayer = xIsNext ? 'X' : 'O';
  const isDraw = !winnerInfo && board.every(Boolean);
  const aiIsNext = mode === 'ai' && !gameOver && !winnerInfo && !isDraw && currentPlayer === 'O';

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
     * - In single-player mode, it's AI's turn
     */
    if (board[index] || gameOver) return;
    if (mode === 'ai' && currentPlayer === 'O') return;

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

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    /**
     * Switch between single-player (AI) and two-player modes.
     * Resets the current round to avoid mid-game inconsistencies.
     */
    const nextMode = e.target.value;
    setMode(nextMode);
    // Reset current round while keeping scores
    setBoard(initialBoard);
    setXIsNext(true);
    setGameOver(false);
  }

  // PUBLIC_INTERFACE
  function aiChooseMove(squares) {
    /**
     * Very simple AI strategy:
     * 1. If AI (O) can win in one move, do it.
     * 2. If human (X) can win next move, block it.
     * 3. Take center if free.
     * 4. Take a corner if available.
     * 5. Otherwise, pick a random empty spot.
     */
    const empty = getEmptyIndices(squares);
    if (empty.length === 0) return null;

    // 1. Win if possible
    for (const idx of empty) {
      const sim = simulateMoveAndCheckWin(squares, idx, 'O');
      if (sim && sim.win && sim.win.winner === 'O') {
        return idx;
      }
    }

    // 2. Block if human can win
    for (const idx of empty) {
      const sim = simulateMoveAndCheckWin(squares, idx, 'X');
      if (sim && sim.win && sim.win.winner === 'X') {
        return idx;
      }
    }

    // 3. Take center
    if (squares[4] == null) return 4;

    // 4. Take a corner
    const corners = [0, 2, 6, 8].filter((i) => squares[i] == null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    // 5. Random
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Let AI play automatically when it's its turn
  useEffect(() => {
    if (!aiIsNext) return;
    // small delay for UX
    const t = setTimeout(() => {
      setBoard((prev) => {
        const idx = aiChooseMove(prev);
        if (idx == null) return prev;
        const next = prev.slice();
        next[idx] = 'O';
        return next;
      });
      setXIsNext(true); // after AI (O) moves, it's X's turn
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiIsNext, board]);

  // Compute UI texts
  const statusText = winnerInfo
    ? `Winner: ${winnerInfo.winner}`
    : isDraw
      ? 'It’s a draw!'
      : `Turn: ${currentPlayer}${mode === 'ai' && currentPlayer === 'O' ? ' (AI)' : ''}`;

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

        <ModeToggle mode={mode} onChange={handleModeChange} />

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

// PUBLIC_INTERFACE
function ModeToggle({ mode, onChange }) {
  /**
   * Simple radio toggle to switch between Single Player (vs AI) and Two Players.
   */
  return (
    <div className="ttt-controls" role="group" aria-label="Game mode selection">
      <label>
        <input
          type="radio"
          name="mode"
          value="ai"
          checked={mode === 'ai'}
          onChange={onChange}
        />
        Single Player (vs AI)
      </label>
      <label>
        <input
          type="radio"
          name="mode"
          value="human"
          checked={mode === 'human'}
          onChange={onChange}
        />
        Two Players
      </label>
    </div>
  );
}

export default App;
