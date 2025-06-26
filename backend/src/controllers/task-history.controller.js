const taskHistoryService = require('../services/task-history.service');
const { z } = require('zod');

const pageSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

class TaskHistoryController {
    constructor() {
        this.taskHistoryService = taskHistoryService;
    }

    async getTaskHistory(req, res) {
        try {
            const { page, limit } = pageSchema.parse(req.query);
            const history = await this.taskHistoryService.getTaskHistory(
                req.params.taskId,
                page || 1,
                limit || 20
            );
            res.json(history);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getFieldHistory(req, res) {
        try {
            const history = await this.taskHistoryService.getFieldHistory(
                req.params.taskId,
                req.params.fieldName
            );
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUserTaskChanges(req, res) {
        try {
            const { page, limit } = pageSchema.parse(req.query);
            const changes = await this.taskHistoryService.getUserTaskChanges(
                req.user.id,
                page || 1,
                limit || 20
            );
            res.json(changes);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new TaskHistoryController(); 