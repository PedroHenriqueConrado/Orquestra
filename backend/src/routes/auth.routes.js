const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Rotas protegidas
router.get('/profile', authMiddleware, AuthController.getProfile.bind(AuthController));
router.put('/profile', authMiddleware, AuthController.updateProfile.bind(AuthController));
router.put('/password', authMiddleware, AuthController.updatePassword.bind(AuthController));

module.exports = router; 
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer();

// Rotas públicas
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Rotas protegidas
router.use(authMiddleware);
router.put('/profile', AuthController.updateProfile.bind(AuthController));
router.put('/password', AuthController.updatePassword.bind(AuthController));

// Rotas de imagem de perfil
router.post('/profile/image', authenticateToken, upload.single('image'), AuthController.updateProfileImage);
router.get('/profile/image', authenticateToken, AuthController.getProfileImage);
router.delete('/profile/image', authenticateToken, AuthController.deleteProfileImage);

module.exports = router; 