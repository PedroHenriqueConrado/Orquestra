const { z } = require('zod');

const roles = ['developer', 'supervisor', 'tutor', 'project_manager', 'team_leader', 'admin'];

const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(150, 'Email deve ter no máximo 150 caracteres'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(roles, {
    errorMap: () => ({ message: 'Cargo inválido' })
  }).optional().default('developer')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
});

module.exports = {
  registerSchema,
  loginSchema,
  roles
}; 