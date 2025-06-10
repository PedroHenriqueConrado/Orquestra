const logger = require('../utils/logger');

/**
 * Middleware para validação de dados utilizando esquemas Joi
 * 
 * @param {Object} schema - Esquema Joi para validação
 * @returns {Function} Middleware de validação
 */
const validate = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false, // incluir todos os erros
    allowUnknown: true, // ignorar propriedades desconhecidas
    stripUnknown: false // não remover propriedades desconhecidas
  };

  // Determinar qual parte da requisição validar
  const validationParts = {};
  if (schema.body) validationParts.body = req.body;
  if (schema.params) validationParts.params = req.params;
  if (schema.query) validationParts.query = req.query;

  let errors = [];

  // Validar cada parte da requisição
  Object.keys(validationParts).forEach(key => {
    const { error } = schema[key].validate(validationParts[key], options);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      errors = [...errors, ...details];
    }
  });

  if (errors.length > 0) {
    logger.warn('Validação falhou na requisição', { 
      path: req.originalUrl,
      method: req.method,
      errors
    });

    return res.status(400).json({
      error: 'Erro de validação',
      details: errors
    });
  }

  logger.debug('Validação bem-sucedida', {
    path: req.originalUrl,
    method: req.method
  });
  
  return next();
};

module.exports = validate;

