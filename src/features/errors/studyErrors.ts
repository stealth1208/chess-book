export type StudyErrorCode =
  | "VALIDATION"
  | "LOCAL_READ"
  | "LOCAL_WRITE"
  | "REMOTE_SYNC"
  | "MIGRATION";

export type StudyError = {
  code: StudyErrorCode;
  message: string;
  cause?: unknown;
};

export function createStudyError(code: StudyErrorCode, message: string, cause?: unknown): StudyError {
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
  const error = createStudyError("MIGRATION", "Guest data migration failed", cause);
  return toUserMessage(error);
}
