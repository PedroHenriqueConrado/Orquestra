const taskDocumentService = require('../services/task-document.service');
const { z } = require('zod');

const documentSchema = z.object({
    title: z.string().min(3).max(200)
});

class TaskDocumentController {
    /**
     * Adiciona um documento existente a uma tarefa
     */
    async associateDocument(req, res) {
        try {
            const { taskId, documentId } = req.params;
            
            // Verifica se o documento já está associado à tarefa
            const isAssociated = await taskDocumentService.isDocumentAssociated(taskId, documentId);
            if (isAssociated) {
                return res.status(400).json({ error: 'Documento já está associado a esta tarefa' });
            }
            
            const association = await taskDocumentService.associateDocument(
                taskId,
                documentId,
                req.user.id
            );
            
            res.status(201).json(association);
        } catch (error) {
            console.error('Erro ao associar documento:', error);
            res.status(500).json({ error: error.message || 'Erro interno do servidor' });
        }
    }
    
    /**
     * Cria um novo documento e o associa a uma tarefa
     */
    async createAndAssociateDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            
            const { projectId, taskId } = req.params;
            
            try {
                const validatedData = documentSchema.parse(req.body);
                
                const association = await taskDocumentService.createAndAssociateDocument(
                    taskId,
                    projectId,
                    req.user.id,
                    validatedData.title,
                    req.file
                );
                
                res.status(201).json(association);
            } catch (zodError) {
                if (zodError instanceof z.ZodError) {
                    return res.status(400).json({ errors: zodError.errors });
                }
                throw zodError;
            }
        } catch (error) {
            console.error('Erro ao criar e associar documento:', error);
            res.status(500).json({ error: error.message || 'Erro interno do servidor' });
        }
    }
    
    /**
     * Remove a associação entre um documento e uma tarefa
     */
    async removeAssociation(req, res) {
        try {
            const { taskId, documentId } = req.params;
            
            await taskDocumentService.removeAssociation(taskId, documentId);
            
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao remover associação:', error);
            res.status(500).json({ error: error.message || 'Erro interno do servidor' });
        }
    }
    
    /**
     * Obtém todos os documentos associados a uma tarefa
     */
    async getTaskDocuments(req, res) {
        try {
            const { taskId } = req.params;
            
            const documents = await taskDocumentService.getTaskDocuments(taskId);
            
            res.json(documents);
        } catch (error) {
            console.error('Erro ao obter documentos da tarefa:', error);
            res.status(500).json({ error: error.message || 'Erro interno do servidor' });
        }
    }
}

module.exports = new TaskDocumentController(); 