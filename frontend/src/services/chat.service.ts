import api from './api.service';

export interface ChatMessage {
  id: number;
  project_id: number;
  user_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}

class ChatService {
  async getProjectMessages(projectId: number, page: number = 1, limit: number = 20): Promise<ChatMessagesResponse> {
    try {
      const response = await api.get<ChatMessagesResponse>(`/projects/${projectId}/chat`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(projectId: number, message: string): Promise<ChatMessage> {
    try {
      const response = await api.post<ChatMessage>(`/projects/${projectId}/chat`, { message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMessage(projectId: number, messageId: number): Promise<ChatMessage> {
    try {
      const response = await api.get<ChatMessage>(`/projects/${projectId}/chat/${messageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMessage(projectId: number, messageId: number, message: string): Promise<ChatMessage> {
    try {
      const response = await api.put<ChatMessage>(`/projects/${projectId}/chat/${messageId}`, { message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMessage(projectId: number, messageId: number): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/chat/${messageId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }

  private handleError(error: any): Error {
    console.error('Erro no serviço de chat:', error);
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error('Ocorreu um erro ao processar sua solicitação.');
  }
}

export default new ChatService(); 