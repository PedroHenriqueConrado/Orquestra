const chatService = require('../services/chat.service');
const { z } = require('zod');

const messageSchema = z.object({
    message: z.string().min(1).max(1000)
});

const pageSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

class ChatController {
    async create(req, res) {
        try {
            const validatedData = messageSchema.parse(req.body);
            const message = await chatService.createMessage(
                req.params.projectId,
                req.user.id,
                validatedData.message
            );
            res.status(201).json(message);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProjectMessages(req, res) {
        try {
            const { page, limit } = pageSchema.parse(req.query);
            const messages = await chatService.getProjectMessages(
                req.params.projectId,
                page || 1,
                limit || 50
            );
            res.json(messages);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getMessage(req, res) {
        try {
            const { projectId, messageId } = req.params;
            const message = await chatService.getMessage(messageId, projectId);
            
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }
            
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const { projectId, messageId } = req.params;
            const validatedData = messageSchema.parse(req.body);
            
            const message = await chatService.updateMessage(
                messageId,
                projectId,
                req.user.id,
                validatedData.message
            );

            res.json(message);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            const { projectId, messageId } = req.params;
            await chatService.deleteMessage(messageId, projectId, req.user.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new ChatController(); 