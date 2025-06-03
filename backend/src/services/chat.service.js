const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ChatService {
    async createMessage(projectId, userId, message) {
        return await prisma.chatMessage.create({
            data: {
                project_id: Number(projectId),
                user_id: Number(userId),
                message
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async getProjectMessages(projectId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        
        const [messages, total] = await Promise.all([
            prisma.chatMessage.findMany({
                where: {
                    project_id: Number(projectId)
                },
                include: {
                    user: {
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
            prisma.chatMessage.count({
                where: {
                    project_id: Number(projectId)
                }
            })
        ]);

        return {
            messages,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                perPage: limit
            }
        };
    }

    async getMessage(messageId, projectId) {
        return await prisma.chatMessage.findFirst({
            where: {
                id: Number(messageId),
                project_id: Number(projectId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async updateMessage(messageId, projectId, userId, message) {
        return await prisma.chatMessage.update({
            where: {
                id: Number(messageId),
                AND: [
                    { project_id: Number(projectId) },
                    { user_id: Number(userId) }
                ]
            },
            data: {
                message,
                updated_at: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async deleteMessage(messageId, projectId, userId) {
        return await prisma.chatMessage.delete({
            where: {
                id: Number(messageId),
                AND: [
                    { project_id: Number(projectId) },
                    { user_id: Number(userId) }
                ]
            }
        });
    }

    async isMessageOwner(messageId, userId) {
        const message = await prisma.chatMessage.findFirst({
            where: {
                id: Number(messageId),
                user_id: Number(userId)
            }
        });
        return !!message;
    }
}

module.exports = new ChatService(); 