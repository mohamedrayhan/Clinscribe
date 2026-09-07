import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginDoctor, signupDoctor, getMe } from '../api/client';

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  hospital_name?: string;
  phone?: string;
}

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    specialization?: string;
    hospital_name?: string;
  }) => Promise<void>;
  logout: () => void;
  updateDoctorState: (data: Partial<Doctor>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('doctor_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await getMe();
          setDoctor(profile);
          setIsAuthenticated(true);
        } catch (err) {
          console.warn('Stored token is invalid or expired:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginDoctor({ email, password });
    localStorage.setItem('doctor_token', res.access_token);
    setToken(res.access_token);
    setDoctor(res.doctor);
    setIsAuthenticated(true);
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    specialization?: string;
    hospital_name?: string;
  }) => {
    const res = await signupDoctor(data);
    localStorage.setItem('doctor_token', res.access_token);
    setToken(res.access_token);
    setDoctor(res.doctor);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('doctor_token');
    localStorage.removeItem('doctor_info');
    // Clear any local caches
    setToken(null);
    setDoctor(null);
    setIsAuthenticated(false);
  };

  const updateDoctorState = (data: Partial<Doctor>) => {
    if (doctor) {
      setDoctor({ ...doctor, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        token,
        isAuthenticated,
        login,
        signup,
        logout,
        updateDoctorState,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
