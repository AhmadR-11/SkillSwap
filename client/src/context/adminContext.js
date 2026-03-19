// client/src/context/AdminContext.jsx
import React, { createContext, useState } from 'react';

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  // try to hydrate token from localStorage
  const saved = localStorage.getItem('adminToken') || null;
  const [token, setToken] = useState(saved);

  const login = (t) => {
    localStorage.setItem('adminToken', t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <AdminContext.Provider value={{ token, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
