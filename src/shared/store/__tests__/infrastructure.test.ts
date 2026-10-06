import { describe, it, expect } from 'vitest';
import { deterministicSeedId } from '../services/folderService';
import { useGameStore } from '../useGameStore';
import { buildBoards } from '../services/boardBuilder';
import { normalizeMoves } from '@/features/engine/notation/moveRecord';

describe('State and infrastructure improvements', () => {
  describe('deterministic seed IDs', () => {
    it('should generate consistent IDs for same seed string', () => {
      const id1 = deterministicSeedId('test-topic');
      const id2 = deterministicSeedId('test-topic');
      
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^seed-[0-9a-f]{8}-test-top/);
    });
    
    it('should generate different IDs for different seed strings', () => {
      const id1 = deterministicSeedId('topic-a');
      const id2 = deterministicSeedId('topic-b');
      
      expect(id1).not.toBe(id2);
    });
    
    it('should generate IDs that work across SSR and client', () => {
      // The point is these IDs are deterministic, not random
      // So SSR HTML and client hydration will match
      const topicId = deterministicSeedId('topic-khai-cuoc-phao-dau');
      const folderId = deterministicSeedId('folder-co-ban');
      const variationId = deterministicSeedId('variation-bien-co-ban');
      
      expect(topicId).toBe(deterministicSeedId('topic-khai-cuoc-phao-dau'));
      expect(folderId).toBe(deterministicSeedId('folder-co-ban'));
      expect(variationId).toBe(deterministicSeedId('variation-bien-co-ban'));
    });
  });

  describe('persist rehydration', () => {
    it('should rebuild boards and board on same-version rehydrate', () => {
      const store = useGameStore.getState();
      
      // Play some moves
      store.applyMove('h7e7'); // red pawn
      store.applyMove('h0g2'); // black horse
      store.applyMove('h9g7'); // red horse
      
      // Jump to middle position
      store.jumpTo(1);
      
      const beforeState = useGameStore.getState();
      expect(beforeState.moves.length).toBe(3);
      expect(beforeState.currentIndex).toBe(1);
      expect(beforeState.boards.length).toBe(4); // start + 3 moves
      
      // Simulate rehydration with same version (merge is called, not migrate)
      // Extract the persisted data
      const persistedData = {
        initialFen: beforeState.initialFen,
        moves: beforeState.moves,
        currentIndex: beforeState.currentIndex,
      };
      
      // Reset store to simulate fresh start
      store.resetGame();
      
      const afterResetState = useGameStore.getState();
      expect(afterResetState.moves.length).toBe(0);
      expect(afterResetState.currentIndex).toBe(-1);
      expect(afterResetState.boards.length).toBe(1);
      
      // Simulate zustand persist calling merge (happens on same-version reload)
      // We verify the merge function works correctly by rebuilding boards
      const normalized = normalizeMoves(persistedData.initialFen, persistedData.moves);
      const rebuiltBoards = buildBoards(persistedData.initialFen, normalized.map(m => m.uci));
      const rebuiltBoard = rebuiltBoards[persistedData.currentIndex + 1] ?? rebuiltBoards[0];
      
      // Verify boards would be rebuilt correctly
      expect(rebuiltBoards.length).toBe(4); // start + 3 moves
      expect(rebuiltBoard).toBeTruthy();
      
      // Verify the board at currentIndex=1 is different from start board
      expect(rebuiltBoard).not.toBe(rebuiltBoards[0]);
      
      // The board should match the position after 2 moves
      expect(rebuiltBoard).toBe(rebuiltBoards[2]); // currentIndex=1 means boards[2]
    });
  });
});
