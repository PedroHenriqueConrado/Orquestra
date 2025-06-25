const taskCommentService = require('../services/task-comment.service');
const { z } = require('zod');

const commentSchema = z.object({
    content: z.string().min(1).max(1000),
    rating: z.number().min(0).max(10).optional()
});

const pageSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

class TaskCommentController {
    constructor() {
        this.taskCommentService = taskCommentService;
    }

    async create(req, res) {
        try {
            const validatedData = commentSchema.parse(req.body);
            const comment = await this.taskCommentService.createComment(
                req.params.taskId,
                req.user.id,
                validatedData.content,
                validatedData.rating
            );
            res.status(201).json(comment);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getTaskComments(req, res) {
        try {
            const { page, limit } = pageSchema.parse(req.query);
            const comments = await this.taskCommentService.getTaskComments(
                req.params.taskId,
                page || 1,
                limit || 10
            );
            res.json(comments);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const validatedData = commentSchema.parse(req.body);
            const comment = await this.taskCommentService.updateComment(
                req.params.commentId,
                req.user.id,
                validatedData.content,
                validatedData.rating
            );
            res.json(comment);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            await this.taskCommentService.deleteComment(
                req.params.commentId,
                req.user.id
            );
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getComment(req, res) {
        try {
            const comment = await this.taskCommentService.getCommentById(req.params.commentId);
            
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            
            res.json(comment);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = TaskCommentController; 