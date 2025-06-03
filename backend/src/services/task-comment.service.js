const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskCommentService {
    async createComment(taskId, userId, content) {
        return await prisma.taskComment.create({
            data: {
                task_id: Number(taskId),
                user_id: Number(userId),
                content
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

    async getTaskComments(taskId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const [comments, total] = await Promise.all([
            prisma.taskComment.findMany({
                where: {
                    task_id: Number(taskId)
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
            prisma.taskComment.count({
                where: {
                    task_id: Number(taskId)
                }
            })
        ]);

        return {
            comments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current_page: page,
                per_page: limit
            }
        };
    }

    async updateComment(commentId, userId, content) {
        return await prisma.taskComment.update({
            where: {
                id: Number(commentId),
                user_id: Number(userId) // Ensure only the comment creator can update it
            },
            data: {
                content,
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

    async deleteComment(commentId, userId) {
        return await prisma.taskComment.delete({
            where: {
                id: Number(commentId),
                user_id: Number(userId) // Ensure only the comment creator can delete it
            }
        });
    }

    async getCommentById(commentId) {
        return await prisma.taskComment.findUnique({
            where: {
                id: Number(commentId)
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
}

module.exports = new TaskCommentService(); 