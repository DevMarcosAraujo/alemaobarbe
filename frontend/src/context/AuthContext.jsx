import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('vikings_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('vikings_token');
      localStorage.removeItem('vikings_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vikings_token', data.token);
    localStorage.setItem('vikings_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('vikings_token', data.token);
    localStorage.setItem('vikings_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('vikings_token');
    localStorage.removeItem('vikings_user');
    setUser(null);
    toast.success('Até logo, guerreiro!');
  }, []);

  const updateProfile = async (profileData) => {
    await api.put('/auth/profile', profileData);
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('vikings_user', JSON.stringify(updated));
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isClient,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
