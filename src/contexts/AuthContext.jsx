import { createContext, useContext, useState, useEffect } from 'react';
import { DUMMY_USER } from '../data/dummyData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('mg_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setUser(DUMMY_USER);
      sessionStorage.setItem('mg_user', JSON.stringify(DUMMY_USER));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (userData) => {
    const newUser = { ...DUMMY_USER, ...userData, id: 'usr_new_' + Date.now() };
    setUser(newUser);
    sessionStorage.setItem('mg_user', JSON.stringify(newUser));
    return { success: true };
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem('mg_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('mg_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
