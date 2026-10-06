import { describe, it, expect } from 'vitest';
import { parseVietnameseNotation } from '../parseVietnameseNotation';

describe('Parse Vietnamese Notation - Robustness Tests', () => {
  const startFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';

  describe('Empty and invalid input', () => {
    it('should reject empty string', () => {
      const result = parseVietnameseNotation('', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toContain('empty');
      }
    });

    it('should reject whitespace-only string', () => {
      const result = parseVietnameseNotation('   \n  ', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toContain('empty');
      }
    });

    it('should reject garbage text', () => {
      const result = parseVietnameseNotation('hello world', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });

    it('should reject text with no valid moves', () => {
      const result = parseVietnameseNotation('foo bar baz', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Dash normalization', () => {
    it('should normalize en-dash (U+2013) to hyphen', () => {
      const result = parseVietnameseNotation('P2–5', startFen); // en-dash
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
        expect(result[0]).toBe('h7e7');
      }
    });

    it('should normalize em-dash (U+2014) to hyphen', () => {
      const result = parseVietnameseNotation('P2—5', startFen); // em-dash
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
        expect(result[0]).toBe('h7e7');
      }
    });

    it('should handle mixed dashes in sequence', () => {
      const result = parseVietnameseNotation('P2–5 p8—5', startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(2);
        expect(result[0]).toBe('h7e7');
        expect(result[1]).toBe('h2e2');
      }
    });
  });

  describe('Unknown tokens', () => {
    it('should detect unknown tokens in the middle', () => {
      const result = parseVietnameseNotation('P2-5 garbage p8-5', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toMatch(/unrecognized|unknown/i);
      }
    });

    it('should accept moves with move numbers and delimiters', () => {
      const result = parseVietnameseNotation('1. P2-5 2. p8-5', startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(2);
      }
    });

    it('should accept moves with various delimiters', () => {
      const result = parseVietnameseNotation('P2-5, p8-5; M2.3', startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(3);
      }
    });
  });

  describe('Invalid notation formats', () => {
    it('should reject wrong piece symbol', () => {
      const result = parseVietnameseNotation('Q2-5', startFen); // Q not valid
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });

    it('should reject malformed notation with equals sign', () => {
      const result = parseVietnameseNotation('P2=5', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });

    it('should reject notation with missing operator', () => {
      const result = parseVietnameseNotation('P25', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });

    it('should reject notation with invalid file numbers', () => {
      const result = parseVietnameseNotation('P0-5', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });

    it('should reject notation with out-of-range file numbers', () => {
      const result = parseVietnameseNotation('P10-5', startFen);
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Valid edge cases', () => {
    it('should parse single move', () => {
      const result = parseVietnameseNotation('P2-5', startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
      }
    });

    it('should parse moves across multiple lines', () => {
      const notation = `P2-5 p8-5
M2.3 m8.7`;
      const result = parseVietnameseNotation(notation, startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(4);
      }
    });

    it('should handle extra whitespace', () => {
      const result = parseVietnameseNotation('  P2-5   p8-5  ', startFen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(2);
      }
    });
  });

  describe('Side mismatch detection', () => {
    it('should detect wrong side move at start', () => {
      const result = parseVietnameseNotation('p2-5', startFen); // black move, but red to play
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toContain('side mismatch');
      }
    });

    it('should detect wrong side move in sequence', () => {
      const result = parseVietnameseNotation('P2-5 P8-5', startFen); // two red moves
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toContain('side mismatch');
      }
    });
  });

  describe('Illegal moves', () => {
    it('should reject illegal cannon move', () => {
      const result = parseVietnameseNotation('P2.9', startFen); // cannon can't move 9 steps forward
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toMatch(/illegal|could not find/i);
      }
    });

    it('should reject move from empty square', () => {
      const result = parseVietnameseNotation('P5-6', startFen); // no cannon on file 5
      expect(Array.isArray(result)).toBe(false);
      if (!Array.isArray(result)) {
        expect(result.error).toMatch(/could not find/i);
      }
    });
  });

  describe('Trước/sau disambiguators', () => {
    it('should parse trước disambiguator', () => {
      const fen = '3k5/9/9/9/9/9/R8/9/R8/4K4 r';
      const result = parseVietnameseNotation('Xt9.1', fen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
        expect(result[0]).toBe('a6a5'); // front rook
      }
    });

    it('should parse sau disambiguator', () => {
      const fen = '3k5/9/9/9/9/9/R8/9/R8/4K4 r';
      const result = parseVietnameseNotation('Xs9.1', fen);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
        expect(result[0]).toBe('a8a7'); // back rook
      }
    });

    it('should handle disambiguators with piece moves', () => {
      const fen = '3k5/9/9/9/9/9/R8/9/R8/4K4 r';
      // Test that we can parse a move with disambiguator
      const result1 = parseVietnameseNotation('Xt9.1', fen);
      expect(Array.isArray(result1)).toBe(true);
      
      // Test without disambiguator (should pick first piece found)
      const result2 = parseVietnameseNotation('X9.1', fen);
      expect(Array.isArray(result2)).toBe(true);
    });
  });
});
