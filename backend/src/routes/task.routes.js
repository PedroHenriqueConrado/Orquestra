const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const taskController = require('../controllers/task.controller');
const taskTagController = require('../controllers/task-tag.controller');
const taskCommentController = require('../controllers/task-comment.controller');
const taskHistoryController = require('../controllers/task-history.controller');
const TaskDocumentController = require('../controllers/task-document.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const projectAccessMiddleware = require('../middlewares/project-access.middleware');
const { isCommentOwner } = require('../middlewares/commentOwner.middleware');

// Configuração do Multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por arquivo
    }
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task Tags Routes
router.post('/tags', projectAccessMiddleware, (req, res) => taskTagController.create(req, res));
router.get('/tags', projectAccessMiddleware, (req, res) => taskTagController.getProjectTags(req, res));
router.put('/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.update(req, res));
router.delete('/tags/:tagId', projectAccessMiddleware, (req, res) => taskTagController.delete(req, res));

// Task Routes
router.get('/', projectAccessMiddleware, (req, res) => taskController.getAllProjectTasks(req, res));
router.get('/:taskId', projectAccessMiddleware, (req, res) => taskController.getById(req, res));
router.post('/', projectAccessMiddleware, (req, res) => taskController.create(req, res));
router.put('/:taskId', projectAccessMiddleware, (req, res) => taskController.update(req, res));
router.delete('/:taskId', projectAccessMiddleware, (req, res) => taskController.delete(req, res));
router.put('/:taskId/time', projectAccessMiddleware, (req, res) => taskController.updateTime(req, res));
router.get('/metrics', projectAccessMiddleware, (req, res) => taskController.getMetrics(req, res));

// Nova rota para atualizar status e posição via drag-and-drop
router.put('/:taskId/status', projectAccessMiddleware, (req, res) => taskController.updateTaskStatusPosition(req, res));

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
router.put('/:taskId/comments/:commentId', projectAccessMiddleware, isCommentOwner, (req, res) => taskCommentController.update(req, res));
router.delete('/:taskId/comments/:commentId', projectAccessMiddleware, isCommentOwner, (req, res) => taskCommentController.delete(req, res));

// Task History Routes
router.get('/:taskId/history', projectAccessMiddleware, (req, res) => taskHistoryController.getTaskHistory(req, res));
router.get('/:taskId/history/:fieldName', projectAccessMiddleware, (req, res) => taskHistoryController.getFieldHistory(req, res));
router.get('/user/task-changes', projectAccessMiddleware, (req, res) => taskHistoryController.getUserTaskChanges(req, res));

module.exports = router; 