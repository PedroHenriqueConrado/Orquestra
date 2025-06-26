import api from './api.service';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskAssignee {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface TaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignees: number[]; // IDs dos responsáveis
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: number;
}

export interface Task extends Omit<TaskData, 'assignees'> {
  id: number;
  project_id: number;
  created_at: string;
  updated_at: string;
  assignees: TaskAssignee[];
}

class TaskService {
  /**
   * Cria uma nova tarefa para um projeto
   */
  async createTask(projectId: number, taskData: TaskData): Promise<Task> {
    try {
      const backendTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.due_date,
        estimatedHours: taskData.estimated_hours,
        parentTaskId: taskData.parent_task_id,
        assignees: taskData.assignees
      };
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, backendTaskData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      throw new Error(error.message || 'Erro ao criar tarefa');
    }
  }

  /**
   * Busca todas as tarefas de um projeto
   */
  async getProjectTasks(projectId: number): Promise<Task[]> {
    try {
      const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
      return response.data || [];
    } catch (error: any) {
      console.error(`Erro ao buscar tarefas do projeto ${projectId}:`, error);
      throw new Error(error.message || 'Erro ao buscar tarefas do projeto');
    }
  }

  /**
   * Atualiza o status de uma tarefa
   */
  async updateTaskStatus(projectId: number, taskId: number, status: TaskStatus): Promise<Task> {
    try {
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, { status });
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar status da tarefa ${taskId}:`, error);
      throw new Error(error.message || 'Erro ao atualizar status da tarefa');
    }
  }

  /**
   * Busca uma tarefa específica pelo ID
   */
  async getTaskById(projectId: number, taskId: number): Promise<Task> {
    try {
      const response = await api.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar tarefa ${taskId}:`, error);
      throw new Error(error.message || 'Erro ao buscar detalhes da tarefa');
    }
  }

  /**
   * Atualiza uma tarefa existente
   */
  async updateTask(projectId: number, taskId: number, taskData: Partial<TaskData>): Promise<Task> {
    try {
      const backendTaskData: Record<string, any> = {};
      if (taskData.title !== undefined) backendTaskData.title = taskData.title;
      if (taskData.description !== undefined) backendTaskData.description = taskData.description;
      if (taskData.status !== undefined) backendTaskData.status = taskData.status;
      if (taskData.priority !== undefined) backendTaskData.priority = taskData.priority;
      if (taskData.due_date !== undefined) backendTaskData.dueDate = taskData.due_date;
      if (taskData.estimated_hours !== undefined) backendTaskData.estimatedHours = taskData.estimated_hours;
      if (taskData.actual_hours !== undefined) backendTaskData.actualHours = taskData.actual_hours;
      if (taskData.parent_task_id !== undefined) backendTaskData.parentTaskId = taskData.parent_task_id;
      if (taskData.assignees !== undefined) backendTaskData.assignees = taskData.assignees;
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, backendTaskData);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar tarefa ${taskId}:`, error);
      throw new Error(error.message || 'Erro ao atualizar tarefa');
    }
  }

  /**
   * Exclui uma tarefa
   */
  async deleteTask(projectId: number, taskId: number): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    } catch (error: any) {
      console.error(`Erro ao excluir tarefa ${taskId}:`, error);
      throw new Error(error.message || 'Erro ao excluir tarefa');
    }
  }
}

export default new TaskService(); 