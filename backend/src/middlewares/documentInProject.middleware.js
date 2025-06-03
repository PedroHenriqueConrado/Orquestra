const documentService = require('../services/document.service');

async function isDocumentInProject(req, res, next) {
    try {
        const { projectId, documentId } = req.params;
        
        if (!documentId) {
            return next();
        }

        const exists = await documentService.isDocumentInProject(documentId, projectId);
        
        if (!exists) {
            return res.status(404).json({ error: 'Document not found in this project' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { isDocumentInProject }; 