import api from './api.service';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

class UserService {
  /**
   * Busca todos os usuários disponíveis
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users');
      return response.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error(error.message || 'Erro ao buscar usuários');
    }
  }

  /**
   * Busca um usuário pelo ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw new Error(error.message || 'Erro ao buscar usuário');
    }
  }

  async getAvailableUsers(projectId: number): Promise<User[]> {
    const response = await api.get(`/users/available/${projectId}`);
    return response.data;
  }
}

export default new UserService(); 