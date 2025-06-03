const userService = require('../services/user.service');
const { updateUserSchema } = require('../schemas/user.schema');

class UserController {
  async findAll(req, res) {
    try {
      const users = await userService.findAll();
      return res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.findById(Number(id));
      return res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      
      const updatedUser = await userService.update(
        Number(id),
        validatedData,
        req.user
      );
      
      return res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Não autorizado') {
        return res.status(403).json({ message: error.message });
      }
      
      if (error.message === 'Senha atual incorreta') {
        return res.status(401).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await userService.delete(Number(id), req.user);
      return res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Não autorizado') {
        return res.status(403).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UserController(); 