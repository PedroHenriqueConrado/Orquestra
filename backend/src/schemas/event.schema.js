const Joi = require('joi');

const createEvent = {
  body: Joi.object().keys({
    title: Joi.string().required().min(3).max(200)
      .messages({
        'string.empty': 'O título do evento é obrigatório',
        'string.min': 'O título deve ter no mínimo 3 caracteres',
        'string.max': 'O título deve ter no máximo 200 caracteres',
        'any.required': 'O título do evento é obrigatório'
      }),
    description: Joi.string().allow('').max(1000)
      .messages({
        'string.max': 'A descrição deve ter no máximo 1000 caracteres'
      }),
    start_time: Joi.date().iso().required()
      .messages({
        'date.base': 'A data de início deve ser uma data válida',
        'any.required': 'A data de início é obrigatória'
      }),
    end_time: Joi.date().iso().min(Joi.ref('start_time')).required()
      .messages({
        'date.base': 'A data de término deve ser uma data válida',
        'date.min': 'A data de término deve ser após a data de início',
        'any.required': 'A data de término é obrigatória'
      }),
    all_day: Joi.boolean().default(false),
    location: Joi.string().allow('').max(200),
    color: Joi.string().allow('').max(7).pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .messages({
        'string.pattern.base': 'A cor deve estar no formato hexadecimal (#FFF ou #FFFFFF)'
      }),
    attendees: Joi.array().items(Joi.number().integer().positive()).default([])
  })
};

const updateEvent = {
  body: Joi.object().keys({
    title: Joi.string().min(3).max(200)
      .messages({
        'string.empty': 'O título do evento é obrigatório',
        'string.min': 'O título deve ter no mínimo 3 caracteres',
        'string.max': 'O título deve ter no máximo 200 caracteres'
      }),
    description: Joi.string().allow('').max(1000)
      .messages({
        'string.max': 'A descrição deve ter no máximo 1000 caracteres'
      }),
    start_time: Joi.date().iso()
      .messages({
        'date.base': 'A data de início deve ser uma data válida'
      }),
    end_time: Joi.date().iso().min(Joi.ref('start_time'))
      .messages({
        'date.base': 'A data de término deve ser uma data válida',
        'date.min': 'A data de término deve ser após a data de início'
      }),
    all_day: Joi.boolean(),
    location: Joi.string().allow('').max(200),
    color: Joi.string().allow('').max(7).pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .messages({
        'string.pattern.base': 'A cor deve estar no formato hexadecimal (#FFF ou #FFFFFF)'
      }),
    attendees: Joi.array().items(Joi.number().integer().positive())
  })
};

const respondToEvent = {
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'declined', 'tentative').required()
      .messages({
        'any.only': 'O status deve ser: pending, accepted, declined ou tentative',
        'any.required': 'O status é obrigatório'
      })
  })
};

module.exports = {
  createEvent,
  updateEvent,
  respondToEvent
};

