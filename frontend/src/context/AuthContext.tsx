import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { sounds } from '../utils/sound';

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (username: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('khmer_token'));
  const [selectedGrade, setSelectedGradeState] = useState<number>(() => {
    const saved = localStorage.getItem('khmer_grade');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const setSelectedGrade = (grade: number) => {
    setSelectedGradeState(grade);
    localStorage.setItem('khmer_grade', grade.toString());
    sounds.playClick();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          if (userData.grade_level) {
            setSelectedGradeState(userData.grade_level);
            localStorage.setItem('khmer_grade', userData.grade_level.toString());
          }
        } catch (err) {
          console.error("Failed to fetch current user:", err);
          localStorage.removeItem('khmer_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (username: string, pass: string) => {
    const res = await api.login(username, pass);
    localStorage.setItem('khmer_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.grade_level) {
      setSelectedGrade(res.user.grade_level);
    }
    sounds.playCorrect();
    closeAuthModal();
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('khmer_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.grade_level) {
      setSelectedGrade(res.user.grade_level);
    }
    sounds.playCorrect();
    closeAuthModal();
  };

  const logout = () => {
    localStorage.removeItem('khmer_token');
    setToken(null);
    setUser(null);
    sounds.playClick();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedGrade,
        setSelectedGrade,
        soundEnabled,
        toggleSound,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
