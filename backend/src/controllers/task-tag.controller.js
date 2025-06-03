const taskTagService = require('../services/task-tag.service');
const { z } = require('zod');

const tagSchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
});

class TaskTagController {
    constructor() {
        this.taskTagService = taskTagService;
    }

    async create(req, res) {
        try {
            const validatedData = tagSchema.parse(req.body);
            const tag = await this.taskTagService.createTag(req.params.projectId, validatedData);
            res.status(201).json(tag);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProjectTags(req, res) {
        try {
            const tags = await this.taskTagService.getProjectTags(req.params.projectId);
            res.json(tags);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const validatedData = tagSchema.parse(req.body);
            const tag = await this.taskTagService.updateTag(
                req.params.tagId,
                req.params.projectId,
                validatedData
            );
            res.json(tag);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            await this.taskTagService.deleteTag(req.params.tagId, req.params.projectId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async addTagToTask(req, res) {
        try {
            const result = await this.taskTagService.addTagToTask(
                req.params.taskId,
                req.params.tagId
            );
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async removeTagFromTask(req, res) {
        try {
            await this.taskTagService.removeTagFromTask(
                req.params.taskId,
                req.params.tagId
            );
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getTaskTags(req, res) {
        try {
            const tags = await this.taskTagService.getTaskTags(req.params.taskId);
            res.json(tags);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = TaskTagController; 