const { PrismaClient } = require('@prisma/client');

// Se DATABASE_URL não estiver definido, use uma string de conexão padrão
const connectionString = process.env.DATABASE_URL || 'mysql://root:admin123@localhost:3306/orquestra';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

module.exports = prisma; 