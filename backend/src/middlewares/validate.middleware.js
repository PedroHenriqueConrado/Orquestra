const logger = require('../utils/logger');

/**
 * Middleware para validação de dados utilizando esquemas Zod
 * 
 * @param {Object} schema - Esquema Zod para validação
 * @returns {Function} Middleware de validação
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Determinar qual parte da requisição validar
    const validationParts = {};
    if (schema.body) validationParts.body = req.body;
    if (schema.params) validationParts.params = req.params;
    if (schema.query) validationParts.query = req.query;

    let errors = [];

    // Validar cada parte da requisição
    Object.keys(validationParts).forEach(key => {
      try {
        const validatedData = schema[key].parse(validationParts[key]);
        // Atualizar os dados validados na requisição
        req[key] = validatedData;
      } catch (error) {
        if (error.errors) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }));
          errors = [...errors, ...details];
        }
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
  } catch (error) {
    logger.error('Erro no middleware de validação', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = validate;

