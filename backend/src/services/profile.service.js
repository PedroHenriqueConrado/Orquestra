const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');

class ProfileService {
  async saveProfileImage(userId, imageData, mimeType) {
    try {
      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Cria o diretório de uploads se não existir
      const uploadDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Gera um nome único para o arquivo
      const fileName = `profile_${userId}_${Date.now()}.${mimeType.split('/')[1]}`;
      const filePath = path.join(uploadDir, fileName);

      // Salva a imagem no sistema de arquivos
      await fs.writeFile(filePath, imageData);

      // Atualiza o caminho da imagem no banco de dados
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: fileName }
      });

      return { fileName };
    } catch (error) {
      console.error('Erro ao salvar imagem de perfil:', error);
      throw error;
    }
  }

  async getProfileImage(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true }
      });

      if (!user || !user.profileImage) {
        return null;
      }

      const filePath = path.join(__dirname, '../../uploads', user.profileImage);
      
      try {
        const imageData = await fs.readFile(filePath);
        const mimeType = this.getMimeType(user.profileImage);
        
        return {
          imageData,
          mimeType
        };
      } catch (error) {
        console.error('Erro ao ler arquivo de imagem:', error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter imagem de perfil:', error);
      throw error;
    }
  }

  async deleteProfileImage(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true }
      });

      if (user && user.profileImage) {
        const filePath = path.join(__dirname, '../../uploads', user.profileImage);
        
        // Remove o arquivo se existir
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Erro ao deletar arquivo:', error);
        }

        // Atualiza o banco de dados
        await prisma.user.update({
          where: { id: userId },
          data: { profileImage: null }
        });
      }

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