const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

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
}

module.exports = new AuthController(); 