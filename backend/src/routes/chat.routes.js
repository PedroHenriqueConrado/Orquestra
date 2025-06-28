const express = require('express');
const router = express.Router({ mergeParams: true });
const chatController = require('../controllers/chat.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');
const { isMessageOwner } = require('../middlewares/messageOwner.middleware');

// Todas as rotas requerem autenticação e ser membro do projeto
router.use(authenticate);
router.use(isProjectMember);

// Rotas básicas de CRUD
router.post('/', chatController.create);
router.get('/', chatController.getProjectMessages);
router.get('/:messageId', chatController.getMessage);

// Rotas que requerem ser dono da mensagem
router.put('/:messageId', isMessageOwner, chatController.update);
router.delete('/:messageId', isMessageOwner, chatController.delete);

module.exports = router; 