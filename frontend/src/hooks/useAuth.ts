import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
  });

  useEffect(() => {
    // placeholder for real auth check, e.g., token in localStorage
    const token = localStorage.getItem('token');
    setAuthState({ isAuthenticated: !!token });
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setAuthState({ isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false });
  };

  return {
    ...authState,
    login,
    logout,
  };
};

export default useAuth;
