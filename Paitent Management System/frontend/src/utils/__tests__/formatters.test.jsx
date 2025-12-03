import { describe, it, expect } from 'vitest';
import { formatHbA1cTrend, formatTrend } from '../formatters';

describe('HbA1c Trend Formatter', () => {
  describe('Color Coding', () => {
    it('should return green color for positive HbA1c drop', () => {
      const result = formatHbA1cTrend(1.5, 2);
      expect(result.props.className).toContain('text-green-600');
    });

    it('should return red color for negative HbA1c drop', () => {
      const result = formatHbA1cTrend(-1.0, 2);
      expect(result.props.className).toContain('text-red-500');
    });

    it('should return yellow color for zero HbA1c drop', () => {
      const result = formatHbA1cTrend(0, 2);
      expect(result.props.className).toContain('text-yellow-500');
    });
  });

  describe('Decimal Formatting', () => {
    it('should format to 2 decimal places when specified', () => {
      const result = formatHbA1cTrend(1.5, 2);
      expect(result.props.children).toBe('1.50');
    });

    it('should format to 0 decimal places by default', () => {
      const result = formatHbA1cTrend(1.5);
      expect(result.props.children).toBe('2');
    });

    it('should round correctly', () => {
      const result = formatHbA1cTrend(1.567, 2);
      expect(result.props.children).toBe('1.57');
    });

    it('should handle negative values with decimals', () => {
      const result = formatHbA1cTrend(-2.345, 2);
      expect(result.props.children).toBe('-2.35');
    });
  });

  describe('Null Handling', () => {
    it('should return dash for null values', () => {
      const result = formatHbA1cTrend(null);
      expect(result).toBe('-');
    });

    it('should return dash for undefined values', () => {
      const result = formatHbA1cTrend(undefined);
      expect(result).toBe('-');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small positive numbers', () => {
      const result = formatHbA1cTrend(0.01, 2);
      expect(result.props.className).toContain('text-green-600');
      expect(result.props.children).toBe('0.01');
    });

    it('should handle very small negative numbers', () => {
      const result = formatHbA1cTrend(-0.01, 2);
      expect(result.props.className).toContain('text-red-500');
      expect(result.props.children).toBe('-0.01');
    });

    it('should handle string numbers', () => {
      const result = formatHbA1cTrend('1.5', 2);
      expect(result.props.children).toBe('1.50');
    });
  });
});

describe('General Trend Formatter', () => {
  describe('Color Coding (Inverse Logic)', () => {
    it('should return red color for positive values (bad)', () => {
      const result = formatTrend(1.5, 2);
      expect(result.props.className).toContain('text-red-500');
    });

    it('should return green color for negative values (good)', () => {
      const result = formatTrend(-1.0, 2);
      expect(result.props.className).toContain('text-green-600');
    });

    it('should return yellow color for zero', () => {
      const result = formatTrend(0, 2);
      expect(result.props.className).toContain('text-yellow-500');
    });
  });

  describe('Decimal Formatting', () => {
    it('should format to 2 decimal places when specified', () => {
      const result = formatTrend(-1.5, 2);
      expect(result.props.children).toBe('-1.50');
    });

    it('should format to 0 decimal places by default', () => {
      const result = formatTrend(-1.5);
      expect(result.props.children).toBe('-2');
    });
  });

  describe('Null Handling', () => {
    it('should return dash for null values', () => {
      const result = formatTrend(null);
      expect(result).toBe('-');
    });

    it('should return dash for undefined values', () => {
      const result = formatTrend(undefined);
      expect(result).toBe('-');
    });
  });

  describe('Comparison with HbA1c Formatter', () => {
    it('should have opposite color logic for same positive value', () => {
      const hba1cResult = formatHbA1cTrend(1.5, 2);
      const trendResult = formatTrend(1.5, 2);
      
      expect(hba1cResult.props.className).toContain('text-green-600');
      expect(trendResult.props.className).toContain('text-red-500');
    });

    it('should have opposite color logic for same negative value', () => {
      const hba1cResult = formatHbA1cTrend(-1.5, 2);
      const trendResult = formatTrend(-1.5, 2);
      
      expect(hba1cResult.props.className).toContain('text-red-500');
      expect(trendResult.props.className).toContain('text-green-600');
    });
  });
});
