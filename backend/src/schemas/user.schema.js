const { z } = require('zod');

const updateUserSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .max(150, 'Email deve ter no máximo 150 caracteres')
    .optional(),
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória para alterações sensíveis'),
  newPassword: z.string()
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
    .max(50, 'Nova senha deve ter no máximo 50 caracteres')
    .optional(),
  confirmNewPassword: z.string().optional()
}).refine((data) => {
  // Se forneceu nova senha, precisa confirmar
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: "Senhas não conferem",
  path: ["confirmNewPassword"],
});

module.exports = {
  updateUserSchema
}; 