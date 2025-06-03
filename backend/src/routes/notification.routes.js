const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isNotificationOwner } = require('../middlewares/notificationOwner.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas básicas
router.post('/', notificationController.create);
router.get('/', notificationController.getUserNotifications);
router.get('/:notificationId', notificationController.getNotification);

// Rotas que requerem ser dono da notificação
router.put('/:notificationId/read', isNotificationOwner, notificationController.markAsRead);
router.delete('/:notificationId', isNotificationOwner, notificationController.delete);

module.exports = router; 