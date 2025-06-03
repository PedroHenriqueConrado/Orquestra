const notificationService = require('../services/notification.service');
const { z } = require('zod');

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
            const validatedData = notificationSchema.parse(req.body);
            const notification = await notificationService.createNotification(
                req.user.id,
                validatedData.content
            );
            res.status(201).json(notification);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getUserNotifications(req, res) {
        try {
            const { page, limit } = pageSchema.parse(req.query);
            const notifications = await notificationService.getUserNotifications(
                req.user.id,
                page || 1,
                limit || 20
            );
            res.json(notifications);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notificationService.getNotification(notificationId, req.user.id);
            
            if (!notification) {
                return res.status(404).json({ error: 'Notificação não encontrada' });
            }
            
            res.json(notification);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notificationService.markAsRead(notificationId, req.user.id);
            res.json(notification);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async delete(req, res) {
        try {
            const { notificationId } = req.params;
            await notificationService.deleteNotification(notificationId, req.user.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = new NotificationController(); 