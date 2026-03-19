import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const savedToken    = localStorage.getItem('token');
  const savedRole     = localStorage.getItem('role');
  const savedName     = localStorage.getItem('userName');
  const savedUserId   = localStorage.getItem('userId');

  const [token, setToken]   = useState(savedToken || null);
  const [role, setRole]     = useState(savedRole  || null);
  const [userName, setUserName] = useState(savedName  || '');
  const [userId, setUserId] = useState(savedUserId || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!savedToken);

  // Check token validity on mount
  useEffect(() => {
    if (savedToken) {
      // You could add token validation logic here
      setIsAuthenticated(true);
    }
  }, [savedToken]);

  const login = (tok, rl, name, id) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('role', rl);
    localStorage.setItem('userName', name || '');
    localStorage.setItem('userId', id || '');
    setToken(tok); 
    setRole(rl); 
    setUserName(name || ''); 
    setUserId(id || '');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUserName('');
    setUserId('');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      token, role, userName, userId, isAuthenticated, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}