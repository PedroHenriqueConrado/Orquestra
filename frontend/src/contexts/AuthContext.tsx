import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { USER_KEY } from '../config';

// Definindo interfaces localmente já que foram removidas da importação
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

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
  refreshSession: () => Promise<boolean>;
  updateProfile: (data: { name: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Função para verificar se o token parece válido (formato básico)
  const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    
    // Verifica se o token tem o formato básico de um JWT (três partes separadas por ponto)
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Função para carregar o usuário do localStorage
  const loadUserFromStorage = (): User | null => {
    try {
      const token = authService.getToken();
      const userStr = localStorage.getItem(USER_KEY);
      
      if (token && userStr && isTokenValid(token)) {
        return JSON.parse(userStr);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
      return null;
    }
  };

  // Inicialização do contexto de autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = loadUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setIsLoggedIn(true);
          console.log('Usuário carregado do localStorage:', storedUser.name);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
        // Não fazer logout automático em caso de erro
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Função para tentar renovar a sessão
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('AuthContext: Tentando renovar sessão');
      
      const token = authService.getToken();
      
      // Se não há token, não podemos renovar a sessão
      if (!token) {
        console.log('AuthContext: Sem token para renovar sessão');
        return false;
      }
      
      // Verifica se o token parece válido
      if (!isTokenValid(token)) {
        console.log('AuthContext: Token inválido para renovar sessão');
        return false;
      }
      
      // Tenta carregar o usuário do localStorage
      const storedUser = loadUserFromStorage();
      
      if (storedUser) {
        // Atualiza o estado do usuário no contexto
        setUser(storedUser);
        setIsLoggedIn(true);
        console.log('AuthContext: Sessão renovada com sucesso para', storedUser.name);
        
        // Apenas para debug: imprime quando o token irá expirar
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expiryDate = new Date(tokenData.exp * 1000);
          console.log('AuthContext: Token expira em', expiryDate.toLocaleString());
        } catch (error) {
          console.error('AuthContext: Erro ao decodificar token para debug', error);
        }
        
        return true;
      }
      
      console.log('AuthContext: Não foi possível renovar a sessão, usuário não encontrado no localStorage');
      return false;
    } catch (error) {
      console.error('AuthContext: Erro ao renovar sessão:', error);
      return false;
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      
      if (response.token && isTokenValid(response.token)) {
        setUser(response.user);
        setIsLoggedIn(true);
        navigate('/dashboard');
      } else {
        throw new Error('Token de autenticação inválido');
      }
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
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const clearError = (): void => {
    setError(null);
  };

  const updateProfile = async (data: { name: string }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updatePassword(currentPassword, newPassword);
    } catch (err: any) {
      console.error('Erro ao atualizar senha:', err);
      setError(err.message || 'Erro ao atualizar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount();
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
    clearError,
    refreshSession,
    updateProfile,
    updatePassword,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 