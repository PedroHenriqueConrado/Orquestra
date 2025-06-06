const { ZodError } = require('zod');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const logger = require('../utils/logger');

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
            details: err.errors
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
        switch (err.code) {
            case 'P2002': // Unique constraint violation
                return res.status(409).json({
                    error: 'Registro duplicado',
                    field: err.meta?.target?.[0],
                    code: 'unique_violation'
                });
            case 'P2025': // Record not found
                return res.status(404).json({
                    error: 'Registro não encontrado',
                    code: 'not_found'
                });
            case 'P2003': // Foreign key constraint violation
                return res.status(400).json({
                    error: 'Violação de chave estrangeira',
                    field: err.meta?.field_name,
                    code: 'foreign_key_violation'
                });
            default:
                logger.debug('Erro não tratado do Prisma:', { code: err.code, meta: err.meta });
                return res.status(500).json({
                    error: 'Erro no banco de dados',
                    code: 'database_error'
                });
        }
    }

    // Erros personalizados da aplicação
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code || 'app_error'
        });
    }

    // Erro padrão
    return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'internal_server_error',
        requestId: req.id // Para referência em logs (requer middleware de geração de ID)
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