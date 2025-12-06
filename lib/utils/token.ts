const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const setUserData = (userData: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }
};

export const getUserData = (): any | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_KEY);
    if (!data || data === 'undefined' || data === 'null') {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};