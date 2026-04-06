export type ChessBookErrorCode =
  | "VALIDATION"
  | "LOCAL_READ"
  | "LOCAL_WRITE"
  | "REMOTE_SYNC"
  | "MIGRATION"
  | "MALFORMED_REPLAY";

export type ChessBookError = {
  code: ChessBookErrorCode;
  message: string;
  cause?: unknown;
};

export function createChessBookError(code: ChessBookErrorCode, message: string, cause?: unknown): ChessBookError {
  return { code, message, cause };
}

export function toUserMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "VALIDATION":
        return "Du lieu khong hop le. Vui long kiem tra lai.";
      case "LOCAL_READ":
      case "LOCAL_WRITE":
        return "Khong the doc hoac ghi du lieu local.";
      case "REMOTE_SYNC":
        return "Dong bo du lieu that bai. Vui long thu lai sau.";
      case "MIGRATION":
        return "Khong the chuyen du lieu guest khi dang nhap lan dau.";
      case "MALFORMED_REPLAY":
        return "Bien luu khong hop le, khong the tai lai van co.";
      default:
        break;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Da xay ra loi khong xac dinh.";
}

export function handleMigrationFailure(cause?: unknown): string {
  const error = createChessBookError("MIGRATION", "Guest data migration failed", cause);
  return toUserMessage(error);
}

export function handleMalformedReplayFailure(cause?: unknown): string {
  const error = createChessBookError("MALFORMED_REPLAY", "Malformed variation replay", cause);
  return toUserMessage(error);
}
