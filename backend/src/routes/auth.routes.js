const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');

// Rota de registro
router.post('/register', AuthController.register.bind(AuthController));

// Rota de login
router.post('/login', AuthController.login.bind(AuthController));

module.exports = router; 