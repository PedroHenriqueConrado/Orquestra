const { Task, User, Project } = require('../models');
const { Op } = require('sequelize');

// Obter todas as tarefas
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao buscar tarefas',
      error: error.message
    });
  }
};

// Obter uma tarefa pelo ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: Task,
          as: 'parentTask',
          attributes: ['id', 'title']
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    return res.status(200).json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao buscar tarefa',
      error: error.message
    });
  }
};

// Obter tarefas de um projeto
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas do projeto:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao buscar tarefas do projeto',
      error: error.message
    });
  }
};

// Criar uma nova tarefa
exports.createTask = async (req, res) => {
  try {
    const { 
      title, description, status, priority, assigned_to, 
      due_date, estimated_hours, actual_hours, parent_task_id, project_id 
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({ message: 'Título da tarefa é obrigatório' });
    }
    
    if (!project_id) {
      return res.status(400).json({ message: 'ID do projeto é obrigatório' });
    }
    
    // Verificar se o projeto existe
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    
    // Verificar se o usuário atribuído existe, se fornecido
    if (assigned_to) {
      const user = await User.findByPk(assigned_to);
      if (!user) {
        return res.status(404).json({ message: 'Usuário atribuído não encontrado' });
      }
    }
    
    // Verificar se a tarefa pai existe, se fornecida
    if (parent_task_id) {
      const parentTask = await Task.findByPk(parent_task_id);
      if (!parentTask) {
        return res.status(404).json({ message: 'Tarefa pai não encontrada' });
      }
      
      // Verificar se a tarefa pai pertence ao mesmo projeto
      if (parentTask.project_id !== project_id) {
        return res.status(400).json({ message: 'Tarefa pai deve pertencer ao mesmo projeto' });
      }
    }
    
    // Criar a nova tarefa
    const newTask = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      assigned_to,
      due_date,
      estimated_hours,
      actual_hours,
      parent_task_id,
      project_id
    });
    
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao criar tarefa',
      error: error.message
    });
  }
};

// Atualizar uma tarefa
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, status, priority, assigned_to, 
      due_date, estimated_hours, actual_hours, parent_task_id 
    } = req.body;
    
    // Buscar a tarefa pelo ID
    const task = await Task.findByPk(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Verificar se o usuário atribuído existe, se fornecido
    if (assigned_to) {
      const user = await User.findByPk(assigned_to);
      if (!user) {
        return res.status(404).json({ message: 'Usuário atribuído não encontrado' });
      }
    }
    
    // Verificar se a tarefa pai existe, se fornecida
    if (parent_task_id) {
      // Não permitir que uma tarefa seja pai dela mesma
      if (parseInt(parent_task_id) === parseInt(id)) {
        return res.status(400).json({ message: 'Uma tarefa não pode ser pai dela mesma' });
      }
      
      const parentTask = await Task.findByPk(parent_task_id);
      if (!parentTask) {
        return res.status(404).json({ message: 'Tarefa pai não encontrada' });
      }
      
      // Verificar se a tarefa pai pertence ao mesmo projeto
      if (parentTask.project_id !== task.project_id) {
        return res.status(400).json({ message: 'Tarefa pai deve pertencer ao mesmo projeto' });
      }
    }
    
    // Atualizar os campos da tarefa
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigned_to !== undefined) task.assigned_to = assigned_to;
    if (due_date !== undefined) task.due_date = due_date;
    if (estimated_hours !== undefined) task.estimated_hours = estimated_hours;
    if (actual_hours !== undefined) task.actual_hours = actual_hours;
    if (parent_task_id !== undefined) task.parent_task_id = parent_task_id;
    
    // Salvar as alterações
    await task.save();
    
    // Retornar a tarefa atualizada
    return res.status(200).json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao atualizar tarefa',
      error: error.message
    });
  }
};

// Excluir uma tarefa
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar a tarefa pelo ID
    const task = await Task.findByPk(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Verificar se existem tarefas filhas
    const childTasks = await Task.findAll({
      where: { parent_task_id: id }
    });
    
    if (childTasks.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir esta tarefa porque ela possui subtarefas. Exclua as subtarefas primeiro.'
      });
    }
    
    // Excluir a tarefa
    await task.destroy();
    
    return res.status(200).json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao excluir tarefa',
      error: error.message
    });
  }
};

// Atualizar o status e posição de uma tarefa
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;
    
    // Validar os dados recebidos
    if (!id) {
      return res.status(400).json({ message: 'ID da tarefa é obrigatório' });
    }
    
    if (!status) {
      return res.status(400).json({ message: 'Status é obrigatório' });
    }
    
    // Verificar se o status é válido
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Status inválido. Use: pending, in_progress ou completed' 
      });
    }
    
    // Buscar a tarefa pelo ID
    const task = await Task.findByPk(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Atualizar o status da tarefa
    task.status = status;
    
    // Se a posição foi informada, atualizar também
    if (position !== undefined) {
      // Lógica para reordenar as tarefas
      // Isso poderia envolver atualizar uma coluna de ordem/posição no banco de dados
      // Por enquanto, apenas registraremos a posição solicitada
      console.log(`Tarefa ${id} movida para a posição ${position} no status ${status}`);
      
      // Aqui você implementaria a lógica real de reordenação
      // Por exemplo:
      // await reorderTasks(task.project_id, status, id, position);
    }
    
    // Salvar as alterações
    await task.save();
    
    // Retornar a tarefa atualizada
    return res.status(200).json(task);
    
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor ao atualizar status da tarefa',
      error: error.message
    });
  }
}; 