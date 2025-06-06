const prisma = require('../prismaClient');
const logger = require('../utils/logger');

async function projectAccessMiddleware(req, res, next) {
    try {
        logger.debug('Project access middleware: verificando parâmetros', {
            params: req.params,
            baseUrl: req.baseUrl,
            originalUrl: req.originalUrl
        });
        
        let projectId = req.params.projectId;
        
        // Se não temos projectId nos parâmetros, mas temos um ID na rota base
        if (!projectId && req.baseUrl) {
            // Extrai o ID do projeto da URL base
            const match = req.baseUrl.match(/\/projects\/(\d+)/);
            if (match && match[1]) {
                projectId = match[1];
                logger.debug(`Project access middleware: Extraído projectId ${projectId} da URL base`);
            }
        }
        
        const userId = req.user.id;

        if (!projectId) {
            logger.warn('Project access middleware: ID do projeto não encontrado na requisição');
            return res.status(400).json({ error: 'Project ID is required' });
        }

        logger.debug('Verificando acesso ao projeto', { projectId, userId });

        // Verificar se o usuário é membro do projeto
        const projectMember = await prisma.projectMember.findFirst({
            where: {
                project_id: parseInt(projectId),
                user_id: parseInt(userId)
            }
        });

        if (!projectMember) {
            logger.warn('Acesso negado ao projeto', { projectId, userId });
            return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
        }

        // Adicionar informações do projeto e do membro à requisição
        req.projectMember = projectMember;
        
        // Garantir que projectId esteja nos parâmetros para outros middlewares
        req.params.projectId = projectId;
        
        logger.debug('Acesso ao projeto permitido', { projectId, userId, role: projectMember.role });
        
        next();
    } catch (error) {
        logger.error('Project access middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = projectAccessMiddleware; 