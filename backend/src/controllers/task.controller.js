const taskService = require('../services/task.service');
const { z } = require('zod');
const logger = require('../utils/logger');

const taskSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional().default(''),
    status: z.enum(['pending', 'in_progress', 'completed']).optional().default('pending'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    // Aceita string no formato YYYY-MM-DD e converte para formato ISO ou trata string vazia
    dueDate: z.string()
        .transform(val => {
            // Se for string vazia, retorna undefined para que seja tratado como opcional
            if (val === '') return undefined;
            
            // Se for apenas uma data (YYYY-MM-DD), adiciona o horário
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                return `${val}T00:00:00.000Z`;
            }
            return val;
        })
        .pipe(z.string().datetime().optional())
        .optional(),
    // Aceita número ou string numérica e converte para número, ou string vazia para null
    estimatedHours: z.union([
        z.number().min(0),
        z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)),
        z.literal('').transform(() => undefined)
    ]).optional(),
    actualHours: z.union([
        z.number().min(0),
        z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)),
        z.literal('').transform(() => undefined)
    ]).optional(),
    // Aceita número ou string numérica e converte para número, ou string vazia para null
    assignedTo: z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
        z.literal('').transform(() => undefined)
    ]).optional(),
    // Aceita número ou string numérica e converte para número, ou string vazia para null
    parentTaskId: z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
        z.literal('').transform(() => undefined)
    ]).optional(),
    tags: z.array(z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    ])).optional().default([])
});

const updateTaskSchema = taskSchema.partial();

const filterSchema = z.object({
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignedTo: z.string().regex(/^\d+$/).transform(Number).optional(),
    parentTaskId: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    tagIds: z.array(z.string().regex(/^\d+$/).transform(Number)).optional(),
    orderBy: z.object({
        field: z.enum(['created_at', 'due_date', 'priority', 'status']),
        direction: z.enum(['asc', 'desc'])
    }).optional()
});

const timeTrackingSchema = z.object({
    actualHours: z.number().min(0)
});

// Schema para atualização de status e posição via drag and drop
const statusPositionSchema = z.object({
    status: z.enum(['pending', 'in_progress', 'completed']),
    position: z.number().int().min(0).optional()
});

class TaskController {
    constructor() {
        this.taskService = taskService;
    }

    async create(req, res) {
        try {
            logger.request(req, 'TaskController.create');
            logger.debug('TaskController.create: Dados recebidos', {
                body: req.body,
                projectId: req.params.projectId
            });
            
            try {
                const validatedData = taskSchema.parse(req.body);
                logger.debug('TaskController.create: Dados validados com sucesso', validatedData);
                
                // Converte camelCase para snake_case nos campos específicos para compatibilidade com o Prisma
                const normalizedData = {
                    ...validatedData,
                    due_date: validatedData.dueDate,
                    estimated_hours: validatedData.estimatedHours,
                    actual_hours: validatedData.actualHours,
                    assigned_to: validatedData.assignedTo,
                    parent_task_id: validatedData.parentTaskId
                };
                
                // Remove campos camelCase que foram convertidos
                if ('dueDate' in validatedData) delete normalizedData.dueDate;
                if ('estimatedHours' in validatedData) delete normalizedData.estimatedHours;
                if ('actualHours' in validatedData) delete normalizedData.actualHours;
                if ('assignedTo' in validatedData) delete normalizedData.assignedTo;
                if ('parentTaskId' in validatedData) delete normalizedData.parentTaskId;
                
                logger.debug('TaskController.create: Dados normalizados', normalizedData);
                
                const task = await this.taskService.createTask(normalizedData, req.params.projectId, req.user.id);
                logger.success('TaskController.create: Tarefa criada com sucesso', { taskId: task.id });
                
                res.status(201).json(task);
            } catch (zodError) {
                logger.warn('TaskController.create: Erro de validação Zod', zodError.errors);
                return res.status(400).json({ 
                    message: 'Dados inválidos para criação da tarefa',
                    errors: zodError.errors 
                });
            }
        } catch (error) {
            logger.error('TaskController.create: Erro ao criar tarefa', error);
            
            res.status(500).json({ 
                message: 'Erro ao criar tarefa', 
                error: error.message 
            });
        }
    }

    async getAllProjectTasks(req, res) {
        try {
            const filters = filterSchema.parse(req.query);
            const tasks = await this.taskService.getAllProjectTasks(req.params.projectId, filters);
            res.json(tasks);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getById(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const task = await this.taskService.getTaskById(taskId, projectId);
            
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const validatedData = updateTaskSchema.parse(req.body);
            const { projectId, taskId } = req.params;
            const task = await this.taskService.updateTask(taskId, projectId, req.user.id, validatedData);
            res.json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            const { projectId, taskId } = req.params;
            await this.taskService.deleteTask(taskId, projectId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateTime(req, res) {
        try {
            const validatedData = timeTrackingSchema.parse(req.body);
            const { projectId, taskId } = req.params;
            const task = await this.taskService.updateTaskTime(
                taskId,
                projectId,
                req.user.id,
                validatedData.actualHours
            );
            res.json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getMetrics(req, res) {
        try {
            const metrics = await this.taskService.getTaskMetrics(req.params.projectId);
            res.json(metrics);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getSubTasks(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const subTasks = await this.taskService.getSubTasks(taskId, projectId);
            res.json(subTasks);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteTask(req, res) {
        try {
            const { projectId, taskId } = req.params;
            await this.taskService.deleteTask(taskId, projectId);
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            res.status(error.message === 'Tarefa não encontrada' ? 404 : 500).json({
                error: error.message || 'Erro ao excluir tarefa'
            });
        }
    }

    async updateTaskStatusPosition(req, res) {
        try {
            logger.request(req, 'TaskController.updateTaskStatusPosition');
            logger.debug('TaskController.updateTaskStatusPosition: Dados recebidos', {
                body: req.body,
                projectId: req.params.projectId,
                taskId: req.params.taskId
            });
            
            try {
                const validatedData = statusPositionSchema.parse(req.body);
                logger.debug('TaskController.updateTaskStatusPosition: Dados validados com sucesso', validatedData);
                
                const { projectId, taskId } = req.params;
                
                // Chama o serviço para atualizar o status e posição da tarefa
                const task = await this.taskService.updateTaskStatusPosition(
                    taskId,
                    projectId,
                    req.user.id,
                    validatedData.status,
                    validatedData.position
                );
                
                logger.success('TaskController.updateTaskStatusPosition: Status atualizado com sucesso', {
                    taskId,
                    status: validatedData.status,
                    position: validatedData.position
                });
                
                res.json(task);
            } catch (zodError) {
                logger.warn('TaskController.updateTaskStatusPosition: Erro de validação Zod', zodError.errors);
                return res.status(400).json({ 
                    message: 'Dados inválidos para atualização de status/posição da tarefa',
                    errors: zodError.errors 
                });
            }
        } catch (error) {
            logger.error('TaskController.updateTaskStatusPosition: Erro ao atualizar status/posição', error);
            
            res.status(500).json({ 
                message: 'Erro ao atualizar status/posição da tarefa', 
                error: error.message 
            });
        }
    }
}

module.exports = TaskController; 