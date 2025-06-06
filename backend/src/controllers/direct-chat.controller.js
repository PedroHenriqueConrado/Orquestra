const directChatService = require('../services/direct-chat.service');
const userService = require('../services/user.service');
const { z } = require('zod');
const logger = require('../utils/logger');

const messageSchema = z.object({
    message: z.string().min(1).max(1000)
});

const startChatSchema = z.object({
    receiverId: z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    ])
});

const pageSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

class DirectChatController {
    // Iniciar um chat com outro usuário
    async startChat(req, res) {
        try {
            logger.request(req, 'DirectChat.startChat');
            const { receiverId } = startChatSchema.parse(req.body);
            const senderId = req.user.id;
            
            // Verificar se o receptor existe
            const receiver = await userService.getUserById(receiverId);
            if (!receiver) {
                logger.warn('DirectChat.startChat: Usuário receptor não encontrado', { receiverId });
                return res.status(404).json({ 
                    error: 'Usuário não encontrado',
                    details: 'O usuário com quem você está tentando iniciar o chat não existe'
                });
            }
            
            // Não permitir chat consigo mesmo
            if (Number(receiverId) === Number(senderId)) {
                logger.warn('DirectChat.startChat: Tentativa de chat consigo mesmo', { userId: senderId });
                return res.status(400).json({ 
                    error: 'Operação inválida',
                    details: 'Você não pode iniciar um chat consigo mesmo'
                });
            }
            
            const chat = await directChatService.getOrCreateChat(senderId, receiverId);
            logger.success('DirectChat.startChat: Chat iniciado/recuperado com sucesso', { chatId: chat.id });
            
            res.status(200).json(chat);
        } catch (error) {
            logger.error('DirectChat.startChat: Erro ao iniciar chat', {
                error: error.message,
                stack: error.stack,
                body: req.body
            });
            
            if (error instanceof z.ZodError) {
                return res.status(400).json({ 
                    error: 'Dados inválidos',
                    details: error.errors 
                });
            }
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao iniciar o chat. Tente novamente mais tarde.'
            });
        }
    }

    // Listar chats do usuário
    async getUserChats(req, res) {
        try {
            logger.request(req, 'DirectChat.getUserChats');
            const userId = req.user.id;
            
            const chats = await directChatService.getUserChats(userId);
            logger.success('DirectChat.getUserChats: Chats recuperados com sucesso', { 
                userId, 
                count: chats.length 
            });
            
            res.status(200).json(chats);
        } catch (error) {
            logger.error('DirectChat.getUserChats: Erro ao buscar chats', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar seus chats. Tente novamente mais tarde.'
            });
        }
    }

    // Enviar mensagem em um chat
    async sendMessage(req, res) {
        try {
            logger.request(req, 'DirectChat.sendMessage');
            const { chatId } = req.params;
            const senderId = req.user.id;
            const { message } = messageSchema.parse(req.body);
            
            // Obter detalhes do chat para verificar se o usuário é membro
            const chat = await directChatService.getChatDetails(chatId, senderId);
            
            // Encontrar o ID do destinatário (o outro usuário no chat)
            const receiverUser = chat.users.find(user => user.id !== Number(senderId));
            
            if (!receiverUser) {
                logger.warn('DirectChat.sendMessage: Destinatário não encontrado no chat', { chatId });
                return res.status(400).json({ 
                    error: 'Erro ao enviar mensagem',
                    details: 'Não foi possível determinar o destinatário da mensagem'
                });
            }
            
            const directMessage = await directChatService.sendMessage(
                chatId,
                senderId,
                receiverUser.id,
                message
            );
            
            logger.success('DirectChat.sendMessage: Mensagem enviada com sucesso', { 
                chatId, 
                messageId: directMessage.id 
            });
            
            res.status(201).json(directMessage);
        } catch (error) {
            logger.error('DirectChat.sendMessage: Erro ao enviar mensagem', {
                error: error.message,
                stack: error.stack,
                chatId: req.params.chatId,
                body: req.body
            });
            
            if (error instanceof z.ZodError) {
                return res.status(400).json({ 
                    error: 'Dados inválidos',
                    details: error.errors 
                });
            }
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.'
            });
        }
    }

    // Obter mensagens de um chat
    async getChatMessages(req, res) {
        try {
            logger.request(req, 'DirectChat.getChatMessages');
            const { chatId } = req.params;
            const userId = req.user.id;
            const { page, limit } = pageSchema.parse(req.query);
            
            const result = await directChatService.getChatMessages(
                chatId,
                userId,
                page || 1,
                limit || 20
            );
            
            logger.success('DirectChat.getChatMessages: Mensagens recuperadas com sucesso', { 
                chatId, 
                count: result.messages.length,
                total: result.pagination.total
            });
            
            res.status(200).json(result);
        } catch (error) {
            logger.error('DirectChat.getChatMessages: Erro ao buscar mensagens', {
                error: error.message,
                stack: error.stack,
                chatId: req.params.chatId
            });
            
            if (error instanceof z.ZodError) {
                return res.status(400).json({ 
                    error: 'Parâmetros inválidos',
                    details: error.errors 
                });
            }
            
            if (error.message === 'Você não tem permissão para acessar este chat') {
                return res.status(403).json({ 
                    error: 'Acesso negado',
                    details: error.message
                });
            }
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar as mensagens. Tente novamente mais tarde.'
            });
        }
    }

    // Obter detalhes de um chat
    async getChatDetails(req, res) {
        try {
            logger.request(req, 'DirectChat.getChatDetails');
            const { chatId } = req.params;
            const userId = req.user.id;
            
            const chat = await directChatService.getChatDetails(chatId, userId);
            
            logger.success('DirectChat.getChatDetails: Detalhes do chat recuperados com sucesso', { 
                chatId 
            });
            
            res.status(200).json(chat);
        } catch (error) {
            logger.error('DirectChat.getChatDetails: Erro ao buscar detalhes do chat', {
                error: error.message,
                stack: error.stack,
                chatId: req.params.chatId
            });
            
            if (error.message === 'Chat não encontrado ou você não tem permissão para acessá-lo') {
                return res.status(404).json({ 
                    error: 'Chat não encontrado',
                    details: error.message
                });
            }
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar os detalhes do chat. Tente novamente mais tarde.'
            });
        }
    }

    // Excluir uma mensagem
    async deleteMessage(req, res) {
        try {
            logger.request(req, 'DirectChat.deleteMessage');
            const { chatId, messageId } = req.params;
            const userId = req.user.id;
            
            // Verificar se a mensagem existe e pertence ao usuário
            const canDelete = await directChatService.canDeleteMessage(messageId, userId);
            
            if (!canDelete) {
                logger.warn('DirectChat.deleteMessage: Tentativa de exclusão de mensagem não autorizada', { 
                    chatId, 
                    messageId, 
                    userId 
                });
                
                return res.status(403).json({ 
                    error: 'Acesso negado',
                    details: 'Você não tem permissão para excluir esta mensagem'
                });
            }
            
            await directChatService.deleteMessage(messageId);
            
            logger.success('DirectChat.deleteMessage: Mensagem excluída com sucesso', { 
                chatId, 
                messageId 
            });
            
            res.status(204).send();
        } catch (error) {
            logger.error('DirectChat.deleteMessage: Erro ao excluir mensagem', {
                error: error.message,
                stack: error.stack,
                chatId: req.params.chatId,
                messageId: req.params.messageId
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao excluir a mensagem. Tente novamente mais tarde.'
            });
        }
    }
}

module.exports = new DirectChatController();
