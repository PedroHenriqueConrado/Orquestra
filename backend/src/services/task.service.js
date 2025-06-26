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

            // Cria a tarefa sem responsáveis
            const task = await prisma.task.create({
                data: {
                    title: data.title,
                    description: data.description,
                    status: data.status || 'pending',
                    priority: data.priority || 'medium',
                    due_date: data.due_date ? new Date(data.due_date) : null,
                    estimated_hours: data.estimated_hours,
                    project_id: Number(projectId),
                    parent_task_id: data.parent_task_id ? Number(data.parent_task_id) : null
                }
            });

            // Cria os registros em TaskAssignee
            const assigneeIds = (data.assignees || []).map(Number);
            if (!assigneeIds.length) {
                throw new Error('Pelo menos um responsável deve ser informado.');
            }
            await Promise.all(
                assigneeIds.map(userId =>
                    prisma.taskAssignee.create({
                        data: {
                            task_id: task.id,
                            user_id: userId
                        }
                    })
                )
            );

            // Notificar todos os responsáveis
            for (const userId of assigneeIds) {
                try {
                    await notificationService.notifyTaskAssignment(
                        userId,
                        task.id,
                        task.title,
                        '' // Nome do projeto pode ser buscado se necessário
                    );
                } catch (notifyError) {
                    logger.error('TaskService.createTask: Erro ao notificar responsável', {
                        error: notifyError.message,
                        stack: notifyError.stack,
                        taskId: task.id,
                        userId
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
                assignees: { old: null, new: assigneeIds }
            });

            // Retornar a tarefa já com todos os responsáveis
            const taskWithAssignees = await prisma.task.findUnique({
                where: { id: task.id },
                include: {
                    assignees: {
                        include: {
                            user: { select: { id: true, name: true, email: true, role: true } }
                        }
                    },
                    tags: { include: { tag: true } },
                    project: { select: { id: true, name: true } },
                    parentTask: { select: { id: true, title: true } },
                    subTasks: true
                }
            });

            return taskWithAssignees;
        } catch (error) {
            logger.error('TaskService.createTask: Erro ao criar tarefa', error);
            throw error;
        }
    }

    async getAllProjectTasks(projectId, filters = {}) {
        const where = {
            project_id: Number(projectId),
            ...(filters.status && { status: filters.status }),
            ...(filters.priority && { priority: filters.priority }),
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

        // Filtro para mostrar tarefas em que o usuário é responsável ou criador
        if (filters.userId) {
            where.OR = [
                { assignees: { some: { user_id: Number(filters.userId) } } },
                { created_by: Number(filters.userId) }
            ];
        }

        return await prisma.task.findMany({
            where,
            include: {
                assignees: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
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
                assignees: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                subTasks: true,
                parentTask: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
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
    }

    async updateTask(taskId, projectId, userId, data) {
        // Get current task state for history tracking
        const currentTask = await prisma.task.findUnique({
            where: { id: Number(taskId) },
            include: {
                assignees: true,
                project: { select: { id: true, name: true } }
            }
        });

        const changes = {};

        if (data.status && data.status !== currentTask.status) {
            changes.status = { old: currentTask.status, new: data.status };
        }
        if (data.priority && data.priority !== currentTask.priority) {
            changes.priority = { old: currentTask.priority, new: data.priority };
        }
        if (data.estimatedHours && data.estimatedHours !== currentTask.estimated_hours) {
            changes.estimated_hours = { old: currentTask.estimated_hours, new: data.estimatedHours };
        }
        if (data.actualHours && data.actualHours !== currentTask.actual_hours) {
            changes.actual_hours = { old: currentTask.actual_hours, new: data.actualHours };
        }

        // Atualizar dados básicos da tarefa
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
                updated_at: new Date()
            }
        });

        // Sincronizar responsáveis (TaskAssignee)
        if (data.assignees) {
            const newAssignees = data.assignees.map(Number);
            if (!newAssignees.length) {
                throw new Error('Pelo menos um responsável deve ser informado.');
            }
            const currentAssignees = currentTask.assignees.map(a => a.user_id);
            // Remover responsáveis antigos que não estão mais na lista
            await prisma.taskAssignee.deleteMany({
                where: {
                    task_id: task.id,
                    user_id: { notIn: newAssignees }
                }
            });
            // Adicionar novos responsáveis
            for (const userId of newAssignees) {
                if (!currentAssignees.includes(userId)) {
                    await prisma.taskAssignee.create({
                        data: { task_id: task.id, user_id: userId }
                    });
                    // Notificar novo responsável
                    try {
                        await notificationService.notifyTaskAssignment(
                            userId,
                            task.id,
                            task.title,
                            currentTask.project.name
                        );
                    } catch (notifyError) {
                        logger.error('TaskService.updateTask: Erro ao notificar novo responsável', {
                            error: notifyError.message,
                            stack: notifyError.stack,
                            taskId: task.id,
                            userId
                        });
                    }
                }
            }
            changes.assignees = { old: currentAssignees, new: newAssignees };
        }

        // Record changes in history if any changes were made
        if (Object.keys(changes).length > 0) {
            await taskHistoryService.recordChange(taskId, userId, changes);
        }

        // Retornar a tarefa já com todos os responsáveis
        const taskWithAssignees = await prisma.task.findUnique({
            where: { id: task.id },
            include: {
                assignees: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                },
                tags: { include: { tag: true } },
                project: { select: { id: true, name: true } },
                parentTask: { select: { id: true, title: true } },
                subTasks: true
            }
        });

        return taskWithAssignees;
    }

    async deleteTask(taskId, projectId) {
        // Verificar se a tarefa existe e pertence ao projeto
        const task = await prisma.task.findFirst({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            }
        });

        if (!task) {
            throw new Error('Tarefa não encontrada');
        }

        // Excluir a tarefa
        await prisma.task.delete({
            where: {
                id: Number(taskId)
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

    /**
     * Atualiza o status e posição de uma tarefa (para arrastar e soltar)
     */
    async updateTaskStatusPosition(taskId, projectId, userId, newStatus, newPosition) {
        try {
            logger.debug('TaskService.updateTaskStatusPosition: Iniciando atualização', {
                taskId,
                projectId,
                userId,
                newStatus,
                newPosition
            });
            
            // Verificar se a tarefa pertence ao projeto
            const taskExists = await this.isTaskInProject(taskId, projectId);
            if (!taskExists) {
                logger.warn('TaskService.updateTaskStatusPosition: Tarefa não encontrada no projeto', {
                    taskId,
                    projectId
                });
                throw new Error('Tarefa não encontrada no projeto');
            }
            
            // Obter o estado atual da tarefa para registro de histórico
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
            
            // Verificar se o status realmente mudou
            const statusChanged = currentTask.status !== newStatus;
            
            // Preparar alterações para histórico
            const changes = {};
            if (statusChanged) {
                changes.status = { old: currentTask.status, new: newStatus };
            }
            
            // Atualizar a tarefa com o novo status
            const updatedTask = await prisma.task.update({
                where: { id: Number(taskId) },
                data: {
                    status: newStatus,
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
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            
            // Se houver mudança de status, registrar no histórico
            if (statusChanged) {
                await taskHistoryService.recordChange(taskId, userId, changes);
                
                // Se o status foi alterado para 'completed', notificar os interessados
                if (newStatus === 'completed') {
                    try {
                        // Notificar o criador ou gerente do projeto
                        await notificationService.notifyTaskCompleted(
                            updatedTask.project.id,
                            updatedTask.id,
                            updatedTask.title,
                            updatedTask.project.name
                        );
                        logger.debug('TaskService.updateTaskStatusPosition: Notificação de conclusão de tarefa enviada', {
                            taskId: updatedTask.id,
                            projectId: updatedTask.project.id
                        });
                    } catch (notifyError) {
                        logger.error('TaskService.updateTaskStatusPosition: Erro ao enviar notificação de conclusão', {
                            error: notifyError.message,
                            stack: notifyError.stack,
                            taskId: updatedTask.id
                        });
                    }
                }
            }
            
            // Se a posição foi especificada, logar para fins de diagnóstico
            // Em uma implementação completa, você reordenaria as tarefas com base na posição
            if (newPosition !== undefined) {
                logger.info('TaskService.updateTaskStatusPosition: Posição da tarefa atualizada', {
                    taskId,
                    newStatus,
                    newPosition
                });
                
                // Aqui seria implementada a lógica real de reordenação
                // Por exemplo, adicionando um campo 'position' nas tarefas e atualizando todas as tarefas afetadas
            }
            
            logger.success('TaskService.updateTaskStatusPosition: Status/posição atualizados com sucesso', {
                taskId: updatedTask.id,
                newStatus,
                statusChanged,
                newPosition
            });
            
            return updatedTask;
        } catch (error) {
            logger.error('TaskService.updateTaskStatusPosition: Erro ao atualizar status/posição', {
                error: error.message,
                stack: error.stack,
                taskId,
                projectId,
                newStatus,
                newPosition
            });
            throw error;
        }
    }
}

module.exports = new TaskService(); 