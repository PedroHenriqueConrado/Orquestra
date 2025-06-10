const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para tarefas
router.get('/', tasksController.getAllTasks);
router.get('/:id', tasksController.getTaskById);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);
router.put('/:id/status', tasksController.updateTaskStatus);

// Rotas para tarefas de um projeto específico
router.get('/projects/:projectId/tasks', tasksController.getTasksByProject);
router.post('/projects/:projectId/tasks', tasksController.createTask);

module.exports = router; 