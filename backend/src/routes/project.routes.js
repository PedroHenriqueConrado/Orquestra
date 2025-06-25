const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isProjectMember } = require('../middlewares/projectMember.middleware');
const logger = require('../utils/logger');

// Middleware para verificar se o usuário tem permissão para excluir um projeto
const canDeleteProject = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        const userId = req.user.id;
        const userRole = req.user.role;
        
        logger.debug(`Middleware canDeleteProject: Verificando permissão de exclusão para usuário ${userId} (${userRole}) no projeto ${projectId}`);
        
        // Administradores sempre podem excluir projetos
        if (userRole === 'admin') {
            logger.debug(`Middleware canDeleteProject: Usuário ${userId} é administrador, permissão concedida`);
            return next();
        }
        
        // Verificar se o projeto existe
        const projectService = require('../services/project.service');
        const project = await projectService.getProjectById(projectId);
        
        if (!project) {
            logger.warn(`Middleware canDeleteProject: Projeto ${projectId} não encontrado`);
            return res.status(404).json({ 
                error: 'Projeto não encontrado',
                details: `O projeto com ID ${projectId} não existe` 
            });
        }
        
        // Verificar se o usuário é membro do projeto
        const members = await projectService.getProjectMembers(projectId);
        const userMembership = members.find(member => member.user_id === userId);
        
        if (!userMembership) {
            logger.warn(`Middleware canDeleteProject: Usuário ${userId} não é membro do projeto ${projectId}`);
            return res.status(403).json({ 
                error: 'Acesso negado', 
                details: 'Você não tem permissão para excluir este projeto' 
            });
        }
        
        // Verificar se o usuário é o criador do projeto (primeiro project_manager)
        const creator = project.creator;
        if (!creator) {
            logger.warn(`Middleware canDeleteProject: Não foi possível identificar o criador do projeto ${projectId}`);
            return res.status(403).json({ 
                error: 'Acesso negado', 
                details: 'Não foi possível verificar as permissões de exclusão' 
            });
        }
        
        if (creator.id === userId) {
            logger.debug(`Middleware canDeleteProject: Usuário ${userId} é o criador do projeto ${projectId}, permissão concedida`);
            return next();
        }
        
        logger.warn(`Middleware canDeleteProject: Usuário ${userId} não é o criador do projeto ${projectId} (criador: ${creator.id})`);
        return res.status(403).json({ 
            error: 'Acesso negado', 
            details: 'Apenas o criador do projeto pode excluí-lo' 
        });
        
    } catch (error) {
        logger.error('Middleware canDeleteProject: Erro ao verificar permissão de exclusão', {
            error: error.message,
            stack: error.stack,
            params: req.params,
            user: req.user
        });
        
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: 'Ocorreu um erro ao verificar permissão para excluir o projeto'
        });
    }
};

// Todas as rotas requerem autenticação
router.use(authenticate);

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        logger.debug(`Middleware isAdmin: Usuário ${req.user.id} é administrador, permissão concedida`);
        return next();
    }
    logger.warn(`Middleware isAdmin: Usuário ${req.user.id} não é administrador, permissão negada`);
    return res.status(403).json({ 
        error: 'Acesso negado', 
        details: 'Esta ação requer privilégios de administrador' 
    });
};

// Rotas básicas de CRUD
router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.get('/:projectId', isProjectMember, projectController.getById);
router.put('/:projectId', isProjectMember, projectController.update);
router.delete('/:projectId', canDeleteProject, projectController.delete);

// Rota administrativa para forçar a exclusão de qualquer projeto (só para administradores)
router.delete('/:projectId/force', isAdmin, projectController.delete);

// Rotas de gerenciamento de membros
router.get('/:projectId/members', isProjectMember, projectController.getMembers);
router.post('/:projectId/members', isProjectMember, projectController.addMember);
router.delete('/:projectId/members/:userId', isProjectMember, projectController.removeMember);

module.exports = router; 