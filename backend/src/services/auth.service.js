const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const config = require('../config');

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

  async login(credentials) {
    const { email, password } = credentials;
    
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
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
      { id: user.id, email: user.email, role: user.role },
      config.app.jwtSecret,
      { expiresIn: config.app.jwtExpiration }
    );

    // Remove a senha do objeto do usuário
    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
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

  async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
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

    return { message: 'Senha alterada com sucesso' };
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