import axios from 'axios';

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
      // Enviamos todos os dados incluindo confirmPassword para o backend
      console.log('Enviando dados para registro:', data);
      
      const response = await axios.post(`${API_URL}/auth/register`, data);
      console.log('Resposta do registro:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O servidor retornou uma resposta com status de erro
          console.log('Dados do erro:', error.response.data);
          if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          } else {
            throw new Error(`Erro ${error.response.status}: ${error.response.statusText}`);
          }
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          console.log('Sem resposta:', error.request);
          throw new Error('Servidor não respondeu à solicitação. Verifique sua conexão de internet.');
        }
      }
      
      // Para outros tipos de erro
      throw new Error('Ocorreu um erro inesperado durante o registro.');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Enviando dados para login:', data);
      
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
      console.log('Resposta do login:', response.data);
      
      // Armazena o token e dados do usuário no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O servidor retornou uma resposta com status de erro
          console.log('Dados do erro:', error.response.data);
          if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          } else {
            throw new Error(`Erro ${error.response.status}: ${error.response.statusText}`);
          }
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          console.log('Sem resposta:', error.request);
          throw new Error('Servidor não respondeu à solicitação. Verifique sua conexão de internet.');
        }
      }
      
      // Para outros tipos de erro
      throw new Error('Ocorreu um erro inesperado durante o login.');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService(); 