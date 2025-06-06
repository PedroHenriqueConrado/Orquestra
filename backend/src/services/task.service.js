const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const taskHistoryService = require('./task-history.service');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

class TaskService {
    async createTask(data, projectId, creatorId) {
        try {
            logger.debug('TaskService.createTask: Iniciando criação', {
                projectId,
                creatorId,
                data
            });
            
            const task = await prisma.task.create({
                data: {
                    title: data.title,
                    description: data.description,
                    status: data.status || 'pending',
                    priority: data.priority || 'medium',
                    due_date: data.due_date ? new Date(data.due_date) : null,
                    estimated_hours: data.estimated_hours,
                    project_id: Number(projectId),
                    assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
                    parent_task_id: data.parent_task_id ? Number(data.parent_task_id) : null
                },
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    subTasks: {
                        include: {
                            assignedUser: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    },
                    parentTask: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    tags: {
                        include: {
                            tag: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            // Notificar o usuário se a tarefa for atribuída a alguém
            if (task.assigned_to) {
                try {
                    await notificationService.notifyTaskAssignment(
                        task.assigned_to,
                        task.id,
                        task.title,
                        task.project.name
                    );
                    logger.debug('TaskService.createTask: Notificação de atribuição de tarefa criada', {
                        taskId: task.id,
                        assignedTo: task.assigned_to
                    });
                } catch (notifyError) {
                    // Apenas logamos o erro, mas não interrompemos o fluxo principal
                    logger.error('TaskService.createTask: Erro ao criar notificação', {
                        error: notifyError.message,
                        stack: notifyError.stack,
                        taskId: task.id,
                        assignedTo: task.assigned_to
                    });
                }
            }

            logger.success('TaskService.createTask: Tarefa criada com sucesso', {
                taskId: task.id,
                projectId: task.project_id
            });

            // Record task creation in history
            await taskHistoryService.recordChange(task.id, creatorId, {
                status: { old: null, new: task.status },
                priority: { old: null, new: task.priority },
                assigned_to: { old: null, new: task.assigned_to }
            });

            return task;
        } catch (error) {
            logger.error('TaskService.createTask: Erro ao criar tarefa', error);
            throw error; // Re-throw para ser tratado pelo controlador
        }
    }

    async getAllProjectTasks(projectId, filters = {}) {
        const where = {
            project_id: Number(projectId),
            ...(filters.status && { status: filters.status }),
            ...(filters.priority && { priority: filters.priority }),
            ...(filters.assignedTo && { assigned_to: Number(filters.assignedTo) }),
            ...(filters.parentTaskId && { parent_task_id: Number(filters.parentTaskId) }),
            ...(filters.search && {
                OR: [
                    { title: { contains: filters.search } },
                    { description: { contains: filters.search } }
                ]
            })
        };

        if (filters.tagIds) {
            where.tags = {
                some: {
                    tag_id: {
                        in: filters.tagIds.map(Number)
                    }
                }
            };
        }

        return await prisma.task.findMany({
            where,
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                _count: {
                    select: {
                        subTasks: true,
                        comments: true
                    }
                }
            },
            orderBy: filters.orderBy || { created_at: 'desc' }
        });
    }

    async getTaskById(taskId, projectId) {
        return await prisma.task.findFirst({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                subTasks: {
                    include: {
                        assignedUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        tags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                },
                parentTask: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                },
                comments: {
                    take: 5,
                    orderBy: {
                        created_at: 'desc'
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
                },
                _count: {
                    select: {
                        comments: true,
                        history: true
                    }
                }
            }
        });
    }

    async updateTask(taskId, projectId, userId, data) {
        // Get current task state for history tracking
        const currentTask = await prisma.task.findUnique({
            where: { id: Number(taskId) },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const changes = {};
        
        // Track changes for history
        if (data.status && data.status !== currentTask.status) {
            changes.status = { old: currentTask.status, new: data.status };
        }
        if (data.priority && data.priority !== currentTask.priority) {
            changes.priority = { old: currentTask.priority, new: data.priority };
        }
        if (data.assignedTo && data.assignedTo !== currentTask.assigned_to) {
            changes.assigned_to = { old: currentTask.assigned_to, new: data.assignedTo };
        }
        if (data.estimatedHours && data.estimatedHours !== currentTask.estimated_hours) {
            changes.estimated_hours = { old: currentTask.estimated_hours, new: data.estimatedHours };
        }
        if (data.actualHours && data.actualHours !== currentTask.actual_hours) {
            changes.actual_hours = { old: currentTask.actual_hours, new: data.actualHours };
        }

        const task = await prisma.task.update({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            },
            data: {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                due_date: data.dueDate ? new Date(data.dueDate) : undefined,
                estimated_hours: data.estimatedHours,
                actual_hours: data.actualHours,
                assigned_to: data.assignedTo ? Number(data.assignedTo) : undefined,
                updated_at: new Date()
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                subTasks: {
                    include: {
                        assignedUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Notificar sobre atribuição de tarefa se ela foi atribuída a alguém
        if (changes.assigned_to && task.assigned_to) {
            try {
                await notificationService.notifyTaskAssignment(
                    task.assigned_to,
                    task.id,
                    task.title,
                    task.project.name
                );
                logger.debug('TaskService.updateTask: Notificação de atribuição de tarefa criada', {
                    taskId: task.id,
                    assignedTo: task.assigned_to
                });
            } catch (notifyError) {
                // Apenas logamos o erro, mas não interrompemos o fluxo principal
                logger.error('TaskService.updateTask: Erro ao criar notificação', {
                    error: notifyError.message,
                    stack: notifyError.stack,
                    taskId: task.id,
                    assignedTo: task.assigned_to
                });
            }
        }

        // Record changes in history if any changes were made
        if (Object.keys(changes).length > 0) {
            await taskHistoryService.recordChange(taskId, userId, changes);
        }

        return task;
    }

    async deleteTask(taskId, projectId) {
        return await prisma.task.delete({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            }
        });
    }

    async getSubTasks(taskId, projectId) {
        return await prisma.task.findMany({
            where: {
                parent_task_id: Number(taskId),
                project_id: Number(projectId)
            },
            include: {
                assignedUser: {
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

    async isTaskInProject(taskId, projectId) {
        const task = await prisma.task.findFirst({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            }
        });
        return !!task;
    }

    async updateTaskTime(taskId, projectId, userId, actualHours) {
        const currentTask = await prisma.task.findUnique({
            where: { id: Number(taskId) }
        });

        const changes = {
            actual_hours: {
                old: currentTask.actual_hours,
                new: actualHours
            }
        };

        const task = await prisma.task.update({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            },
            data: {
                actual_hours: actualHours,
                updated_at: new Date()
            }
        });

        await taskHistoryService.recordChange(taskId, userId, changes);

        return task;
    }

    async getTaskMetrics(projectId) {
        const tasks = await prisma.task.findMany({
            where: {
                project_id: Number(projectId)
            },
            select: {
                estimated_hours: true,
                actual_hours: true,
                status: true,
                priority: true
            }
        });

        return {
            total_tasks: tasks.length,
            total_estimated_hours: tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0),
            total_actual_hours: tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0),
            by_status: tasks.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {}),
            by_priority: tasks.reduce((acc, task) => {
                acc[task.priority] = (acc[task.priority] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

module.exports = new TaskService(); 