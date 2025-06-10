const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Rotas protegidas
router.use(authMiddleware);
router.get('/profile', AuthController.getProfile.bind(AuthController));
router.put('/profile', AuthController.updateProfile.bind(AuthController));
router.delete('/profile', AuthController.deleteAccount.bind(AuthController));
router.put('/password', AuthController.updatePassword.bind(AuthController));

module.exports = router; 