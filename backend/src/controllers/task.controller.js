const taskService = require('../services/task.service');
const { z } = require('zod');

const taskSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0).optional(),
    actualHours: z.number().min(0).optional(),
    assignedTo: z.number().int().positive().optional(),
    parentTaskId: z.number().int().positive().optional(),
    tags: z.array(z.number()).optional()
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

class TaskController {
    constructor() {
        this.taskService = taskService;
    }

    async create(req, res) {
        try {
            const validatedData = taskSchema.parse(req.body);
            const task = await this.taskService.createTask(validatedData, req.params.projectId, req.user.id);
            res.status(201).json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
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
}

module.exports = TaskController; 