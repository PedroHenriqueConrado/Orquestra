const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string()
    .min(3, 'Nome do projeto deve ter no mínimo 3 caracteres')
    .max(150, 'Nome do projeto deve ter no máximo 150 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
});

const addMemberSchema = z.object({
  userId: z.number().int().positive('ID do usuário inválido'),
  role: z.enum(['executor', 'supervisor'], {
    errorMap: () => ({ message: 'Cargo deve ser executor ou supervisor' })
  })
});

module.exports = {
  createProjectSchema,
  addMemberSchema
}; 