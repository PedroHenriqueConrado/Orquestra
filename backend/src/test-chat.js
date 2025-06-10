const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChatFunctionality() {
  try {
    console.log('Iniciando teste de funcionalidade do chat...');
    
    // 1. Verificar se a tabela ChatMessage existe
    try {
      const chatCount = await prisma.chatMessage.count();
      console.log(`Tabela ChatMessage existe e contém ${chatCount} mensagens`);
    } catch (error) {
      console.error('Erro ao acessar a tabela ChatMessage:', error.message);
      return;
    }
    
    // 2. Verificar projetos existentes
    const projects = await prisma.project.findMany({
      take: 5,
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (projects.length === 0) {
      console.error('Nenhum projeto encontrado para testar o chat');
      return;
    }
    
    console.log(`Encontrados ${projects.length} projetos`);
    
    // Usar o primeiro projeto para teste
    const testProject = projects[0];
    console.log(`Usando projeto para teste: ${testProject.id} - ${testProject.name}`);
    
    if (testProject.members.length === 0) {
      console.error('O projeto não tem membros para testar o chat');
      return;
    }
    
    // Usar o primeiro membro do projeto
    const testUser = testProject.members[0].user;
    console.log(`Usando usuário para teste: ${testUser.id} - ${testUser.name}`);
    
    // 3. Criar uma mensagem de teste
    const testMessage = await prisma.chatMessage.create({
      data: {
        project_id: testProject.id,
        user_id: testUser.id,
        message: 'Esta é uma mensagem de teste do chat'
      },
      include: {
        user: true
      }
    });
    
    console.log('Mensagem criada com sucesso:', testMessage);
    
    // 4. Verificar se a mensagem foi criada corretamente
    const retrievedMessage = await prisma.chatMessage.findUnique({
      where: {
        id: testMessage.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Mensagem recuperada:', retrievedMessage);
    
    // 5. Deletar a mensagem de teste para limpar
    await prisma.chatMessage.delete({
      where: {
        id: testMessage.id
      }
    });
    
    console.log('Mensagem de teste excluída com sucesso');
    console.log('Teste de chat concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro durante o teste de chat:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatFunctionality(); 