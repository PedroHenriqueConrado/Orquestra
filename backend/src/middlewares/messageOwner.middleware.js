const chatService = require('../services/chat.service');

async function isMessageOwner(req, res, next) {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const isOwner = await chatService.isMessageOwner(messageId, userId);
        
        if (!isOwner) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own messages.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { isMessageOwner }; 