const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const REMEMBER_ME_KEY = 'remember_me';

export const setToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window !== 'undefined') {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};

export const setUserData = (userData: any, rememberMe: boolean = false): void => {
  if (typeof window !== 'undefined') {
    const userDataString = JSON.stringify(userData);
    if (rememberMe) {
      localStorage.setItem(USER_KEY, userDataString);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(USER_KEY, userDataString);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }
};

export const getUserData = (): any | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
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

export const getRememberMe = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }
  return false;
};