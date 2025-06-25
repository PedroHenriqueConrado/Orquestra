const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de templates
router.get('/', templateController.getTemplates);
router.get('/categories', templateController.getCategories);
router.get('/:templateId', templateController.getTemplateById);
router.delete('/:templateId', templateController.deleteTemplate);

// Criar template a partir de projeto existente
router.post('/from-project/:projectId', templateController.createFromProject);

// Criar projeto a partir de template
router.post('/:templateId/create-project', templateController.createProjectFromTemplate);

module.exports = router; 