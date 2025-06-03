const { ZodError } = require('zod');
const { JsonWebTokenError } = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

function errorHandler(err, req, res, next) {
    console.error(err);

    // Erros de validação do Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.errors
        });
    }

    // Erros de JWT
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            error: 'Token inválido ou expirado'
        });
    }

    // Erros do Prisma
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint violation
                return res.status(409).json({
                    error: 'Registro duplicado',
                    field: err.meta?.target?.[0]
                });
            case 'P2025': // Record not found
                return res.status(404).json({
                    error: 'Registro não encontrado'
                });
            default:
                return res.status(500).json({
                    error: 'Erro no banco de dados'
                });
        }
    }

    // Erros personalizados da aplicação
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    // Erro padrão
    return res.status(500).json({
        error: 'Erro interno do servidor'
    });
}

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = {
    errorHandler,
    AppError
}; 