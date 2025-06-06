const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const documentController = require('../controllers/document.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');
const { isDocumentInProject } = require('../middlewares/documentInProject.middleware');
const logger = require('../utils/logger');

// Configuração do Multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por arquivo
        files: 10 // Máximo de 10 arquivos por vez
    }
});

// Middleware para garantir que projectId está disponível
const ensureProjectId = (req, res, next) => {
    // Logging para debug
    logger.debug('Middleware ensureProjectId: Verificando projectId', {
        params: req.params,
        url: req.originalUrl
    });
    
    if (!req.params.projectId) {
        return res.status(400).json({
            error: 'ID de projeto não fornecido',
            details: 'O ID do projeto é necessário para esta operação'
        });
    }
    
    next();
};

// Todas as rotas requerem autenticação
router.use(authenticate);

// Aplicar middlewares em todas as rotas
router.use(ensureProjectId);
router.use(isProjectMember);

// Rotas básicas de CRUD
router.post('/', 
    (req, res, next) => {
        // Se tem título, é upload único
        if (req.body.title) {
            upload.single('file')(req, res, next);
        } else {
            upload.array('files', 10)(req, res, next);
        }
    },
    documentController.create
);

router.get('/', documentController.getAllProjectDocuments);
router.get('/:documentId', isDocumentInProject, documentController.getById);
router.put('/:documentId', isDocumentInProject, documentController.update);
router.delete('/:documentId', isDocumentInProject, documentController.delete);

// Rotas de versionamento
router.post('/:documentId/versions', 
    isDocumentInProject,
    upload.single('file'),
    documentController.uploadNewVersion
);

// Rota de download 
router.get('/:documentId/versions/:versionNumber',
    authenticate, // Usa apenas a autenticação básica
    isDocumentInProject, // Verificar se o documento pertence ao projeto
    documentController.downloadVersion
);

module.exports = router; 