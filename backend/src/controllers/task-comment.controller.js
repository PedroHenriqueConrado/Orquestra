const taskCommentService = require('../services/task-comment.service');
const { z } = require('zod');
const { hasPermission, canEditResource } = require('../utils/permissions');

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
            
            // Verificar permissão para criar comentários
            if (!hasPermission(req.user.role, 'comments:create')) {
                return res.status(403).json({
                    message: 'Você não tem permissão para criar comentários'
                });
            }
            
            // Verificar permissão para avaliar (rating)
            if (validatedData.rating !== undefined && !hasPermission(req.user.role, 'comments:rate')) {
                return res.status(403).json({
                    message: 'Você não tem permissão para avaliar tarefas'
                });
            }
            
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
            const { commentId } = req.params;
            
            // Buscar o comentário para verificar permissões
            const comment = await this.taskCommentService.getCommentById(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            
            // Verificar se pode editar este comentário específico
            const canEdit = canEditResource(
                req.user.role,
                comment.user_id,
                req.user.id,
                'comments:edit_any'
            );
            
            if (!canEdit) {
                return res.status(403).json({
                    message: 'Você não tem permissão para editar este comentário'
                });
            }
            
            const validatedData = commentSchema.parse(req.body);
            
            // Verificar permissão para avaliar (rating) se estiver tentando adicionar/modificar
            if (validatedData.rating !== undefined && !hasPermission(req.user.role, 'comments:rate')) {
                return res.status(403).json({
                    message: 'Você não tem permissão para avaliar tarefas'
                });
            }
            
            const updatedComment = await this.taskCommentService.updateComment(
                commentId,
                req.user.id,
                validatedData.content,
                validatedData.rating
            );
            res.json(updatedComment);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            const { commentId } = req.params;
            
            // Buscar o comentário para verificar permissões
            const comment = await this.taskCommentService.getCommentById(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            
            // Verificar se pode excluir este comentário específico
            const canDelete = canEditResource(
                req.user.role,
                comment.user_id,
                req.user.id,
                'comments:delete_any'
            );
            
            if (!canDelete) {
                return res.status(403).json({
                    message: 'Você não tem permissão para excluir este comentário'
                });
            }
            
            await this.taskCommentService.deleteComment(
                commentId,
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

module.exports = new TaskCommentController(); 