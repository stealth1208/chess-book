import { describe, it, expect } from 'vitest';
import { deterministicSeedId } from '../services/folderService';

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
});
