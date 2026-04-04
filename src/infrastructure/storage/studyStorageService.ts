import { localRepository } from "@/infrastructure/storage/localRepository";
import { loadRemoteSnapshot, remoteRepository } from "@/infrastructure/storage/remoteRepository";
import type { Folder, StudySnapshot, StudyStorageMode, Variation } from "@/shared/study/types/study";

class StudyStorageService {
  private mode: StudyStorageMode = "guest";
  private userId: string | null = null;

  setGuestMode(): void {
    this.mode = "guest";
    this.userId = null;
  }

  setUserMode(userId: string): void {
    this.mode = "user";
    this.userId = userId;
  }

  async loadSnapshot(): Promise<StudySnapshot> {
    if (this.mode === "guest" || !this.userId) {
      return localRepository.loadSnapshot();
    }

    return loadRemoteSnapshot(this.userId);
  }

  async saveFolders(folders: Folder[]): Promise<void> {
    if (this.mode === "guest" || !this.userId) {
      await localRepository.saveFolders(folders);
      return;
    }

    await remoteRepository.upsertFolders(this.userId, folders);
  }

  async saveVariations(variations: Variation[]): Promise<void> {
    if (this.mode === "guest" || !this.userId) {
      await localRepository.saveVariations(variations);
      return;
    }

    await remoteRepository.upsertVariations(this.userId, variations);
  }
}

export const studyStorageService = new StudyStorageService();
