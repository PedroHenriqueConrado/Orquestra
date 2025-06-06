const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

class DirectChatService {
    // Iniciar ou obter um chat entre dois usuários
    async getOrCreateChat(user1Id, user2Id) {
        try {
            logger.debug('DirectChatService.getOrCreateChat: Buscando ou criando chat entre usuários', {
                user1Id,
                user2Id
            });

            // Verifica se já existe um chat entre esses usuários
            // Primeiro, procura chats que não são grupos
            const existingChats = await prisma.userChat.findMany({
                where: {
                    is_group: false,
                    users: {
                        some: {
                            id: Number(user1Id)
                        }
                    }
                },
                include: {
                    users: true
                }
            });

            // Filtra para encontrar um chat que tenha exatamente esses dois usuários
            const chatBetweenUsers = existingChats.find(chat => 
                chat.users.length === 2 && 
                chat.users.some(user => user.id === Number(user2Id))
            );

            if (chatBetweenUsers) {
                logger.debug('DirectChatService.getOrCreateChat: Chat existente encontrado', {
                    chatId: chatBetweenUsers.id
                });
                return chatBetweenUsers;
            }

            // Se não existe, cria um novo chat
            logger.debug('DirectChatService.getOrCreateChat: Criando novo chat');
            const newChat = await prisma.userChat.create({
                data: {
                    is_group: false,
                    users: {
                        connect: [
                            { id: Number(user1Id) },
                            { id: Number(user2Id) }
                        ]
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.success('DirectChatService.getOrCreateChat: Novo chat criado com sucesso', {
                chatId: newChat.id
            });
            return newChat;
        } catch (error) {
            logger.error('DirectChatService.getOrCreateChat: Erro ao buscar ou criar chat', {
                error: error.message,
                stack: error.stack,
                user1Id,
                user2Id
            });
            throw error;
        }
    }

    // Obter chats de um usuário
    async getUserChats(userId) {
        try {
            logger.debug('DirectChatService.getUserChats: Buscando chats do usuário', { userId });

            const chats = await prisma.userChat.findMany({
                where: {
                    users: {
                        some: {
                            id: Number(userId)
                        }
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    messages: {
                        orderBy: {
                            created_at: 'desc'
                        },
                        take: 1,
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    updated_at: 'desc'
                }
            });

            // Contar mensagens não lidas para cada chat
            const chatsWithUnreadCount = await Promise.all(
                chats.map(async (chat) => {
                    const unreadCount = await prisma.directMessage.count({
                        where: {
                            chat_id: chat.id,
                            receiver_id: Number(userId),
                            is_read: false
                        }
                    });

                    return {
                        ...chat,
                        unreadCount
                    };
                })
            );

            logger.success('DirectChatService.getUserChats: Chats encontrados', {
                userId,
                count: chatsWithUnreadCount.length
            });

            return chatsWithUnreadCount;
        } catch (error) {
            logger.error('DirectChatService.getUserChats: Erro ao buscar chats do usuário', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    // Enviar mensagem
    async sendMessage(chatId, senderId, receiverId, message) {
        try {
            logger.debug('DirectChatService.sendMessage: Enviando mensagem', {
                chatId,
                senderId,
                receiverId,
                messageLength: message.length
            });

            const directMessage = await prisma.directMessage.create({
                data: {
                    chat_id: Number(chatId),
                    sender_id: Number(senderId),
                    receiver_id: Number(receiverId),
                    message
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Atualiza a data de atualização do chat
            await prisma.userChat.update({
                where: {
                    id: Number(chatId)
                },
                data: {
                    updated_at: new Date()
                }
            });

            // Criar notificação para o destinatário
            try {
                await notificationService.notifyNewDirectMessage(
                    receiverId, 
                    senderId, 
                    directMessage.sender.name
                );
                logger.debug('DirectChatService.sendMessage: Notificação de nova mensagem criada', {
                    receiverId
                });
            } catch (notifyError) {
                // Apenas logamos o erro, mas não interrompemos o fluxo principal
                logger.error('DirectChatService.sendMessage: Erro ao criar notificação', {
                    error: notifyError.message,
                    stack: notifyError.stack,
                    receiverId,
                    senderId
                });
            }

            logger.success('DirectChatService.sendMessage: Mensagem enviada com sucesso', {
                messageId: directMessage.id
            });

            return directMessage;
        } catch (error) {
            logger.error('DirectChatService.sendMessage: Erro ao enviar mensagem', {
                error: error.message,
                stack: error.stack,
                chatId,
                senderId,
                receiverId
            });
            throw error;
        }
    }

    // Obter mensagens de um chat
    async getChatMessages(chatId, userId, page = 1, limit = 20) {
        try {
            logger.debug('DirectChatService.getChatMessages: Buscando mensagens do chat', {
                chatId,
                page,
                limit
            });

            const skip = (page - 1) * limit;

            // Verificar se o usuário é membro do chat
            const userInChat = await prisma.userChat.findFirst({
                where: {
                    id: Number(chatId),
                    users: {
                        some: {
                            id: Number(userId)
                        }
                    }
                }
            });

            if (!userInChat) {
                logger.warn('DirectChatService.getChatMessages: Usuário não é membro do chat', {
                    userId,
                    chatId
                });
                throw new Error('Você não tem permissão para acessar este chat');
            }

            // Buscar as mensagens
            const [messages, total] = await Promise.all([
                prisma.directMessage.findMany({
                    where: {
                        chat_id: Number(chatId)
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    },
                    skip,
                    take: limit
                }),
                prisma.directMessage.count({
                    where: {
                        chat_id: Number(chatId)
                    }
                })
            ]);

            // Marcar mensagens como lidas
            await prisma.directMessage.updateMany({
                where: {
                    chat_id: Number(chatId),
                    receiver_id: Number(userId),
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });

            logger.success('DirectChatService.getChatMessages: Mensagens encontradas', {
                chatId,
                count: messages.length,
                total
            });

            return {
                messages,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page,
                    perPage: limit
                }
            };
        } catch (error) {
            logger.error('DirectChatService.getChatMessages: Erro ao buscar mensagens', {
                error: error.message,
                stack: error.stack,
                chatId,
                userId
            });
            throw error;
        }
    }

    // Obter detalhes de um chat
    async getChatDetails(chatId, userId) {
        try {
            logger.debug('DirectChatService.getChatDetails: Buscando detalhes do chat', {
                chatId,
                userId
            });

            const chat = await prisma.userChat.findFirst({
                where: {
                    id: Number(chatId),
                    users: {
                        some: {
                            id: Number(userId)
                        }
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!chat) {
                logger.warn('DirectChatService.getChatDetails: Chat não encontrado ou usuário não é membro', {
                    chatId,
                    userId
                });
                throw new Error('Chat não encontrado ou você não tem permissão para acessá-lo');
            }

            // Contar mensagens não lidas
            const unreadCount = await prisma.directMessage.count({
                where: {
                    chat_id: Number(chatId),
                    receiver_id: Number(userId),
                    is_read: false
                }
            });

            logger.success('DirectChatService.getChatDetails: Detalhes do chat encontrados', {
                chatId
            });

            return {
                ...chat,
                unreadCount
            };
        } catch (error) {
            logger.error('DirectChatService.getChatDetails: Erro ao buscar detalhes do chat', {
                error: error.message,
                stack: error.stack,
                chatId,
                userId
            });
            throw error;
        }
    }

    // Verificar se usuário pode excluir uma mensagem
    async canDeleteMessage(messageId, userId) {
        try {
            logger.debug('DirectChatService.canDeleteMessage: Verificando permissão de exclusão', {
                messageId,
                userId
            });

            const message = await prisma.directMessage.findUnique({
                where: {
                    id: Number(messageId)
                }
            });

            if (!message) {
                logger.warn('DirectChatService.canDeleteMessage: Mensagem não encontrada', { messageId });
                return false;
            }

            // Apenas o remetente pode excluir sua própria mensagem
            const canDelete = Number(message.sender_id) === Number(userId);

            logger.debug('DirectChatService.canDeleteMessage: Resultado da verificação', {
                messageId,
                userId,
                canDelete
            });

            return canDelete;
        } catch (error) {
            logger.error('DirectChatService.canDeleteMessage: Erro ao verificar permissão', {
                error: error.message,
                stack: error.stack,
                messageId,
                userId
            });
            throw error;
        }
    }

    // Excluir uma mensagem
    async deleteMessage(messageId) {
        try {
            logger.debug('DirectChatService.deleteMessage: Excluindo mensagem', { messageId });

            await prisma.directMessage.delete({
                where: {
                    id: Number(messageId)
                }
            });

            logger.success('DirectChatService.deleteMessage: Mensagem excluída com sucesso', { messageId });
        } catch (error) {
            logger.error('DirectChatService.deleteMessage: Erro ao excluir mensagem', {
                error: error.message,
                stack: error.stack,
                messageId
            });
            throw error;
        }
    }
}

module.exports = new DirectChatService();
