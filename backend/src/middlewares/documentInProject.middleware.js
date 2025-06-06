const documentService = require('../services/document.service');
const logger = require('../utils/logger');

async function isDocumentInProject(req, res, next) {
    try {
        const { projectId, documentId } = req.params;
        
        logger.debug(`Middleware isDocumentInProject: Parâmetros recebidos:`, {
            projectId,
            documentId,
            params: req.params,
            url: req.originalUrl
        });
        
        if (!documentId) {
            logger.debug('Middleware isDocumentInProject: documentId não fornecido, continuando');
            return next();
        }
        
        if (!projectId) {
            logger.warn('Middleware isDocumentInProject: projectId não fornecido');
            return res.status(400).json({ 
                error: 'ID de projeto não fornecido',
                details: 'O ID do projeto é necessário para acessar o documento'
            });
        }

        // Verifica se projectId é um número válido
        const projectIdNum = parseInt(projectId, 10);
        if (isNaN(projectIdNum)) {
            logger.warn(`Middleware isDocumentInProject: ID de projeto inválido: ${projectId}`);
            return res.status(400).json({ 
                error: 'ID de projeto inválido',
                details: 'O ID do projeto deve ser um número válido'
            });
        }

        // Verifica se documentId é um número válido
        const documentIdNum = parseInt(documentId, 10);
        if (isNaN(documentIdNum)) {
            logger.warn(`Middleware isDocumentInProject: ID de documento inválido: ${documentId}`);
            return res.status(400).json({ 
                error: 'ID de documento inválido',
                details: 'O ID do documento deve ser um número válido'
            });
        }

        const exists = await documentService.isDocumentInProject(documentIdNum, projectIdNum);
        
        if (!exists) {
            logger.warn(`Middleware isDocumentInProject: Documento ${documentId} não encontrado no projeto ${projectId}`);
            return res.status(404).json({ 
                error: 'Documento não encontrado',
                details: 'O documento especificado não existe neste projeto' 
            });
        }

        logger.debug(`Middleware isDocumentInProject: Documento ${documentId} confirmado no projeto ${projectId}`);
        next();
    } catch (error) {
        logger.error('Middleware isDocumentInProject: Erro ao verificar documento no projeto', {
            error: error.message,
            stack: error.stack,
            params: req.params
        });
        
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: 'Ocorreu um erro ao verificar o documento no projeto'
        });
    }
}

module.exports = { isDocumentInProject }; 