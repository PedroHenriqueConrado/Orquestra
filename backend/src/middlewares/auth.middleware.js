const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const logger = require('../utils/logger');

// Configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'orquestra_desenvolvimento_seguro_2024';

const authMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('Middleware Auth: Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrai o token do header (formato: "Bearer TOKEN")
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      logger.warn('Middleware Auth: Formato de token inválido', { bearer });
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    logger.debug(`Middleware Auth: Verificando token (primeiros caracteres): ${token.substring(0, 15)}...`);

    // Verifica e decodifica o token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      logger.debug('Middleware Auth: Token decodificado:', { userId: decoded.userId, role: decoded.role });

      // Busca o usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        logger.warn(`Middleware Auth: Usuário ${decoded.userId} não encontrado no banco`);
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      logger.info(`Middleware Auth: Usuário ${user.name} (${user.id}) autenticado com sucesso, role: ${user.role}`);

      // Adiciona o usuário ao objeto da requisição
      req.user = user;

      return next();
    } catch (jwtError) {
      logger.error('Middleware Auth: Erro ao verificar JWT', { 
        error: jwtError.message, 
        name: jwtError.name 
      });
      
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido', error: jwtError.message });
      }
      
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expirado', error: jwtError.message });
      }
      
      throw jwtError; // Rethrow para ser capturado pelo catch externo
    }
  } catch (error) {
    logger.error('Middleware Auth: Erro não tratado', { 
      error: error.message,
      stack: error.stack 
    });
    
    return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

module.exports = authMiddleware; 