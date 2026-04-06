import { Piece as PieceType } from "@/engine/types";
import { Box } from "@mantine/core";

const PIECE_CHARS: Record<string, Record<string, string>> = {
  red: {
    king: '帥',
    advisor: '仕',
    elephant: '相',
    horse: '傌',
    rook: '俥',
    cannon: '炮',
    pawn: '兵'
  },
  black: {
    king: '將',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    rook: '車',
    cannon: '砲',
    pawn: '卒'
  }
};

export function Piece({ piece, interactive = true }: { piece: PieceType; interactive?: boolean }) {
  const char = PIECE_CHARS[piece.color][piece.type];
  const color = piece.color === 'red' ? '#c42021' : '#111111';
  
  return (
    <Box
      w={48}
      h={48}
      style={{
        borderRadius: "50%",
        border: `2px solid ${color}`,
        backgroundColor: "#f2e4c9",
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        zIndex: 10
      }}
    >
      {char}
    </Box>
  );
}
