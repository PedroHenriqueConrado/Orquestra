const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('express-async-errors');

const config = require('./config');
const { errorHandler } = require('./middlewares/error.middleware');
const requestIdMiddleware = require('./middlewares/request-id.middleware');
const routes = require('./routes');

const app = express();

// Request ID para rastreamento de requisições
app.use(requestIdMiddleware);

// Middlewares de segurança
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (config.app.env !== 'test') {
    // Formato personalizado para mostrar mais detalhes em desenvolvimento
    if (config.app.env === 'development') {
        app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :req[content-type] - :req[authorization]'));
        // Log de corpo da requisição em rotas específicas
        app.use((req, res, next) => {
            if (req.method === 'POST' || req.method === 'PUT') {
                console.log('Corpo da requisição:', JSON.stringify(req.body, null, 2));
            }
            next();
        });
    } else {
        app.use(morgan('combined'));
    }
}

// Parse de JSON e uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rotas da API
app.use('/api', routes);

// Tratamento de rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros
app.use(errorHandler);

module.exports = app; 