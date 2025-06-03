const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');
const { isDocumentInProject } = require('../middlewares/documentInProject.middleware');

// Configuração do Multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por arquivo
        files: 10 // Máximo de 10 arquivos por vez
    }
});

// Todas as rotas requerem autenticação e ser membro do projeto
router.use(authenticate);
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

router.get('/:documentId/versions/:versionNumber',
    isDocumentInProject,
    documentController.downloadVersion
);

module.exports = router; 