import api from './api.service';
import type { TaskItem } from '../components/DraggableTaskBoard';

interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  parent_task_id?: number;
  project_id: number;
}

interface TaskWithUser extends TaskResponse {
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: number;
  position?: number;
}

class TasksService {
  // Obter todas as tarefas de um projeto
  async getProjectTasks(projectId: number): Promise<TaskWithUser[]> {
    try {
      const response = await api.get<TaskResponse[]>(`/projects/${projectId}/tasks`);
      
      // Obter os IDs dos usuários atribuídos às tarefas
      const userIds = new Set<number>();
      response.data.forEach((task: TaskResponse) => {
        if (task.assigned_to) {
          userIds.add(task.assigned_to);
        }
      });
      
      // Se houver usuários atribuídos, buscar informações deles
      let users: { [key: number]: { id: number; name: string; email: string } } = {};
      if (userIds.size > 0) {
        const userIdsArray = Array.from(userIds);
        const usersResponse = await api.get(`/users`, {
          params: { ids: userIdsArray.join(',') }
        });
        
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          usersResponse.data.forEach((user: { id: number; name: string; email: string }) => {
            users[user.id] = user;
          });
        }
      }
      
      // Combinar as tarefas com os dados de usuário
      const tasksWithUsers: TaskWithUser[] = response.data.map((task: TaskResponse) => {
        const taskWithUser: TaskWithUser = { ...task };
        if (task.assigned_to && users[task.assigned_to]) {
          taskWithUser.assignedUser = users[task.assigned_to];
        }
        return taskWithUser;
      });
      
      return tasksWithUsers;
    } catch (error) {
      console.error('Erro ao buscar tarefas do projeto:', error);
      throw error;
    }
  }

  // Obter uma tarefa específica pelo ID
  async getTaskById(taskId: number): Promise<TaskWithUser> {
    try {
      const response = await api.get<TaskResponse>(`/tasks/${taskId}`);
      
      const taskWithUser: TaskWithUser = { ...response.data };
      
      // Se a tarefa tiver um usuário atribuído, buscar dados dele
      if (response.data.assigned_to) {
        try {
          const userResponse = await api.get(`/users/${response.data.assigned_to}`);
          if (userResponse.data) {
            taskWithUser.assignedUser = userResponse.data;
          }
        } catch (userError) {
          console.error('Erro ao buscar dados do usuário atribuído:', userError);
        }
      }
      
      return taskWithUser;
    } catch (error) {
      console.error('Erro ao buscar detalhes da tarefa:', error);
      throw error;
    }
  }

  // Criar uma nova tarefa
  async createTask(projectId: number, taskData: Omit<TaskUpdatePayload, 'position'>): Promise<TaskResponse> {
    try {
      const response = await api.post<TaskResponse>(`/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Atualizar uma tarefa existente
  async updateTask(taskId: number, taskData: TaskUpdatePayload): Promise<TaskResponse> {
    try {
      const response = await api.put<TaskResponse>(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  // Excluir uma tarefa
  async deleteTask(taskId: number): Promise<void> {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  }

  // Atualizar o status e posição de uma tarefa (para drag-and-drop)
  async updateTaskStatus(projectId: number, taskId: number, newStatus: string, newPosition?: number): Promise<TaskResponse> {
    try {
      if (!projectId) {
        throw new Error('ID do projeto é obrigatório para atualizar o status da tarefa');
      }
      
      const updateData: TaskUpdatePayload = { 
        status: newStatus as 'pending' | 'in_progress' | 'completed'
      };
      
      if (newPosition !== undefined) {
        updateData.position = newPosition;
      }
      
      // Usar a rota correta com método PUT conforme definido no backend
      const url = `/projects/${projectId}/tasks/${taskId}/status`;
      
      // PUT é o método correto definido no backend para esta rota
      const response = await api.put<TaskResponse>(url, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      throw error;
    }
  }
}

export default new TasksService(); 