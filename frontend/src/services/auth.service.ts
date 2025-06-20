import { API_URL, TOKEN_KEY, USER_KEY } from '../config';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  getToken(): string {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return '';
      
      // Verificar se o token está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Converter para milissegundos
      const currentTime = Date.now();
      
      if (currentTime >= expiryTime) {
        console.log('Token expirado, removendo do localStorage');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return '';
      }
      
      return token;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return '';
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }

    const responseData = await response.json();
    localStorage.setItem(TOKEN_KEY, responseData.token);
    this.setUser(responseData.user);
    return responseData;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao obter perfil');
    }

    const user = await response.json();
    this.setUser(user);
    return user;
  }

  async updateProfile(data: { name: string }): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }

    const user = await response.json();
    this.setUser(user);
    return user;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar senha');
    }
  }

  async logout(): Promise<void> {
    try {
      // Tenta invalidar o token no backend
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.warn('Erro ao invalidar token no servidor:', error);
    } finally {
      // Limpa os dados locais independente do resultado da chamada ao servidor
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Limpa qualquer outro dado relacionado à sessão
      sessionStorage.clear();
      
      // Força um reload da página para limpar o estado da aplicação
      window.location.href = '/login';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.getUser();
  }

  async deleteAccount(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir conta');
    }

    this.logout();
  }
}

export default new AuthService(); 