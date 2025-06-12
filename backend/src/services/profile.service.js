const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');

class ProfileService {
  async saveProfileImage(userId, imageData, mimeType) {
    try {
      // Funcionalidade temporariamente desativada
      console.log('Funcionalidade de imagem de perfil temporariamente desativada');
      throw new Error('Funcionalidade de imagem de perfil temporariamente desativada');
    } catch (error) {
      console.error('Erro ao salvar imagem de perfil:', error);
      throw error;
    }
  }

  async getProfileImage(userId) {
    try {
      // Funcionalidade temporariamente desativada
      console.log('Funcionalidade de imagem de perfil temporariamente desativada');
      return null;
    } catch (error) {
      console.error('Erro ao obter imagem de perfil:', error);
      throw error;
    }
  }

  async deleteProfileImage(userId) {
    try {
      // Funcionalidade temporariamente desativada
      console.log('Funcionalidade de imagem de perfil temporariamente desativada');
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem de perfil:', error);
      throw error;
    }
  }

  getMimeType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

module.exports = new ProfileService(); 