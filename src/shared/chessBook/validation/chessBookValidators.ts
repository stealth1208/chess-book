import { moveToUci } from '@/features/engine/notation/moveRecord';
import type { Move } from '@/features/engine/notation/notation.types';
import type { Folder, Topic, Variation } from "@/shared/chessBook/types/chessBook";

const MOVE_RE = /^[a-i][0-9][a-i][0-9]$/;

export type ValidationResult = {
  ok: boolean;
  message?: string;
};

export function isValidMoveString(move: string): boolean {
  return MOVE_RE.test(move);
}

function isValidMoveRecord(move: Move): boolean {
  if (!move.from || !move.to || !move.notation || !move.piece || !move.side) {
    return false;
  }

  return isValidMoveString(moveToUci(move));
}

export function validateTopic(topic: Topic): ValidationResult {
  const name = topic.name.trim();
  if (!name) {
    return { ok: false, message: "Topic name is required." };
  }
  if (name.length > 80) {
    return { ok: false, message: "Topic name cannot exceed 80 characters." };
  }
  return { ok: true };
}

export function validateFolder(folder: Folder): ValidationResult {
  const name = folder.name.trim();
  if (!name) {
    return { ok: false, message: "Folder name is required." };
  }
  if (name.length > 80) {
    return { ok: false, message: "Folder name cannot exceed 80 characters." };
  }
  if (!folder.topicId) {
    return { ok: false, message: "Folder topicId is required." };
  }
  return { ok: true };
}

export function validateVariation(variation: Variation): ValidationResult {
  const name = variation.name.trim();
  if (!name) {
    return { ok: false, message: "Variation name is required." };
  }
  if (name.length > 120) {
    return { ok: false, message: "Variation name cannot exceed 120 characters." };
  }
  if (!variation.topicId) {
    return { ok: false, message: "Variation topicId is required." };
  }
  if (!variation.initialFen.trim()) {
    return { ok: false, message: "Initial FEN is required." };
  }

  const badMove = variation.moves.find((move) => !isValidMoveRecord(move));
  if (badMove) {
    return { ok: false, message: `Invalid move format: ${moveToUci(badMove)}` };
  }

  return { ok: true };
}
