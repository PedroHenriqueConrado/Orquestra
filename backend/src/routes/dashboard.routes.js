const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rota geral de estatísticas (disponível para todos os usuários autenticados)
router.get('/overall', dashboardController.getOverallStatistics);

// Rotas específicas de projeto (requerem ser membro do projeto)
router.use(isProjectMember);
router.get('/project/:projectId/statistics', dashboardController.getProjectStatistics);
router.get('/project/:projectId/timeline', dashboardController.getProjectTimeline);
router.get('/project/:projectId/members/performance', dashboardController.getMemberPerformance);
router.get('/project/:projectId/progress', dashboardController.getProjectProgress);

module.exports = router; 