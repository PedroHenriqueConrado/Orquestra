import api from './api.service';

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCommentData {
  content: string;
  rating?: number;
}

export interface UpdateCommentData {
  content: string;
  rating?: number;
}

export interface CommentsResponse {
  comments: TaskComment[];
  pagination: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
}

class TaskCommentService {
  /**
   * Cria um novo comentário em uma tarefa
   */
  async createComment(projectId: number, taskId: number, data: CreateCommentData): Promise<TaskComment> {
    const response = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data);
    return response.data;
  }

  /**
   * Obtém todos os comentários de uma tarefa com paginação
   */
  async getTaskComments(
    projectId: number, 
    taskId: number, 
    page: number = 1, 
    limit: number = 10
  ): Promise<CommentsResponse> {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`, {
      params: { page, limit }
    });
    return response.data;
  }

  /**
   * Obtém um comentário específico
   */
  async getComment(projectId: number, taskId: number, commentId: number): Promise<TaskComment> {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  }

  /**
   * Atualiza um comentário
   */
  async updateComment(
    projectId: number, 
    taskId: number, 
    commentId: number, 
    data: UpdateCommentData
  ): Promise<TaskComment> {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Remove um comentário
   */
  async deleteComment(projectId: number, taskId: number, commentId: number): Promise<void> {
    await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  }
}

export default new TaskCommentService(); 