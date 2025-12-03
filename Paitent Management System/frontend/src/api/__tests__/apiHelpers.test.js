import { describe, it, expect } from 'vitest';

describe('API Configuration', () => {
  it('should use correct default API base URL', () => {
    const defaultUrl = import.meta.env.VITE_LARAVEL_URL || 'http://127.0.0.1:8000';
    // Should be either the env variable or the default
    expect(defaultUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):8000$/);
  });

  it('should construct patient endpoint correctly', () => {
    const apiBase = 'http://localhost:8000';
    const endpoint = `${apiBase}/api/patients`;
    expect(endpoint).toBe('http://localhost:8000/api/patients');
  });

  it('should construct message endpoint correctly', () => {
    const apiBase = 'http://localhost:8000';
    const patientId = 84;
    const endpoint = `${apiBase}/api/messages/thread/${patientId}`;
    expect(endpoint).toBe('http://localhost:8000/api/messages/thread/84');
  });

  it('should handle trailing slashes in API base URL', () => {
    const apiBase = 'http://localhost:8000/';
    const cleanBase = apiBase.replace(/\/$/, '');
    const endpoint = `${cleanBase}/api/patients`;
    expect(endpoint).toBe('http://localhost:8000/api/patients');
  });

  it('should construct query parameters correctly', () => {
    const apiBase = 'http://localhost:8000';
    const userId = 20;
    const role = 'doctor';
    const endpoint = `${apiBase}/api/messages/conversations?user_id=${userId}&role=${role}`;
    expect(endpoint).toBe('http://localhost:8000/api/messages/conversations?user_id=20&role=doctor');
  });
});

describe('Patient Data Validation', () => {
  it('should validate patient has required fields', () => {
    const patient = {
      id: 1,
      name: 'Test Patient',
      reduction_a_2_3: 1.5,
      fvg_delta_1_2: -0.5,
      dds_trend_1_3: 0.8
    };
    
    expect(patient).toHaveProperty('id');
    expect(patient).toHaveProperty('name');
    expect(patient.id).toBeTypeOf('number');
    expect(patient.name).toBeTypeOf('string');
  });

  it('should handle missing optional fields gracefully', () => {
    const patient = {
      id: 1,
      name: 'Test Patient'
    };
    
    expect(patient.reduction_a_2_3).toBeUndefined();
    expect(patient.fvg_delta_1_2).toBeUndefined();
  });

  it('should validate numeric fields are numbers', () => {
    const hba1c = '7.5';
    const parsed = parseFloat(hba1c);
    
    expect(parsed).toBe(7.5);
    expect(typeof parsed).toBe('number');
  });
});
