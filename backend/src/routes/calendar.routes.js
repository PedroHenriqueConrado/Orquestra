const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/calendar/events
 * @desc    Obter eventos de todos os projetos do usuário para o calendário
 * @access  Private
 */
router.get('/events', auth, eventController.getUserCalendar);

/**
 * @route   PUT /api/calendar/events/:eventId/respond
 * @desc    Responder a um convite de evento
 * @access  Private
 */
router.put('/events/:eventId/respond', auth, eventController.respondToEventInvite);

module.exports = router;
