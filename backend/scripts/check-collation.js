const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixCollation() {
    try {
        console.log('🔍 Verificando collation das colunas de busca...\n');

        // Verificar collation atual das colunas
        const collationInfo = await prisma.$queryRaw`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                COLLATION_NAME,
                DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'orquestra' 
            AND TABLE_NAME IN ('projects', 'tasks', 'documents')
            AND COLUMN_NAME IN ('name', 'title', 'description')
            ORDER BY TABLE_NAME, COLUMN_NAME
        `;

        console.log('📋 Collation atual das colunas:');
        console.table(collationInfo);

        // Verificar se alguma coluna precisa de ajuste
        const needsFix = collationInfo.some(col => 
            !col.COLLATION_NAME || 
            !col.COLLATION_NAME.includes('_ci')
        );

        if (needsFix) {
            console.log('\n⚠️  Algumas colunas podem não ter busca insensível a maiúsculas/minúsculas.');
            console.log('💡 Para garantir busca insensível, execute os seguintes comandos SQL:\n');
            
            console.log('-- Ajustar collation da tabela projects');
            console.log('ALTER TABLE projects MODIFY name VARCHAR(150) COLLATE utf8mb4_unicode_ci;');
            console.log('ALTER TABLE projects MODIFY description TEXT COLLATE utf8mb4_unicode_ci;\n');
            
            console.log('-- Ajustar collation da tabela tasks');
            console.log('ALTER TABLE tasks MODIFY title VARCHAR(200) COLLATE utf8mb4_unicode_ci;');
            console.log('ALTER TABLE tasks MODIFY description TEXT COLLATE utf8mb4_unicode_ci;\n');
            
            console.log('-- Ajustar collation da tabela documents');
            console.log('ALTER TABLE documents MODIFY title VARCHAR(200) COLLATE utf8mb4_unicode_ci;\n');
            
            console.log('🔧 Execute esses comandos no seu banco MySQL para garantir busca insensível.');
        } else {
            console.log('\n✅ Todas as colunas já estão com collation insensível a maiúsculas/minúsculas!');
        }

        // Testar busca simples
        console.log('\n🧪 Testando busca simples...');
        const testProjects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: 'test' } },
                    { description: { contains: 'test' } }
                ]
            },
            take: 3,
            select: {
                id: true,
                name: true,
                description: true
            }
        });

        console.log(`✅ Busca funcionando! Encontrados ${testProjects.length} projetos com "test"`);
        if (testProjects.length > 0) {
            console.log('📝 Exemplos encontrados:');
            testProjects.forEach(project => {
                console.log(`   - ${project.name} (ID: ${project.id})`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao verificar collation:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    checkAndFixCollation();
}

module.exports = { checkAndFixCollation }; 