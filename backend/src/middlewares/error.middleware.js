const { ZodError } = require('zod');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const logger = require('../utils/logger');

/**
 * Middleware de tratamento de erros
 * @param {Error} err - O erro que ocorreu
 * @param {Request} req - Objeto da requisição
 * @param {Response} res - Objeto da resposta
 * @param {NextFunction} next - Função next do Express
 */
function errorHandler(err, req, res, next) {
    // Log com detalhes da requisição que gerou o erro
    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id
    };
    
    logger.error(`Erro na requisição: ${req.method} ${req.originalUrl}`, {
        error: err,
        request: requestInfo,
        stack: err.stack
    });

    // Erros de validação do Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Erro de validação',
            code: 'validation_error',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Erros de JWT
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            error: 'Token expirado',
            code: 'token_expired'
        });
    }
    
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            error: 'Token inválido',
            code: 'invalid_token'
        });
    }

    // Erros do Prisma
    if (err instanceof PrismaClientKnownRequestError) {
        // Erro de registro não encontrado
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Registro não encontrado',
                code: 'not_found'
            });
        }

        // Erro de violação de chave única
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Conflito de dados',
                code: 'unique_violation',
                field: err.meta?.target?.[0]
            });
        }

        // Outros erros do Prisma
        return res.status(400).json({
            error: 'Erro no banco de dados',
            code: 'database_error'
        });
    }

    // Erros de negócio (lançados com throw new Error)
    if (err.message) {
        return res.status(400).json({
            error: err.message,
            code: 'business_error'
        });
    }

    // Erro interno não tratado
    return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'internal_error'
    });
}

class AppError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code; // Código de erro para o cliente
    }
}

module.exports = {
    errorHandler,
    AppError
}; 