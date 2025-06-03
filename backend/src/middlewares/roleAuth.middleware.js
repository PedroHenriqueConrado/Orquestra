/**
 * Middleware para verificar se o usuário tem os cargos necessários
 * @param {string[]} allowedRoles - Array com os cargos permitidos
 */
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
  };
};

module.exports = roleAuth; 