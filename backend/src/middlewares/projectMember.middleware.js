const projectService = require('../services/project.service');

async function isProjectMember(req, res, next) {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;

        const isMember = await projectService.isProjectMember(projectId, userId);
        
        if (!isMember) {
            return res.status(403).json({ error: 'Access denied. User is not a member of this project.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { isProjectMember }; 