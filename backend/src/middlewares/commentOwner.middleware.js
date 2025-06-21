const taskCommentService = require('../services/task-comment.service');

async function isCommentOwner(req, res, next) {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await taskCommentService.getCommentById(commentId);
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own comments.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { isCommentOwner }; 