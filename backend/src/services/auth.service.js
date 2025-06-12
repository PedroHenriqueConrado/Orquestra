const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Configurações padrão para JWT se não estiverem definidas nas variáveis de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'orquestra_desenvolvimento_seguro_2024';
// Aumentando o tempo de expiração do token para 30 dias (720 horas)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

class AuthService {
  async register(userData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
      select: {
        id: true,
        email: true
      }
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role || 'developer'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    return user;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId, userData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    return user;
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password_hash: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword
      }
    });

    return { message: 'Senha atualizada com sucesso' };
  }

  async deleteAccount(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Inicia uma transação para garantir a integridade dos dados
    return await prisma.$transaction(async (prisma) => {
      // Remove todas as mensagens do usuário
      await prisma.chatMessage.deleteMany({
        where: { user_id: userId }
      });

      // Remove todas as notificações do usuário
      await prisma.notification.deleteMany({
        where: { user_id: userId }
      });

      // Remove todas as associações do usuário com projetos
      await prisma.projectMember.deleteMany({
        where: { user_id: userId }
      });

      // Remove todas as tarefas atribuídas ao usuário
      await prisma.task.updateMany({
        where: { assigned_to: userId },
        data: { assigned_to: null }
      });

      // Por fim, remove o usuário
      await prisma.user.delete({
        where: { id: userId }
      });

      return { message: 'Conta excluída com sucesso' };
    });
  }
}

module.exports = new AuthService(); 