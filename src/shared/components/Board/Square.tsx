import { Box } from "@mantine/core";

export function Square({
  x, y,
  squareSize,
  onClick,
  isSelected
}: {
  x: number;
  y: number;
  squareSize: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  return (
    <Box
      onClick={onClick}
      style={{
        position: "absolute",
        left: 20 + x * squareSize - squareSize / 2,
        top: 20 + y * squareSize - squareSize / 2,
        width: squareSize,
        height: squareSize,
        zIndex: 5,
        cursor: "pointer",
        backgroundColor: isSelected ? "rgba(255, 200, 0, 0.4)" : "transparent",
        borderRadius: "50%",
        display: "flex", // debug if needed
      }}
    />
  );
}
