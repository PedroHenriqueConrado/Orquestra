require('dotenv').config();
const { startServer } = require('./app');
const logger = require('./utils/logger');
const prisma = require('./prismaClient');

async function main() {
    try {
        // Testa a conexão com o banco de dados
        await prisma.$connect();
        logger.info('✅ Conexão com o banco de dados estabelecida');

        // Inicia o servidor
        const server = await startServer();

        // Tratamento de encerramento gracioso
        process.on('SIGTERM', () => {
            logger.info('SIGTERM recebido. Encerrando servidor...');
            server.close(() => {
                logger.info('Servidor encerrado');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT recebido. Encerrando servidor...');
            server.close(() => {
                logger.info('Servidor encerrado');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('❌ Erro ao iniciar a aplicação:', error);
        process.exit(1);
    }
}

main(); 