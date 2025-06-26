const express = require('express');
const router = express.Router();
const advancedDashboardController = require('../controllers/advanced-dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/roleAuth.middleware');

// Todas as rotas requerem autenticação e role de project_manager
router.use(authenticate);
router.use(roleAuth(['project_manager']));

// Rota para métricas avançadas
router.get('/metrics', advancedDashboardController.getAdvancedMetrics);

// Rota para análises de projeto específico
router.get('/project/:projectId/analytics', advancedDashboardController.getProjectAnalytics);

// Rota para lista de projetos (para filtros)
router.get('/projects', advancedDashboardController.getProjectsList);

// Rota para lista de usuários (para filtros)
router.get('/users', advancedDashboardController.getUsersList);

module.exports = router; 