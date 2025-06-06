const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class NotificationService {
    async createNotification(userId, content) {
        try {
            logger.debug('NotificationService.createNotification: Criando notificação', {
                userId,
                contentLength: content.length
            });
            
            const notification = await prisma.notification.create({
                data: {
                    user_id: Number(userId),
                    content,
                    is_read: false
                }
            });
            
            logger.success('NotificationService.createNotification: Notificação criada com sucesso', {
                notificationId: notification.id
            });
            
            return notification;
        } catch (error) {
            logger.error('NotificationService.createNotification: Erro ao criar notificação', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            logger.debug('NotificationService.getUserNotifications: Buscando notificações do usuário', {
                userId,
                page,
                limit
            });
            
            const skip = (page - 1) * limit;
            
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where: {
                        user_id: Number(userId)
                    },
                    orderBy: {
                        created_at: 'desc'
                    },
                    skip,
                    take: limit
                }),
                prisma.notification.count({
                    where: {
                        user_id: Number(userId)
                    }
                })
            ]);

            logger.success('NotificationService.getUserNotifications: Notificações encontradas', {
                userId,
                count: notifications.length,
                total
            });
            
            return {
                notifications,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page,
                    perPage: limit
                }
            };
        } catch (error) {
            logger.error('NotificationService.getUserNotifications: Erro ao buscar notificações', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    async getNotification(notificationId, userId) {
        try {
            logger.debug('NotificationService.getNotification: Buscando notificação', {
                notificationId,
                userId
            });
            
            const notification = await prisma.notification.findFirst({
                where: {
                    id: Number(notificationId),
                    user_id: Number(userId)
                }
            });
            
            logger.debug('NotificationService.getNotification: Resultado da busca', {
                notificationId,
                found: !!notification
            });
            
            return notification;
        } catch (error) {
            logger.error('NotificationService.getNotification: Erro ao buscar notificação', {
                error: error.message,
                stack: error.stack,
                notificationId,
                userId
            });
            throw error;
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            logger.debug('NotificationService.markAsRead: Marcando notificação como lida', {
                notificationId,
                userId
            });
            
            const notification = await prisma.notification.update({
                where: {
                    id: Number(notificationId),
                    user_id: Number(userId)
                },
                data: {
                    is_read: true
                }
            });
            
            logger.success('NotificationService.markAsRead: Notificação marcada como lida', {
                notificationId
            });
            
            return notification;
        } catch (error) {
            logger.error('NotificationService.markAsRead: Erro ao marcar notificação como lida', {
                error: error.message,
                stack: error.stack,
                notificationId,
                userId
            });
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            logger.debug('NotificationService.markAllAsRead: Marcando todas as notificações como lidas', {
                userId
            });
            
            const result = await prisma.notification.updateMany({
                where: {
                    user_id: Number(userId),
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });
            
            logger.success('NotificationService.markAllAsRead: Notificações marcadas como lidas', {
                userId,
                count: result.count
            });
            
            return result;
        } catch (error) {
            logger.error('NotificationService.markAllAsRead: Erro ao marcar notificações como lidas', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            logger.debug('NotificationService.deleteNotification: Excluindo notificação', {
                notificationId,
                userId
            });
            
            const notification = await prisma.notification.delete({
                where: {
                    id: Number(notificationId),
                    user_id: Number(userId)
                }
            });
            
            logger.success('NotificationService.deleteNotification: Notificação excluída', {
                notificationId
            });
            
            return notification;
        } catch (error) {
            logger.error('NotificationService.deleteNotification: Erro ao excluir notificação', {
                error: error.message,
                stack: error.stack,
                notificationId,
                userId
            });
            throw error;
        }
    }

    async isNotificationOwner(notificationId, userId) {
        try {
            logger.debug('NotificationService.isNotificationOwner: Verificando proprietário da notificação', {
                notificationId,
                userId
            });
            
            const notification = await prisma.notification.findFirst({
                where: {
                    id: Number(notificationId),
                    user_id: Number(userId)
                }
            });
            
            const isOwner = !!notification;
            
            logger.debug('NotificationService.isNotificationOwner: Resultado da verificação', {
                notificationId,
                userId,
                isOwner
            });
            
            return isOwner;
        } catch (error) {
            logger.error('NotificationService.isNotificationOwner: Erro ao verificar proprietário', {
                error: error.message,
                stack: error.stack,
                notificationId,
                userId
            });
            throw error;
        }
    }

    async getUnreadCount(userId) {
        try {
            logger.debug('NotificationService.getUnreadCount: Contando notificações não lidas', {
                userId
            });
            
            const count = await prisma.notification.count({
                where: {
                    user_id: Number(userId),
                    is_read: false
                }
            });
            
            logger.debug('NotificationService.getUnreadCount: Contagem concluída', {
                userId,
                count
            });
            
            return count;
        } catch (error) {
            logger.error('NotificationService.getUnreadCount: Erro ao contar notificações', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    // Notificações específicas

    // Notificar sobre nova mensagem direta
    async notifyNewDirectMessage(receiverId, senderId, senderName) {
        try {
            const content = `${senderName} enviou uma nova mensagem para você.`;
            return await this.createNotification(receiverId, content);
        } catch (error) {
            logger.error('NotificationService.notifyNewDirectMessage: Erro ao notificar nova mensagem', {
                error: error.message,
                stack: error.stack,
                receiverId,
                senderId
            });
            throw error;
        }
    }

    // Notificar sobre adição a um projeto
    async notifyProjectAddition(userId, projectId, projectName, addedBy) {
        try {
            const content = `Você foi adicionado ao projeto "${projectName}".`;
            return await this.createNotification(userId, content);
        } catch (error) {
            logger.error('NotificationService.notifyProjectAddition: Erro ao notificar adição a projeto', {
                error: error.message,
                stack: error.stack,
                userId,
                projectId,
                addedBy
            });
            throw error;
        }
    }

    // Notificar sobre atribuição de tarefa
    async notifyTaskAssignment(userId, taskId, taskTitle, projectName) {
        try {
            const content = `Uma nova tarefa foi atribuída a você: "${taskTitle}" no projeto "${projectName}".`;
            return await this.createNotification(userId, content);
        } catch (error) {
            logger.error('NotificationService.notifyTaskAssignment: Erro ao notificar atribuição de tarefa', {
                error: error.message,
                stack: error.stack,
                userId,
                taskId
            });
            throw error;
        }
    }
}

module.exports = new NotificationService(); 