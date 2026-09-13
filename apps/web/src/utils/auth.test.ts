import { describe, it, expect, beforeEach } from 'vitest';
import {
  TOKEN_STORAGE_KEY,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getAuthHeaders,
} from './auth';

describe('Client Auth Utilities', () => {
  beforeEach(() => {
    // Clear localStorage and document.cookie before each test
    try {
      window.localStorage.clear();
    } catch {}
    document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0`;
  });

  it('should return null when no token is stored', () => {
    expect(getStoredToken()).toBeNull();
  });

  it('should store and retrieve token via localStorage and cookies', () => {
    const mockToken = 'sample_jwt_token_12345';
    setStoredToken(mockToken);

    expect(getStoredToken()).toBe(mockToken);
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(mockToken);
  });

  it('should remove stored token on clearStoredToken', () => {
    setStoredToken('temporary_token');
    expect(getStoredToken()).toBe('temporary_token');

    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it('should attach Authorization Bearer header when token exists', () => {
    setStoredToken('bearer_sample_token');
    const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

    expect(headers['Authorization']).toBe('Bearer bearer_sample_token');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should not attach Authorization header when no token is stored', () => {
    clearStoredToken();
    const headers = getAuthHeaders();

    expect(headers['Authorization']).toBeUndefined();
  });
});
