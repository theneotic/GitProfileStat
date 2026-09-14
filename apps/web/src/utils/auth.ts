/**
 * Centralized Client Authentication and Token Management Utility
 * Solves third-party cookie restrictions across modern browsers.
 */

export const TOKEN_STORAGE_KEY = 'gitprofilestats_token';

/**
 * Retrieve the active authentication token from localStorage or first-party cookie.
 * @returns The active JWT bearer token string, or null if unauthenticated.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // 1. Try localStorage
  try {
    const local = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (local && local.trim().length > 0) {
      return local.trim();
    }
  } catch {
    // localStorage may be disabled or restricted in incognito
  }

  // 2. Try first-party cookie
  try {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const rawCookie of cookies) {
      const trimmed = rawCookie.trim();
      if (trimmed.startsWith(`${TOKEN_STORAGE_KEY}=`)) {
        const val = trimmed.slice(TOKEN_STORAGE_KEY.length + 1);
        if (val) {
          return decodeURIComponent(val);
        }
      }
    }
  } catch {
    // Cookie access restricted
  }

  return null;
}

/**
 * Store the authentication token in localStorage and a first-party cookie.
 * @param token - Clean JWT session token string received from backend OAuth redirect.
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined' || !token) {
    return;
  }

  const cleanToken = token.trim();

  // Save to localStorage
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, cleanToken);
  } catch {
    // localStorage restricted
  }

  // Save to first-party cookie (7 days expiry, SameSite=Lax)
  try {
    const maxAge = 7 * 24 * 60 * 60;
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(cleanToken)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  } catch {
    // Cookie access restricted
  }
}

/**
 * Clear stored authentication credentials from both localStorage and cookies.
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }

  try {
    document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

/**
 * Merge existing request headers with Authorization Bearer header if token exists.
 * @param extraHeaders - Optional incoming HeadersInit headers to merge.
 * @returns Headers record containing Authorization header if token is present.
 */
export function getAuthHeaders(extraHeaders: HeadersInit = {}): Record<string, string> {
  const headers: Record<string, string> = {};

  if (extraHeaders) {
    if (typeof Headers !== 'undefined' && extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extraHeaders)) {
      extraHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else if (typeof extraHeaders === 'object') {
      Object.assign(headers, extraHeaders as Record<string, string>);
    }
  }

  const token = getStoredToken();
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Wrapper around standard fetch to attach credentials and Bearer token automatically.
 * @param input - Target RequestInfo or URL.
 * @param init - Request initialization options.
 * @returns Promise resolving to the HTTP Response.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const mergedHeaders = getAuthHeaders(init?.headers);

  const mergedInit: RequestInit = {
    ...init,
    credentials: init?.credentials ?? 'include',
    headers: mergedHeaders,
  };

  return fetch(input, mergedInit);
}
