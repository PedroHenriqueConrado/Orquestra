const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const authenticate = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Busca global
router.get('/global', searchController.globalSearch);

// Busca rápida para autocomplete
router.get('/quick', searchController.quickSearch);

module.exports = router; 