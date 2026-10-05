import { describe, it, expect } from 'vitest';
import { parseVietnameseNotation } from '../parseVietnameseNotation';

describe('Vietnamese Notation Parser', () => {
  const startFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';

  it('should parse horizontal cannon move successfully', () => {
    const notation = 'P2-5';
    const result = parseVietnameseNotation(notation, startFen);

    if (!Array.isArray(result)) {
      console.log('Parse error:', result.error);
      expect(false).toBe(true);
      return;
    }

    expect(result.length).toBe(1);
    expect(result[0]).toMatch(/^[a-i][0-9][a-i][0-9]$/);
  });

  it('should parse horizontal cannon move', () => {
    const notation = 'P2-5';
    const result = parseVietnameseNotation(notation, startFen);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBe(1);
      expect(result[0]).toBe('h7e7');
    }
  });

  it('should return error for invalid notation', () => {
    const notation = 'X99.99';
    const result = parseVietnameseNotation(notation, startFen);

    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid');
    }
  });

  it('should return error for illegal move', () => {
    const notation = 'P2.9';
    const result = parseVietnameseNotation(notation, startFen);

    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.error).toBeDefined();
      expect(result.error).toMatch(/Could not find piece|Illegal/);
    }
  });

  it('should return error for wrong side move', () => {
    const notation = 'p2.5 P2.5';
    const result = parseVietnameseNotation(notation, startFen);

    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.error).toBeDefined();
      expect(result.error).toContain('side mismatch');
    }
  });

  it('should parse two sequential moves', () => {
    const notation = 'P2-5 p8-5';
    const result = parseVietnameseNotation(notation, startFen);

    if (!Array.isArray(result)) {
      console.log('Parse error:', result.error);
      expect(false).toBe(true);
      return;
    }

    expect(result.length).toBe(2);
    expect(result[0]).toMatch(/^[a-i][0-9][a-i][0-9]$/);
    expect(result[1]).toMatch(/^[a-i][0-9][a-i][0-9]$/);
  });

  it('should differentiate uppercase and lowercase piece symbols by side', () => {
    const redMove = 'P2-5';
    const result1 = parseVietnameseNotation(redMove, startFen);

    expect(Array.isArray(result1)).toBe(true);
    if (!Array.isArray(result1)) return;

    expect(result1.length).toBe(1);

    const bothMoves = 'P2-5 p8-5';
    const result2 = parseVietnameseNotation(bothMoves, startFen);
    
    expect(Array.isArray(result2)).toBe(true);
    if (!Array.isArray(result2)) return;

    expect(result2.length).toBe(2);
  });
});
