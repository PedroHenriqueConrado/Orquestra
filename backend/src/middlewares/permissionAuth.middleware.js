/**
 * Middleware para verificar permissões específicas
 * @param {string|string[]} requiredPermissions - Permissão ou array de permissões necessárias
 * @param {string} checkType - Tipo de verificação: 'any' (pelo menos uma) ou 'all' (todas)
 */
const { hasPermission, hasAnyPermission, hasAllPermissions } = require('../utils/permissions');

const permissionAuth = (requiredPermissions, checkType = 'any') => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          message: 'Usuário não autenticado'
        });
      }

      // Converter para array se for string única
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      let hasAccess = false;

      if (checkType === 'all') {
        hasAccess = hasAllPermissions(userRole, permissions);
      } else {
        hasAccess = hasAnyPermission(userRole, permissions);
      }

      if (!hasAccess) {
        return res.status(403).json({
          message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          requiredPermissions: permissions,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de permissões:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar permissões' 
      });
    }
  };
};

/**
 * Middleware para verificar se usuário pode editar recurso específico
 * @param {string} permission - Permissão para editar qualquer recurso
 * @param {function} getResourceUserId - Função para obter ID do usuário do recurso
 */
const resourceEditAuth = (permission, getResourceUserId) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      const currentUserId = req.user?.id;
      
      if (!userRole || !currentUserId) {
        return res.status(401).json({
          message: 'Usuário não autenticado'
        });
      }

      // Obter ID do usuário que criou o recurso
      const resourceUserId = getResourceUserId(req);
      
      if (resourceUserId === currentUserId) {
        // Se é o próprio usuário, pode editar
        return next();
      }

      // Verificar se tem permissão para editar qualquer recurso
      if (hasPermission(userRole, permission)) {
        return next();
      }

      return res.status(403).json({
        message: 'Acesso negado. Você não tem permissão para editar este recurso.'
      });

    } catch (error) {
      console.error('Erro no middleware de edição de recurso:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar permissões' 
      });
    }
  };
};

module.exports = {
  permissionAuth,
  resourceEditAuth
}; 