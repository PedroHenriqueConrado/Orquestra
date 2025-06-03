const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationService {
    async createNotification(userId, content) {
        return await prisma.notification.create({
            data: {
                user_id: Number(userId),
                content,
                is_read: false
            }
        });
    }

    async getUserNotifications(userId, page = 1, limit = 20) {
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

        return {
            notifications,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                perPage: limit
            }
        };
    }

    async getNotification(notificationId, userId) {
        return await prisma.notification.findFirst({
            where: {
                id: Number(notificationId),
                user_id: Number(userId)
            }
        });
    }

    async markAsRead(notificationId, userId) {
        return await prisma.notification.update({
            where: {
                id: Number(notificationId),
                user_id: Number(userId)
            },
            data: {
                is_read: true
            }
        });
    }

    async deleteNotification(notificationId, userId) {
        return await prisma.notification.delete({
            where: {
                id: Number(notificationId),
                user_id: Number(userId)
            }
        });
    }

    async isNotificationOwner(notificationId, userId) {
        const notification = await prisma.notification.findFirst({
            where: {
                id: Number(notificationId),
                user_id: Number(userId)
            }
        });
        return !!notification;
    }
}

module.exports = new NotificationService(); 