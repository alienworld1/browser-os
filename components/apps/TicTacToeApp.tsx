"use client";
import React, { useState } from 'react';

const calculateWinner = (squares: (string | null)[]): string | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  // Check for draw (all squares filled, no winner)
   if (squares.every(square => square !== null)) {
       return 'Draw';
   }
  return null;
};

const Square: React.FC<{ value: string | null; onClick: () => void }> = ({ value, onClick }) => (
  <button
    className="w-16 h-16 border border-gray-400 bg-white text-2xl font-bold flex items-center justify-center m-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onClick={onClick}
  >
    {value}
  </button>
);

const TicTacToeApp: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  const handleClick = (i: number) => {
    if (winner || board[i]) {
      return; // Ignore click if game is won or square is filled
    }
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  let status;
  if (winner) {
    status = winner === 'Draw' ? 'Result: Draw!' : `Winner: ${winner}`;
  } else {
    status = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <div className="w-full h-full bg-gray-200 text-black p-4 flex flex-col items-center justify-center">
      <div className="mb-4 text-lg font-semibold">{status}</div>
      <div className="grid grid-cols-3 gap-0">
        {[0, 1, 2].map((i) => <Square key={i} value={board[i]} onClick={() => handleClick(i)} />)}
        {[3, 4, 5].map((i) => <Square key={i} value={board[i]} onClick={() => handleClick(i)} />)}
        {[6, 7, 8].map((i) => <Square key={i} value={board[i]} onClick={() => handleClick(i)} />)}
      </div>
      <button
          onClick={handleReset}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
          Reset Game
      </button>
    </div>
  );
};

export default TicTacToeApp;