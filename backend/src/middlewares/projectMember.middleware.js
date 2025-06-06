const projectService = require('../services/project.service');
const logger = require('../utils/logger');

async function isProjectMember(req, res, next) {
    try {
        logger.debug('Middleware isProjectMember: Parâmetros recebidos:', req.params);
        
        const projectId = parseInt(req.params.projectId, 10);
        const userId = req.user.id;
        
        logger.debug(`Middleware isProjectMember: Verificando se usuário ${userId} é membro do projeto ${projectId}`);
        
        if (isNaN(projectId)) {
            logger.warn(`Middleware isProjectMember: ID de projeto inválido: ${req.params.projectId}`);
            return res.status(400).json({ 
                error: 'ID de projeto inválido', 
                details: 'O ID do projeto deve ser um número válido' 
            });
        }
        
        // Verifica se o projeto existe
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            logger.warn(`Middleware isProjectMember: Projeto ${projectId} não encontrado`);
            return res.status(404).json({ 
                error: 'Projeto não encontrado',
                details: `O projeto com ID ${projectId} não existe` 
            });
        }
        
        const isMember = await projectService.isProjectMember(projectId, userId);
        
        if (!isMember) {
            logger.warn(`Middleware isProjectMember: Usuário ${userId} não é membro do projeto ${projectId}`);
            return res.status(403).json({ 
                error: 'Acesso negado', 
                details: 'Você não tem permissão para acessar este projeto' 
            });
        }
        
        logger.debug(`Middleware isProjectMember: Usuário ${userId} confirmado como membro do projeto ${projectId}`);
        next();
    } catch (error) {
        logger.error('Middleware isProjectMember: Erro ao verificar membro do projeto', {
            error: error.message,
            stack: error.stack,
            params: req.params,
            user: req.user
        });
        
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: 'Ocorreu um erro ao verificar o acesso ao projeto'
        });
    }
}

module.exports = { isProjectMember }; 