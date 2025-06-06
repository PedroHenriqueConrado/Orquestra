/**
 * Middleware para gerar IDs únicos para cada requisição
 * Facilita o rastreamento de problemas em logs
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Gera um ID único para cada requisição e o adiciona ao objeto req
 */
function requestIdMiddleware(req, res, next) {
  // Gera um ID único para a requisição
  const requestId = uuidv4();
  
  // Adiciona o ID ao objeto de requisição
  req.id = requestId;
  
  // Adiciona o ID como header de resposta
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

module.exports = requestIdMiddleware; 