import type { Variation } from "@/shared/chessBook/types/chessBook";
import { validateVariation } from "@/shared/chessBook/validation/chessBookValidators";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createVariationItem(input: {
  name: string;
  initialFen: string;
  moves: string[];
  topicId: string;
  folderId: string | null;
  userId?: string | null;
}): Variation {
  const ts = nowIso();
  const variation: Variation = {
    id: newId(),
    userId: input.userId ?? null,
    topicId: input.topicId,
    folderId: input.folderId,
    name: input.name.trim(),
    initialFen: input.initialFen,
    moves: [...input.moves],
    createdAt: ts,
    updatedAt: ts,
  };

  const result = validateVariation(variation);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return variation;
}

export function renameVariationItem(variations: Variation[], variationId: string, nextName: string): Variation[] {
  return variations.map((variation) => {
    if (variation.id !== variationId) {
      return variation;
    }

    const nextVariation: Variation = {
      ...variation,
      name: nextName.trim(),
      updatedAt: nowIso(),
    };

    const result = validateVariation(nextVariation);
    if (!result.ok) {
      throw new Error(result.message);
    }

    return nextVariation;
  });
}

export function deleteVariationItem(variations: Variation[], variationId: string): Variation[] {
  return variations.filter((variation) => variation.id !== variationId);
}

export function deleteVariationsByFolderIds(variations: Variation[], folderIds: Set<string>): Variation[] {
  return variations.filter((variation) => !variation.folderId || !folderIds.has(variation.folderId));
}

export function moveVariationToFolderItem(
  variations: Variation[],
  variationId: string,
  folderId: string | null,
  topicId?: string
): Variation[] {
  return variations.map((variation) => {
    if (variation.id !== variationId) {
      return variation;
    }

    return {
      ...variation,
      topicId: topicId ?? variation.topicId,
      folderId,
      updatedAt: nowIso(),
    };
  });
}
