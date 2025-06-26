const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  description: z.string()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres')
    .optional()
    .default(''),
  start_time: z.string()
    .datetime('A data de início deve ser uma data válida'),
  end_time: z.string()
    .datetime('A data de término deve ser uma data válida'),
  all_day: z.boolean()
    .default(false),
  location: z.string()
    .max(200, 'Local deve ter no máximo 200 caracteres')
    .optional()
    .default(''),
  color: z.string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'A cor deve estar no formato hexadecimal (#FFF ou #FFFFFF)')
    .optional()
    .default(''),
  attendees: z.array(z.number().int().positive())
    .default([])
}).refine((data) => {
  const startTime = new Date(data.start_time);
  const endTime = new Date(data.end_time);
  return endTime > startTime;
}, {
  message: 'A data de término deve ser após a data de início',
  path: ['end_time']
});

const updateEventSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres')
    .optional(),
  description: z.string()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres')
    .optional(),
  start_time: z.string()
    .datetime('A data de início deve ser uma data válida')
    .optional(),
  end_time: z.string()
    .datetime('A data de término deve ser uma data válida')
    .optional(),
  all_day: z.boolean()
    .optional(),
  location: z.string()
    .max(200, 'Local deve ter no máximo 200 caracteres')
    .optional(),
  color: z.string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'A cor deve estar no formato hexadecimal (#FFF ou #FFFFFF)')
    .optional(),
  attendees: z.array(z.number().int().positive())
    .optional()
}).refine((data) => {
  if (data.start_time && data.end_time) {
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);
    return endTime > startTime;
  }
  return true;
}, {
  message: 'A data de término deve ser após a data de início',
  path: ['end_time']
});

const respondToEventSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'tentative'], {
    errorMap: () => ({ message: 'O status deve ser: pending, accepted, declined ou tentative' })
  })
});

// Estrutura esperada pelo middleware de validação
const createEvent = {
  body: createEventSchema
};

const updateEvent = {
  body: updateEventSchema
};

const respondToEvent = {
  body: respondToEventSchema
};

module.exports = {
  createEvent,
  updateEvent,
  respondToEvent
};

