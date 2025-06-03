const documentService = require('../services/document.service');
const { z } = require('zod');

const documentSchema = z.object({
    title: z.string().min(3).max(200)
});

class DocumentController {
    async create(req, res) {
        try {
            // Upload único com título personalizado
            if (req.file) {
                if (!req.body.title) {
                    return res.status(400).json({ error: 'Title is required for single file upload' });
                }

                const validatedData = documentSchema.parse(req.body);
                const document = await documentService.createDocument(
                    req.params.projectId,
                    req.user.id,
                    validatedData.title,
                    req.file
                );

                return res.status(201).json(document);
            }
            
            // Upload múltiplo (usa nome dos arquivos como títulos)
            if (req.files && req.files.length > 0) {
                const documents = await documentService.createMultipleDocuments(
                    req.params.projectId,
                    req.user.id,
                    req.files
                );

                return res.status(201).json(documents);
            }

            return res.status(400).json({ error: 'No files uploaded' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAllProjectDocuments(req, res) {
        try {
            const documents = await documentService.getAllProjectDocuments(req.params.projectId);
            res.json(documents);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getById(req, res) {
        try {
            const { projectId, documentId } = req.params;
            const document = await documentService.getDocumentById(documentId, projectId);
            
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }
            
            res.json(document);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const { projectId, documentId } = req.params;
            const validatedData = documentSchema.parse(req.body);
            
            const document = await documentService.updateDocument(
                documentId,
                projectId,
                validatedData.title
            );

            res.json(document);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            const { projectId, documentId } = req.params;
            await documentService.deleteDocument(documentId, projectId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async uploadNewVersion(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { projectId, documentId } = req.params;
            const version = await documentService.uploadNewVersion(
                documentId,
                projectId,
                req.user.id,
                req.file
            );

            res.status(201).json(version);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async downloadVersion(req, res) {
        try {
            const { projectId, documentId, versionNumber } = req.params;
            
            const version = await documentService.getDocumentVersion(documentId, versionNumber);
            if (!version) {
                return res.status(404).json({ error: 'Version not found' });
            }

            const filePath = documentService.getFilePath(version);
            res.download(filePath, version.file_path);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new DocumentController(); 