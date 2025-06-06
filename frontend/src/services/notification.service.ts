import api from './api.service';

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}

class NotificationService {
  // Buscar notificações do usuário
  async getUserNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    try {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar notificações');
    }
  }

  // Obter contagem de notificações não lidas
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread/count');
      return response.data.count;
    } catch (error: any) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
      return 0; // Em caso de erro, retorna 0 para não interromper o fluxo da aplicação
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: number): Promise<Notification> {
    try {
      const response = await api.put<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao marcar notificação ${notificationId} como lida:`, error);
      throw new Error(error.response?.data?.error || 'Erro ao marcar notificação como lida');
    }
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
    } catch (error: any) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw new Error(error.response?.data?.error || 'Erro ao marcar todas as notificações como lidas');
    }
  }

  // Excluir uma notificação
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      console.error(`Erro ao excluir notificação ${notificationId}:`, error);
      throw new Error(error.response?.data?.error || 'Erro ao excluir notificação');
    }
  }

  // Formatar a data da notificação
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
}

export default new NotificationService(); 