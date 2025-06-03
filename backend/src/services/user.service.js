const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async update(id, userData, currentUser) {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Apenas o próprio usuário pode atualizar seus dados
    if (currentUser.id !== id) {
      throw new Error('Não autorizado');
    }

    // Verifica a senha atual
    const isValidPassword = await bcrypt.compare(userData.currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    // Prepara os dados para atualização
    const updateData = {
      name: userData.name,
      email: userData.email,
      updated_at: new Date()
    };

    // Se forneceu nova senha, atualiza
    if (userData.newPassword) {
      updateData.password_hash = await bcrypt.hash(userData.newPassword, 10);
    }

    // Remove campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true
      }
    });

    return updatedUser;
  }

  async delete(id, currentUser) {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Apenas o próprio usuário pode se deletar
    if (currentUser.id !== id) {
      throw new Error('Não autorizado');
    }

    // Deleta o usuário
    await prisma.user.delete({
      where: { id }
    });

    return { message: 'Usuário deletado com sucesso' };
  }
}

module.exports = new UserService(); 