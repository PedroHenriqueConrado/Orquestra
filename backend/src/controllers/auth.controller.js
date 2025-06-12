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

  // Rota para atualizar a imagem de perfil - Temporariamente desativada
  async updateProfileImage(req, res) {
    return res.status(503).json({ message: 'Funcionalidade temporariamente indisponível' });
  }

  // Rota para obter a imagem de perfil - Temporariamente desativada
  async getProfileImage(req, res) {
    return res.status(503).json({ message: 'Funcionalidade temporariamente indisponível' });
  }

  // Rota para remover a imagem de perfil - Temporariamente desativada
  async deleteProfileImage(req, res) {
    return res.status(503).json({ message: 'Funcionalidade temporariamente indisponível' });
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      await authService.deleteAccount(userId);
      res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      res.status(500).json({ message: 'Erro ao excluir conta' });
    }
  }
}

module.exports = new AuthController(); 