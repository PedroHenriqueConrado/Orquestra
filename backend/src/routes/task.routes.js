const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const TaskController = require('../controllers/task.controller');
const TaskTagController = require('../controllers/task-tag.controller');
const TaskCommentController = require('../controllers/task-comment.controller');
const TaskHistoryController = require('../controllers/task-history.controller');
const TaskDocumentController = require('../controllers/task-document.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const projectAccessMiddleware = require('../middlewares/project-access.middleware');

// Configuração do Multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por arquivo
    }
});

// Instantiate controllers
const taskController = new TaskController();
const taskTagController = new TaskTagController();
const taskCommentController = new TaskCommentController();
const taskHistoryController = new TaskHistoryController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task Tags Routes
router.post('/tags', projectAccessMiddleware, (req, res) => taskTagController.create(req, res));
router.get('/tags', projectAccessMiddleware, (req, res) => taskTagController.getProjectTags(req, res));
router.put('/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.update(req, res));
router.delete('/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.delete(req, res));

// Task Routes
router.post('/', projectAccessMiddleware, (req, res) => taskController.create(req, res));
router.get('/', projectAccessMiddleware, (req, res) => taskController.getAllProjectTasks(req, res));
router.get('/:taskId', projectAccessMiddleware, (req, res) => taskController.getById(req, res));
router.put('/:taskId', projectAccessMiddleware, (req, res) => taskController.update(req, res));
router.delete('/:taskId', projectAccessMiddleware, (req, res) => taskController.delete(req, res));
router.put('/:taskId/time', projectAccessMiddleware, (req, res) => taskController.updateTime(req, res));
router.get('/metrics', projectAccessMiddleware, (req, res) => taskController.getMetrics(req, res));

// Task-Tag Association Routes
router.post('/:taskId/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.addTagToTask(req, res));
router.delete('/:taskId/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.removeTagFromTask(req, res));
router.get('/:taskId/tags', projectAccessMiddleware, (req, res) => taskTagController.getTaskTags(req, res));

// Task Documents Routes
router.get('/:taskId/documents', projectAccessMiddleware, TaskDocumentController.getTaskDocuments);
router.post('/:taskId/documents', 
    projectAccessMiddleware, 
    upload.single('file'),
    TaskDocumentController.createAndAssociateDocument
);
router.post('/:taskId/documents/:documentId', 
    projectAccessMiddleware, 
    TaskDocumentController.associateDocument
);
router.delete('/:taskId/documents/:documentId', 
    projectAccessMiddleware, 
    TaskDocumentController.removeAssociation
);

// Task Comments Routes
router.post('/:taskId/comments', projectAccessMiddleware, (req, res) => taskCommentController.create(req, res));
router.get('/:taskId/comments', projectAccessMiddleware, (req, res) => taskCommentController.getTaskComments(req, res));
router.get('/:taskId/comments/:commentId', projectAccessMiddleware, (req, res) => taskCommentController.getComment(req, res));
router.put('/:taskId/comments/:commentId', projectAccessMiddleware, (req, res) => taskCommentController.update(req, res));
router.delete('/:taskId/comments/:commentId', projectAccessMiddleware, (req, res) => taskCommentController.delete(req, res));

// Task History Routes
router.get('/:taskId/history', projectAccessMiddleware, (req, res) => taskHistoryController.getTaskHistory(req, res));
router.get('/:taskId/history/:fieldName', projectAccessMiddleware, (req, res) => taskHistoryController.getFieldHistory(req, res));
router.get('/user/task-changes', projectAccessMiddleware, (req, res) => taskHistoryController.getUserTaskChanges(req, res));

// Rotas de tarefas
router.get('/projects/:projectId/tasks', projectAccessMiddleware, (req, res) => taskController.getTasks(req, res));
router.get('/projects/:projectId/tasks/:taskId', projectAccessMiddleware, (req, res) => taskController.getTaskById(req, res));
router.post('/projects/:projectId/tasks', projectAccessMiddleware, (req, res) => taskController.createTask(req, res));
router.put('/projects/:projectId/tasks/:taskId', projectAccessMiddleware, (req, res) => taskController.updateTask(req, res));
router.patch('/projects/:projectId/tasks/:taskId/status', projectAccessMiddleware, (req, res) => taskController.updateTaskStatus(req, res));
router.delete('/projects/:projectId/tasks/:taskId', projectAccessMiddleware, (req, res) => taskController.deleteTask(req, res));

module.exports = router; 