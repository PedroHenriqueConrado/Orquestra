import axios from 'axios';
import api from './api.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'developer' | 'supervisor' | 'tutor' | 'project_manager' | 'team_leader' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

class AuthService {
  async register(data: RegisterData): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Erro ${error.response.status}`);
      }
      throw new Error('Erro ao registrar');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Usar axios diretamente, não o api configurado, para evitar ciclos de dependência
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
      
      // Armazena o token e dados do usuário no localStorage
      this.setToken(response.data.token);
      this.setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Erro ${error.response.status}`);
      }
      throw new Error('Erro ao fazer login');
    }
  }

  // Método para salvar o token no localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Método para salvar o usuário no localStorage
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      this.logout(); // Limpa o localStorage se houver erro
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    // Simplificando a verificação para apenas checar se o token existe
    const token = this.getToken();
    return !!token;
  }

  // Método para atualizar tokens - implementar quando o backend suportar refresh tokens
  async refreshToken(): Promise<boolean> {
    // Esta função deveria chamar uma rota de refresh token no backend
    // Por enquanto, apenas retorna false indicando que não temos essa capacidade
    console.log('Função de refresh token não implementada');
    return false;
  }
}

export default new AuthService(); 