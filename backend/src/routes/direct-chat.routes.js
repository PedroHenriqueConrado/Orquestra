const express = require('express');
const router = express.Router();
const directChatController = require('../controllers/direct-chat.controller');
const authenticate = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas para chat direto entre usuários
router.post('/start', directChatController.startChat);
router.get('/', directChatController.getUserChats);
router.get('/:chatId', directChatController.getChatDetails);
router.get('/:chatId/messages', directChatController.getChatMessages);
router.post('/:chatId/messages', directChatController.sendMessage);
router.delete('/:chatId/messages/:messageId', directChatController.deleteMessage);

module.exports = router;
