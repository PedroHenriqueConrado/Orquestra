const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskHistoryService {
    async recordChange(taskId, userId, changes) {
        const historyEntries = Object.entries(changes).map(([field, { old, new: newValue }]) => ({
            task_id: Number(taskId),
            user_id: Number(userId),
            field_name: field,
            old_value: old?.toString(),
            new_value: newValue?.toString()
        }));

        return await prisma.taskHistory.createMany({
            data: historyEntries
        });
    }

    async getTaskHistory(taskId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        
        const [history, total] = await Promise.all([
            prisma.taskHistory.findMany({
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
            prisma.taskHistory.count({
                where: {
                    task_id: Number(taskId)
                }
            })
        ]);

        return {
            history,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current_page: page,
                per_page: limit
            }
        };
    }

    async getFieldHistory(taskId, fieldName) {
        return await prisma.taskHistory.findMany({
            where: {
                task_id: Number(taskId),
                field_name: fieldName
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
            }
        });
    }

    async getUserTaskChanges(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        
        const [changes, total] = await Promise.all([
            prisma.taskHistory.findMany({
                where: {
                    user_id: Number(userId)
                },
                include: {
                    task: {
                        select: {
                            id: true,
                            title: true,
                            project_id: true,
                            project: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.taskHistory.count({
                where: {
                    user_id: Number(userId)
                }
            })
        ]);

        return {
            changes,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current_page: page,
                per_page: limit
            }
        };
    }
}

module.exports = new TaskHistoryService(); 