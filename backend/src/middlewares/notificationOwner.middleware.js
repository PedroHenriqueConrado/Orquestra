const notificationService = require('../services/notification.service');

async function isNotificationOwner(req, res, next) {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const isOwner = await notificationService.isNotificationOwner(notificationId, userId);
        
        if (!isOwner) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode modificar suas próprias notificações.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = { isNotificationOwner }; 