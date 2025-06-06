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
      where: { email: userData.email }
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
      where: { email }
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

  async updateProfile(userId, userData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        profile_image: userData.profileImage
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_image: true,
        created_at: true
      }
    });

    return user;
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
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
}

module.exports = new AuthService(); 