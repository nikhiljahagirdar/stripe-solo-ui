import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  iat: number;
  user?: any;
  [key: string]: any;
}

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    // If token is invalid or can't be decoded, consider it expired
    console.warn('Invalid token format:', error);
    return true;
  }
};

/**
 * Get time until token expires in seconds
 */
export const getTokenExpiryTime = (token: string): number => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    console.warn('Failed to decode token for expiry time:', error);
    return 0;
  }
};

/**
 * Check if token will expire within the next X seconds
 */
export const isTokenExpiringSoon = (token: string, secondsThreshold: number = 300): boolean => {
  const timeUntilExpiry = getTokenExpiryTime(token);
  return timeUntilExpiry <= secondsThreshold;
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

/**
 * Validate token and redirect to login if expired
 */
export const validateTokenAndRedirect = (token: string | null, router: any): boolean => {
  if (!token) {
    console.log('No token found, redirecting to login');
    router.push('/auth/login');
    return false;
  }

  if (isTokenExpired(token)) {
    console.log('Token expired, clearing data and redirecting to login');
    clearAuthData();
    
    // Show a toast notification if available
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast.error('Your session has expired. Please log in again.');
    }
    
    router.push('/auth/login');
    return false;
  }

  // Token is valid
  return true;
};

/**
 * Enhanced token validation with detailed logging
 */
export const validateTokenDetailed = (token: string | null): {
  isValid: boolean;
  isExpired: boolean;
  expiresInSeconds: number;
  willExpireSoon: boolean;
  error?: string;
} => {
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
      expiresInSeconds: 0,
      willExpireSoon: true,
      error: 'No token provided'
    };
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    const expiresInSeconds = decoded.exp - currentTime;
    const isExpired = expiresInSeconds <= 0;
    const willExpireSoon = expiresInSeconds <= 300; // 5 minutes

    return {
      isValid: !isExpired,
      isExpired,
      expiresInSeconds,
      willExpireSoon,
      error: undefined
    };
  } catch (error) {
    console.warn('Token validation error:', error);
    return {
      isValid: false,
      isExpired: true,
      expiresInSeconds: 0,
      willExpireSoon: true,
      error: error instanceof Error ? error.message : 'Invalid token format'
    };
  }
};

/**
 * Get user info from token
 */
export const getUserFromToken = (token: string): any => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user || decoded;
  } catch (error) {
    console.warn('Failed to extract user from token:', error);
    return null;
  }
};

/**
 * Check token and return user info or null if invalid
 */
export const getAuthenticatedUser = (token: string | null): any => {
  if (!token) return null;
  
  const validation = validateTokenDetailed(token);
  if (!validation.isValid) {
    return null;
  }
  
  return getUserFromToken(token);
};

/**
 * Auto-logout when token expires
 */
export const setupAutoLogout = (router: any, token: string | null): NodeJS.Timeout | null => {
  if (!token) return null;

  const expiryTime = getTokenExpiryTime(token);
  
  if (expiryTime <= 0) {
    // Token already expired
    validateTokenAndRedirect(token, router);
    return null;
  }

  // Set up timeout to logout when token expires
  return setTimeout(() => {
    console.log('Token expired during session, logging out...');
    validateTokenAndRedirect(token, router);
  }, expiryTime * 1000); // Convert to milliseconds
};
