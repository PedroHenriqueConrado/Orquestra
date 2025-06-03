require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startServer() {
    try {
        // Testar conexão com o banco de dados
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados estabelecida');

        // Iniciar servidor
        app.listen(config.app.port, () => {
            console.log(`✅ Servidor rodando na porta ${config.app.port}`);
            console.log(`📝 Ambiente: ${config.app.env}`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Recebido sinal SIGTERM, encerrando...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Recebido sinal SIGINT, encerrando...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer(); 