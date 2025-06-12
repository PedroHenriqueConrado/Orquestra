const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const config = require('../config');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona o usuário à requisição
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido', code: 'token_missing' });
    }
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.app.jwtSecret);
      // Padronizar payload: { id, email, role }
      if (!decoded.id || !decoded.email || !decoded.role) {
        return res.status(401).json({ error: 'Token inválido', code: 'invalid_token' });
      }
      // Busca o usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado', code: 'user_not_found' });
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado', code: 'token_expired' });
      }
      return res.status(401).json({ error: 'Token inválido', code: 'invalid_token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno de autenticação', code: 'auth_internal_error' });
  }
};

module.exports = authMiddleware; 