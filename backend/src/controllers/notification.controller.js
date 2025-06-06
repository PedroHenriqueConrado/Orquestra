const notificationService = require('../services/notification.service');
const { z } = require('zod');
const logger = require('../utils/logger');

const notificationSchema = z.object({
    content: z.string().min(1).max(1000)
});

const pageSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

class NotificationController {
    async create(req, res) {
        try {
            logger.request(req, 'Notification.create');
            const validatedData = notificationSchema.parse(req.body);
            const notification = await notificationService.createNotification(
                req.user.id,
                validatedData.content
            );
            logger.success('Notification.create: Notificação criada com sucesso', { notificationId: notification.id });
            res.status(201).json(notification);
        } catch (error) {
            logger.error('Notification.create: Erro ao criar notificação', {
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
                details: 'Ocorreu um erro ao criar a notificação'
            });
        }
    }

    async getUserNotifications(req, res) {
        try {
            logger.request(req, 'Notification.getUserNotifications');
            const { page, limit } = pageSchema.parse(req.query);
            const notifications = await notificationService.getUserNotifications(
                req.user.id,
                page || 1,
                limit || 20
            );
            logger.success('Notification.getUserNotifications: Notificações recuperadas com sucesso', {
                userId: req.user.id,
                count: notifications.notifications.length
            });
            res.json(notifications);
        } catch (error) {
            logger.error('Notification.getUserNotifications: Erro ao buscar notificações', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id
            });
            
            if (error instanceof z.ZodError) {
                return res.status(400).json({ 
                    error: 'Parâmetros inválidos',
                    details: error.errors 
                });
            }
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar as notificações'
            });
        }
    }

    async getUnreadCount(req, res) {
        try {
            logger.request(req, 'Notification.getUnreadCount');
            const count = await notificationService.getUnreadCount(req.user.id);
            logger.success('Notification.getUnreadCount: Contagem de notificações não lidas recuperada', {
                userId: req.user.id,
                count
            });
            res.json({ count });
        } catch (error) {
            logger.error('Notification.getUnreadCount: Erro ao buscar contagem de notificações', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar a contagem de notificações não lidas'
            });
        }
    }

    async getNotification(req, res) {
        try {
            logger.request(req, 'Notification.getNotification');
            const { notificationId } = req.params;
            const notification = await notificationService.getNotification(notificationId, req.user.id);
            
            if (!notification) {
                logger.warn('Notification.getNotification: Notificação não encontrada', {
                    notificationId,
                    userId: req.user.id
                });
                return res.status(404).json({ 
                    error: 'Notificação não encontrada',
                    details: 'A notificação solicitada não existe ou não pertence a você'
                });
            }
            
            logger.success('Notification.getNotification: Notificação recuperada com sucesso', {
                notificationId
            });
            res.json(notification);
        } catch (error) {
            logger.error('Notification.getNotification: Erro ao buscar notificação', {
                error: error.message,
                stack: error.stack,
                notificationId: req.params.notificationId,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao buscar a notificação'
            });
        }
    }

    async markAsRead(req, res) {
        try {
            logger.request(req, 'Notification.markAsRead');
            const { notificationId } = req.params;
            const notification = await notificationService.markAsRead(notificationId, req.user.id);
            logger.success('Notification.markAsRead: Notificação marcada como lida', {
                notificationId
            });
            res.json(notification);
        } catch (error) {
            logger.error('Notification.markAsRead: Erro ao marcar notificação como lida', {
                error: error.message,
                stack: error.stack,
                notificationId: req.params.notificationId,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao marcar a notificação como lida'
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            logger.request(req, 'Notification.markAllAsRead');
            const result = await notificationService.markAllAsRead(req.user.id);
            logger.success('Notification.markAllAsRead: Todas as notificações marcadas como lidas', {
                userId: req.user.id,
                count: result.count
            });
            res.json({ 
                message: 'Todas as notificações foram marcadas como lidas',
                count: result.count 
            });
        } catch (error) {
            logger.error('Notification.markAllAsRead: Erro ao marcar todas as notificações como lidas', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao marcar todas as notificações como lidas'
            });
        }
    }

    async delete(req, res) {
        try {
            logger.request(req, 'Notification.delete');
            const { notificationId } = req.params;
            await notificationService.deleteNotification(notificationId, req.user.id);
            logger.success('Notification.delete: Notificação excluída com sucesso', {
                notificationId
            });
            res.status(204).send();
        } catch (error) {
            logger.error('Notification.delete: Erro ao excluir notificação', {
                error: error.message,
                stack: error.stack,
                notificationId: req.params.notificationId,
                userId: req.user.id
            });
            
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao excluir a notificação'
            });
        }
    }
}

module.exports = new NotificationController(); 