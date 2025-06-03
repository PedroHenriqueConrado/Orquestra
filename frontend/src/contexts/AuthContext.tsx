import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import type { LoginData, RegisterData, AuthResponse } from '../services/auth.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há um usuário logado ao carregar o componente
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro capturado no AuthContext.login:', err);
      setError(err.message || 'Ocorreu um erro durante o login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando registro no AuthContext:', data);
      await authService.register(data);
      console.log('Registro bem-sucedido, tentando login...');
      // Após o registro bem-sucedido, faz login automaticamente
      await login({ email: data.email, password: data.password });
    } catch (err: any) {
      console.error('Erro capturado no AuthContext.register:', err);
      setError(err.message || 'Ocorreu um erro durante o registro');
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const clearError = (): void => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 