const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');
const documentRoutes = require('./document.routes');
const chatRoutes = require('./chat.routes');
const directChatRoutes = require('./direct-chat.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');
const advancedDashboardRoutes = require('./advanced-dashboard.routes');
const searchRoutes = require('./search.routes');
const eventRoutes = require('./event.routes');
const calendarRoutes = require('./calendar.routes');
const templateRoutes = require('./template.routes');

// Rota de teste/health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API está funcionando!',
    timestamp: new Date()
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de usuário
router.use('/users', userRoutes);

// Rotas de projeto
router.use('/projects', projectRoutes);

// Rotas de tarefas (aninhadas dentro de projetos)
router.use('/projects/:projectId/tasks', taskRoutes);

// Rotas de documentos (aninhadas dentro de projetos)
router.use('/projects/:projectId/documents', documentRoutes);

// Rotas de chat (aninhadas dentro de projetos)
router.use('/projects/:projectId/chat', chatRoutes);

// Rotas de chat direto entre usuários
router.use('/direct-messages', directChatRoutes);

// Rotas de notificações
router.use('/notifications', notificationRoutes);

// Rotas de dashboard
router.use('/dashboard', dashboardRoutes);

// Rotas de dashboard avançado
router.use('/advanced-dashboard', advancedDashboardRoutes);

// Rotas de busca
router.use('/search', searchRoutes);

// Rotas de eventos
router.use('/events', eventRoutes);

// Rotas de calendário
router.use('/calendar', calendarRoutes);

// Rotas de templates
router.use('/templates', templateRoutes);

module.exports = router; 