const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware);

// Listar todos os usuários
router.get('/', userController.findAll);

// Buscar usuário por ID
router.get('/:id', userController.findById);

// Atualizar usuário
router.put('/:id', userController.update);

// Deletar usuário
router.delete('/:id', userController.delete);

module.exports = router; 