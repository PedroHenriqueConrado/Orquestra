const prisma = require('../prismaClient');

async function projectAccessMiddleware(req, res, next) {
    try {
        const projectId = req.params.projectId;
        const userId = req.user.id;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // Verificar se o usuário é membro do projeto
        const projectMember = await prisma.projectMember.findFirst({
            where: {
                projectId: projectId,
                userId: userId
            }
        });

        if (!projectMember) {
            return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
        }

        // Adicionar informações do projeto e do membro à requisição
        req.projectMember = projectMember;
        
        next();
    } catch (error) {
        console.error('Project access middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = projectAccessMiddleware; 