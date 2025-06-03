const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas básicas de CRUD
router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', isProjectMember, projectController.getById);
router.put('/:id', isProjectMember, projectController.update);
router.delete('/:id', isProjectMember, projectController.delete);

// Rotas de gerenciamento de membros
router.get('/:id/members', isProjectMember, projectController.getMembers);
router.post('/:id/members', isProjectMember, projectController.addMember);
router.delete('/:id/members/:userId', isProjectMember, projectController.removeMember);

module.exports = router; 