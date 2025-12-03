import { describe, it, expect } from 'vitest';
import { getStatusTag } from '../patientStatus';

describe('Patient Status Classification', () => {
  describe('Improving Status', () => {
    it('should return Improving when HbA1c drop > 1.0', () => {
      const patient = { 
        reduction_a_2_3: 1.5, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });

    it('should return Improving when HbA1c drop is exactly 1.1', () => {
      const patient = { 
        reduction_a_2_3: 1.1, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });

    it('should return Improving when FVG delta < -1.0', () => {
      const patient = { 
        reduction_a_2_3: 0, 
        fvg_delta_1_2: -1.5, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });

    it('should return Improving when both HbA1c and FVG are improving', () => {
      const patient = { 
        reduction_a_2_3: 2.0, 
        fvg_delta_1_2: -2.0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });
  });

  describe('Worsening Status', () => {
    it('should return Worsening when HbA1c drop < 0', () => {
      const patient = { 
        reduction_a_2_3: -1.0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Worsening');
    });

    it('should return Worsening when HbA1c drop is slightly negative', () => {
      const patient = { 
        reduction_a_2_3: -0.1, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Worsening');
    });

    it('should return Worsening when FVG delta > 1.0', () => {
      const patient = { 
        reduction_a_2_3: 0.5, 
        fvg_delta_1_2: 1.5, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Worsening');
    });

    it('should return Worsening when both metrics are worsening', () => {
      const patient = { 
        reduction_a_2_3: -0.5, 
        fvg_delta_1_2: 2.0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Worsening');
    });
  });

  describe('Needs Review Status', () => {
    it('should return Needs Review when DDS trend > 1', () => {
      const patient = { 
        reduction_a_2_3: 0.5, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 1.5 
      };
      expect(getStatusTag(patient)).toBe('Needs Review');
    });

    it('should return Needs Review even with good HbA1c if DDS is high', () => {
      const patient = { 
        reduction_a_2_3: 0.8, 
        fvg_delta_1_2: -0.5, 
        dds_trend_1_3: 2.0 
      };
      expect(getStatusTag(patient)).toBe('Needs Review');
    });
  });

  describe('Stable Status', () => {
    it('should return Stable for moderate HbA1c changes', () => {
      const patient = { 
        reduction_a_2_3: 0.5, 
        fvg_delta_1_2: 0.3, 
        dds_trend_1_3: 0.5 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should return Stable when HbA1c drop is exactly 1.0', () => {
      const patient = { 
        reduction_a_2_3: 1.0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should return Stable when HbA1c drop is exactly 0', () => {
      const patient = { 
        reduction_a_2_3: 0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should return Stable when FVG delta is exactly -1.0', () => {
      const patient = { 
        reduction_a_2_3: 0, 
        fvg_delta_1_2: -1.0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should return Stable when DDS trend is exactly 1', () => {
      const patient = { 
        reduction_a_2_3: 0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 1 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', () => {
      const patient = { 
        reduction_a_2_3: null, 
        fvg_delta_1_2: null, 
        dds_trend_1_3: null 
      };
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should handle missing properties', () => {
      const patient = {};
      expect(getStatusTag(patient)).toBe('Stable');
    });

    it('should prioritize HbA1c over FVG for Improving status', () => {
      const patient = { 
        reduction_a_2_3: 1.5, 
        fvg_delta_1_2: 2.0, // Would be worsening
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });

    it('should handle very large positive HbA1c drop', () => {
      const patient = { 
        reduction_a_2_3: 5.0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Improving');
    });

    it('should handle very large negative HbA1c drop', () => {
      const patient = { 
        reduction_a_2_3: -3.0, 
        fvg_delta_1_2: 0, 
        dds_trend_1_3: 0 
      };
      expect(getStatusTag(patient)).toBe('Worsening');
    });
  });
});
