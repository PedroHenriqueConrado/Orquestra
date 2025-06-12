require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        jwtSecret: process.env.JWT_SECRET || 'orquestra_desenvolvimento_seguro_2024',
        jwtExpiration: process.env.JWT_EXPIRATION || '30d',
        corsOrigin: process.env.CORS_ORIGIN || '*',
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100 // limite de 100 requisições por windowMs
        },
        compression: {
            level: 6, // nível de compressão (0-9)
            threshold: 1024 // comprimir apenas respostas maiores que 1KB
        }
    },
    upload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        compressThreshold: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed'
        ]
    },
    database: {
        url: process.env.DATABASE_URL,
        pool: {
            min: 2,
            max: 10
        }
    },
    security: {
        bcryptRounds: 10,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
        passwordMinLength: 6,
        passwordMaxLength: 50
    }
}; 