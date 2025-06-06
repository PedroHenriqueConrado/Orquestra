import api from './api.service';

export interface DirectMessage {
    id: number;
    chat_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    sender: {
        id: number;
        name: string;
        email: string;
    };
    receiver?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface UserChat {
    id: number;
    name?: string;
    is_group: boolean;
    created_at: string;
    updated_at: string;
    users: {
        id: number;
        name: string;
        email: string;
    }[];
    messages: DirectMessage[];
    unreadCount: number;
}

export interface ChatMessagesResponse {
    messages: DirectMessage[];
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
        perPage: number;
    };
}

class DirectChatService {
    // Iniciar um chat com outro usuário
    async startChat(receiverId: number): Promise<UserChat> {
        try {
            const response = await api.post<UserChat>('/direct-messages/start', { receiverId });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao iniciar chat:', error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao iniciar chat');
        }
    }

    // Obter a lista de chats do usuário
    async getUserChats(): Promise<UserChat[]> {
        try {
            const response = await api.get<UserChat[]>('/direct-messages');
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar chats:', error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao buscar chats');
        }
    }

    // Obter mensagens de um chat
    async getChatMessages(chatId: number, page: number = 1, limit: number = 20): Promise<ChatMessagesResponse> {
        try {
            const response = await api.get<ChatMessagesResponse>(`/direct-messages/${chatId}/messages`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar mensagens do chat ${chatId}:`, error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao buscar mensagens');
        }
    }

    // Enviar mensagem em um chat
    async sendMessage(chatId: number, message: string): Promise<DirectMessage> {
        try {
            const response = await api.post<DirectMessage>(`/direct-messages/${chatId}/messages`, { message });
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao enviar mensagem no chat ${chatId}:`, error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao enviar mensagem');
        }
    }

    // Obter detalhes de um chat
    async getChatDetails(chatId: number): Promise<UserChat> {
        try {
            const response = await api.get<UserChat>(`/direct-messages/${chatId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar detalhes do chat ${chatId}:`, error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao buscar detalhes do chat');
        }
    }

    // Excluir uma mensagem
    async deleteMessage(chatId: number, messageId: number): Promise<void> {
        try {
            await api.delete(`/direct-messages/${chatId}/messages/${messageId}`);
        } catch (error: any) {
            console.error(`Erro ao excluir mensagem ${messageId} do chat ${chatId}:`, error);
            throw new Error(error.response?.data?.details || error.message || 'Erro ao excluir mensagem');
        }
    }

    // Formatar o nome do chat (usado em casos de chats diretos)
    formatChatName(chat: UserChat, currentUserId: number): string {
        if (chat.name) {
            return chat.name;
        }
        
        // Para chats diretos, mostrar o nome do outro usuário
        const otherUser = chat.users.find(user => user.id !== currentUserId);
        return otherUser ? otherUser.name : 'Chat';
    }

    // Formatar o horário de uma mensagem
    formatMessageTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Se for hoje, mostrar apenas o horário
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Se for ontem, mostrar "Ontem" e o horário
        if (date.toDateString() === yesterday.toDateString()) {
            return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Senão, mostrar a data completa
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export default new DirectChatService();
