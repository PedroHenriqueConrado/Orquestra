const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

// Rotas públicas
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Rotas protegidas
router.use(authMiddleware);
router.get('/profile', AuthController.getProfile.bind(AuthController));
router.put('/profile', AuthController.updateProfile.bind(AuthController));
router.put('/password', AuthController.updatePassword.bind(AuthController));

// Rotas de imagem de perfil
router.post('/profile/image', upload.single('image'), AuthController.updateProfileImage);
router.get('/profile/image', AuthController.getProfileImage);
router.delete('/profile/image', AuthController.deleteProfileImage);

module.exports = router; 