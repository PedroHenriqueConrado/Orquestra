const taskService = require('../services/task.service');

async function isTaskInProject(req, res, next) {
    try {
        const { projectId, taskId } = req.params;
        
        if (!taskId) {
            return next();
        }

        const exists = await taskService.isTaskInProject(taskId, projectId);
        
        if (!exists) {
            return res.status(404).json({ error: 'Task not found in this project' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { isTaskInProject }; 