const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Importação das rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const directChatRoutes = require('./routes/direct-chat.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middlewares básicos
app.use(helmet()); // Segurança
app.use(compression(config.app.compression)); // Compressão com configurações
app.use(express.json({ limit: '10mb' })); // Parser JSON com limite
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL-encoded com limite

// Rate Limiting
const limiter = rateLimit(config.app.rateLimit);
app.use(limiter);

// CORS
app.use(cors({
    origin: config.app.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Logging
if (config.app.env === 'development') {
    app.use(morgan('dev', {
        stream: {
            write: (message) => logger.debug(message.trim())
        }
    }));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/direct-messages', directChatRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota para favicon.ico (evita erro 404)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        code: 'not_found'
    });
});

// Middleware de erro (deve ser o último middleware)
app.use((err, req, res, next) => errorHandler(err, req, res, next));

// Função para iniciar o servidor
function startServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(config.app.port, () => {
            logger.info(`Servidor rodando na porta ${config.app.port}`);
            logger.info(`Ambiente: ${config.app.env}`);
            resolve(server);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`Porta ${config.app.port} já está em uso. Tentando encerrar o processo...`);
                // Aqui você pode adicionar lógica para tentar encerrar o processo
                reject(err);
            } else {
                logger.error('Erro ao iniciar o servidor:', err);
                reject(err);
            }
        });
    });
}

// Exporta tanto o app quanto a função de inicialização
module.exports = {
    app,
    startServer
}; 