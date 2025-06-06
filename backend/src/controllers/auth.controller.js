const authService = require('../services/auth.service');
const { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } = require('../schemas/auth.schema');
const profileService = require('../services/profile.service');
const multer = require('multer');
const upload = multer();

class AuthController {
  async register(req, res) {
    try {
      console.log('Dados recebidos:', req.body);
      
      // Valida os dados de entrada
      const validatedData = registerSchema.parse(req.body);
      console.log('Dados validados:', validatedData);
      
      // Remove a confirmação de senha antes de passar para o serviço
      const { confirmPassword, ...userData } = validatedData;
      
      // Registra o usuário
      const user = await authService.register(userData);
      console.log('Usuário criado:', user);
      
      return res.status(201).json(user);
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors || error.issues
        });
      }
      
      if (error.message === 'Email já cadastrado') {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      console.log('Dados de login recebidos:', req.body);
      
      // Valida os dados de entrada
      const validatedData = loginSchema.parse(req.body);
      console.log('Dados de login validados:', validatedData);
      
      // Realiza o login
      const result = await authService.login(validatedData.email, validatedData.password);
      console.log('Login realizado com sucesso');
      
      return res.json(result);
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors || error.issues
        });
      }
      
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ message: error.message });
      }
      
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Remove informações sensíveis
      const { password_hash, ...userProfile } = user;
      
      res.json(userProfile);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ message: 'Erro ao obter perfil' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { error } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const userId = req.user.id;
      const { name } = req.body;

      await authService.updateProfile(userId, { name });
      res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  }

  async updatePassword(req, res) {
    try {
      const { error } = updatePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      await authService.updatePassword(userId, currentPassword, newPassword);
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      if (error.message === 'Senha atual incorreta') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
  }

  // Rota para atualizar a imagem de perfil
  async updateProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma imagem enviada' });
      }

      const userId = req.user.id;
      const imageData = req.file.buffer;
      const mimeType = req.file.mimetype;

      await profileService.saveProfileImage(userId, imageData, mimeType);

      res.json({ message: 'Imagem de perfil atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      res.status(500).json({ message: 'Erro ao atualizar imagem de perfil' });
    }
  }

  // Rota para obter a imagem de perfil
  async getProfileImage(req, res) {
    try {
      const userId = req.user.id;
      const image = await profileService.getProfileImage(userId);

      if (!image) {
        return res.status(404).json({ message: 'Imagem de perfil não encontrada' });
      }

      res.set('Content-Type', image.mimeType);
      res.send(image.imageData);
    } catch (error) {
      console.error('Erro ao obter imagem de perfil:', error);
      res.status(500).json({ message: 'Erro ao obter imagem de perfil' });
    }
  }

  // Rota para remover a imagem de perfil
  async deleteProfileImage(req, res) {
    try {
      const userId = req.user.id;
      await profileService.deleteProfileImage(userId);
      res.json({ message: 'Imagem de perfil removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover imagem de perfil:', error);
      res.status(500).json({ message: 'Erro ao remover imagem de perfil' });
    }
  }
}

module.exports = new AuthController(); 