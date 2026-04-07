'use client';

import { Box } from "@mantine/core";
import { Piece as PieceComponent } from "./Piece";
import { Square } from "./Square";
import { BoardState, Coordinate, Move } from "@/engine/types";
import { useState } from "react";

interface BoardProps {
  board: BoardState;
  onMove?: (move: Move) => void;
  interactive?: boolean;
}

export function Board({ board, onMove, interactive = true }: BoardProps) {
  const [selectedCoord, setSelectedCoord] = useState<Coordinate | null>(null);

  const squareSize = 60; // 60px per square intersection
  const boardWidth = 8 * squareSize; // 8 squares wide (9 lines)
  const boardHeight = 9 * squareSize; // 9 squares high (10 lines)

  const handleSquareClick = (x: number, y: number) => {
    if (!interactive) {
      return;
    }

    const clickedPiece = board[y][x];

    if (selectedCoord) {
      if (selectedCoord.x === x && selectedCoord.y === y) {
        // Deselect
        setSelectedCoord(null);
        return;
      }

      // Try to move
      const movingPiece = board[selectedCoord.y][selectedCoord.x];
      if (movingPiece && onMove) {
        // If clicking on same color piece, switch selection (unless we just validate all moves externally, 
        // but it's handy to cleanly swap selection).
        if (clickedPiece && clickedPiece.color === movingPiece.color) {
          setSelectedCoord({ x, y });
        } else {
          onMove({
            from: selectedCoord,
            to: { x, y },
          });
          setSelectedCoord(null);
        }
      }
    } else {
      if (clickedPiece) {
        setSelectedCoord({ x, y });
      }
    }
  };

  return (
    <Box
      style={{
        position: "relative",
        width: boardWidth + 40, // 20px padding robust
        height: boardHeight + 40,
        backgroundColor: "#e8c991",
        border: "3px solid #6b4423",
        borderRadius: "8px",
        padding: 20,
        margin: "0 auto", // Center board
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}
    >
      <svg width={boardWidth} height={boardHeight} style={{ position: "absolute", top: 20, left: 20 }}>
        {/* Horizontal lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0} y1={i * squareSize} x2={boardWidth} y2={i * squareSize}
            stroke="#6b4423" strokeWidth={1.5}
          />
        ))}

        {/* Vertical lines */}
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={`v-${i}`}>
            <line x1={i * squareSize} y1={0} x2={i * squareSize} y2={4 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
            <line x1={i * squareSize} y1={5 * squareSize} x2={i * squareSize} y2={9 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
          </g>
        ))}

        {/* River outer vertical strings joining the edges */}
        <line x1={0} y1={4 * squareSize} x2={0} y2={5 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
        <line x1={boardWidth} y1={4 * squareSize} x2={boardWidth} y2={5 * squareSize} stroke="#6b4423" strokeWidth={1.5} />

        {/* Palace diagonals - Black (Top) */}
        <line x1={3 * squareSize} y1={0} x2={5 * squareSize} y2={2 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
        <line x1={5 * squareSize} y1={0} x2={3 * squareSize} y2={2 * squareSize} stroke="#6b4423" strokeWidth={1.5} />

        {/* Palace diagonals - Red (Bottom) */}
        <line x1={3 * squareSize} y1={7 * squareSize} x2={5 * squareSize} y2={9 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
        <line x1={5 * squareSize} y1={7 * squareSize} x2={3 * squareSize} y2={9 * squareSize} stroke="#6b4423" strokeWidth={1.5} />
        
        {/* Extra: River text could be added here, or decoration */}
      </svg>

      {/* Squares for click detection (higher z-index overlay) */}
      {Array.from({ length: 10 }).map((_, y) =>
        Array.from({ length: 9 }).map((_, x) => (
          <Square
            key={`sq-${x}-${y}`}
            x={x}
            y={y}
            squareSize={squareSize}
            isSelected={selectedCoord?.x === x && selectedCoord?.y === y}
            onClick={() => handleSquareClick(x, y)}
          />
        ))
      )}

      {/* Pieces */}
      {board.map((row, y) =>
        row.map((piece, x) => (
          piece && (
            <Box
              key={`piece-${x}-${y}`}
              style={{
                position: "absolute",
                left: 20 + x * squareSize - 24, // 24 is piece center offset
                top: 20 + y * squareSize - 24,
                zIndex: 10,
                pointerEvents: "none" // Let the Square beneath it catch clicks
              }}
            >
              <PieceComponent piece={piece} interactive={interactive} />
            </Box>
          )
        ))
      )}
    </Box>
  );
}
