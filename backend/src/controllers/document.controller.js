const documentService = require('../services/document.service');
const { z } = require('zod');
const path = require('path');
const logger = require('../utils/logger');

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
                logger.warn('Tentativa de upload sem arquivo');
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { projectId, documentId } = req.params;
            
            logger.debug('Controller uploadNewVersion: Parâmetros recebidos', {
                projectId,
                documentId,
                file: req.file.originalname,
                fileSize: req.file.size,
                params: req.params,
                baseUrl: req.baseUrl,
                url: req.originalUrl
            });
            
            if (!projectId) {
                logger.warn('Controller uploadNewVersion: projectId não fornecido');
                return res.status(400).json({ 
                    error: 'ID de projeto não fornecido',
                    details: 'O ID do projeto é necessário para adicionar uma nova versão'
                });
            }
            
            if (!documentId) {
                logger.warn('Controller uploadNewVersion: documentId não fornecido');
                return res.status(400).json({ 
                    error: 'ID de documento não fornecido',
                    details: 'O ID do documento é necessário para adicionar uma nova versão'
                });
            }
            
            logger.info(`Controller uploadNewVersion: Iniciando upload de nova versão. Projeto: ${projectId}, Documento: ${documentId}, Arquivo: ${req.file.originalname}`);
            
            const version = await documentService.uploadNewVersion(
                documentId,
                projectId,
                req.user.id,
                req.file
            );
            
            logger.info(`Controller uploadNewVersion: Nova versão criada com sucesso: ${version.version_number}`);

            res.status(201).json(version);
        } catch (error) {
            logger.error('Controller uploadNewVersion: Erro ao fazer upload', {
                error: error.message,
                stack: error.stack,
                params: req.params
            });
            
            res.status(500).json({ 
                error: 'Erro ao fazer upload de nova versão', 
                details: error.message 
            });
        }
    }

    async downloadVersion(req, res) {
        try {
            const { projectId, documentId, versionNumber } = req.params;
            
            logger.info(`Solicitação de download: Projeto ${projectId}, Documento ${documentId}, Versão ${versionNumber}`);
            
            // Verificar se o documento pertence ao projeto
            const document = await documentService.isDocumentInProject(documentId, projectId);
            if (!document) {
                logger.warn(`Documento ${documentId} não pertence ao projeto ${projectId}`);
                return res.status(404).json({ error: 'Document not found in this project' });
            }
            
            const version = await documentService.getDocumentVersion(documentId, versionNumber);
            if (!version) {
                logger.warn(`Versão ${versionNumber} não encontrada para o documento ${documentId}`);
                return res.status(404).json({ error: 'Version not found' });
            }
            
            logger.debug('Versão encontrada:', version);
            
            try {
                const filePath = await documentService.getFilePath(version);
                logger.debug(`Caminho do arquivo: ${filePath}`);
                
                // Define um nome amigável para o download incluindo número da versão
                const downloadName = `${version.original_name.split('.').slice(0, -1).join('.')}_v${version.version_number}${path.extname(version.original_name)}`;
                
                // Define cabeçalhos explícitos para download
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
                res.setHeader('Content-Type', version.mime_type || 'application/octet-stream');
                
                // Envia o arquivo
                res.download(filePath, downloadName, (err) => {
                    if (err) {
                        logger.error('Erro ao enviar arquivo:', err);
                        // Se já enviou headers, não pode enviar resposta de erro
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Error sending file' });
                        }
                    }
                });
            } catch (error) {
                logger.error('Erro ao obter caminho do arquivo:', error);
                res.status(500).json({ error: 'File not accessible' });
            }
        } catch (error) {
            logger.error('Erro geral no download:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new DocumentController(); 