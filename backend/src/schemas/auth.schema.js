const Joi = require('joi');

const roles = ['developer', 'supervisor', 'tutor', 'project_manager', 'team_leader', 'admin'];

const registerSchema = Joi.object({
  name: Joi.string()
    .min(3, 'utf8')
    .max(100, 'utf8')
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  email: Joi.string()
    .email()
    .max(150)
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email inválido',
      'string.max': 'Email deve ter no máximo 150 caracteres'
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'string.max': 'Senha deve ter no máximo 50 caracteres'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'string.empty': 'Confirmação de senha é obrigatória',
      'any.only': 'As senhas não conferem'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email inválido'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória'
    })
});

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(3, 'utf8')
    .max(100, 'utf8')
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    })
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha atual é obrigatória'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Nova senha é obrigatória',
      'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      'string.max': 'Nova senha deve ter no máximo 50 caracteres'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'string.empty': 'Confirmação de senha é obrigatória',
      'any.only': 'As senhas não conferem'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  roles
}; 