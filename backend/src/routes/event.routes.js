const express = require('express');
const router = express.Router({ mergeParams: true });
const eventController = require('../controllers/event.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const eventSchema = require('../schemas/event.schema');

/**
 * @route   GET /api/projects/:projectId/events
 * @desc    Obter todos os eventos de um projeto
 * @access  Private
 */
router.get('/', auth, eventController.getProjectEvents);

/**
 * @route   POST /api/projects/:projectId/events
 * @desc    Criar um novo evento
 * @access  Private
 */
router.post('/', auth, validate(eventSchema.createEvent), eventController.createEvent);

/**
 * @route   GET /api/projects/:projectId/events/:eventId
 * @desc    Obter detalhes de um evento específico
 * @access  Private
 */
router.get('/:eventId', auth, eventController.getEvent);

/**
 * @route   PUT /api/projects/:projectId/events/:eventId
 * @desc    Atualizar um evento
 * @access  Private
 */
router.put('/:eventId', auth, validate(eventSchema.updateEvent), eventController.updateEvent);

/**
 * @route   DELETE /api/projects/:projectId/events/:eventId
 * @desc    Excluir um evento
 * @access  Private
 */
router.delete('/:eventId', auth, eventController.deleteEvent);

module.exports = router;
