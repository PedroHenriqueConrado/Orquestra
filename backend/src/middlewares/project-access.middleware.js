const prisma = require('../prismaClient');
const logger = require('../utils/logger');

async function projectAccessMiddleware(req, res, next) {
    try {
        const projectId = req.params.projectId || req.params.id;
        const userId = req.user.id;

        if (!projectId) {
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
        logger.debug('Acesso ao projeto permitido', { projectId, userId, role: projectMember.role });
        
        next();
    } catch (error) {
        logger.error('Project access middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = projectAccessMiddleware; 