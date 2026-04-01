export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'pawn';
export type PieceColor = 'red' | 'black';

export type Piece = {
  type: PieceType;
  color: PieceColor;
};

export type Coordinate = {
  x: number; // 0-8 (a-i)
  y: number; // 0-9
};

export type Move = {
  from: Coordinate;
  to: Coordinate;
  piece: Piece;
};

// 10 rows (y=0 is bottom, y=9 is top usually, or y=0 is top depending on representation)
// Let's adopt y=0 is top (Black's side usually), y=9 is bottom (Red's side usually)
export type BoardState = (Piece | null)[][]; 
