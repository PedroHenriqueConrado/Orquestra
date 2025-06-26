/**
 * Sistema de Permissões do Orquestra
 * Baseado na hierarquia: developer < supervisor < tutor < team_leader < project_manager < admin
 */

// Definição das permissões por cargo
const ROLE_PERMISSIONS = {
  developer: {
    // PROJETOS
    'projects:view': true,
    'projects:create': false,
    'projects:edit': false,
    'projects:delete': false,
    'projects:add_members': false,
    'projects:remove_members': false,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': true,
    'tasks:edit_own': true,
    'tasks:edit_any': false,
    'tasks:delete': false,
    'tasks:update_status': true,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': false,
    'comments:delete_own': true,
    'comments:delete_any': false,
    'comments:rate': false,
    
    // DOCUMENTOS
    'documents:upload': true,
    'documents:download': true,
    'documents:delete': false,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': false,
    'templates:manage': false,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': false,
    
    // SISTEMA
    'system:manage_users': false,
    'system:settings': false
  },
  
  supervisor: {
    // PROJETOS
    'projects:view': true,
    'projects:create': false,
    'projects:edit': false,
    'projects:delete': false,
    'projects:add_members': false,
    'projects:remove_members': false,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': true,
    'tasks:edit_own': true,
    'tasks:edit_any': true,
    'tasks:delete': false,
    'tasks:update_status': true,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': false,
    'comments:delete_own': true,
    'comments:delete_any': false,
    'comments:rate': false,
    
    // DOCUMENTOS
    'documents:upload': true,
    'documents:download': true,
    'documents:delete': false,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': false,
    'templates:manage': false,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': false,
    
    // SISTEMA
    'system:manage_users': false,
    'system:settings': false
  },
  
  tutor: {
    // PROJETOS
    'projects:view': true,
    'projects:create': false,
    'projects:edit': false,
    'projects:delete': false,
    'projects:add_members': false,
    'projects:remove_members': false,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': false,
    'tasks:edit_own': false,
    'tasks:edit_any': false,
    'tasks:delete': false,
    'tasks:update_status': false,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': false,
    'comments:delete_own': true,
    'comments:delete_any': false,
    'comments:rate': true,
    
    // DOCUMENTOS
    'documents:upload': false,
    'documents:download': true,
    'documents:delete': false,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': false,
    'templates:manage': false,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': false,
    
    // SISTEMA
    'system:manage_users': false,
    'system:settings': false
  },
  
  team_leader: {
    // PROJETOS
    'projects:view': true,
    'projects:create': true,
    'projects:edit': true,
    'projects:delete': false,
    'projects:add_members': true,
    'projects:remove_members': false,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': true,
    'tasks:edit_own': true,
    'tasks:edit_any': true,
    'tasks:delete': true,
    'tasks:update_status': true,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': false,
    'comments:delete_own': true,
    'comments:delete_any': false,
    'comments:rate': false,
    
    // DOCUMENTOS
    'documents:upload': true,
    'documents:download': true,
    'documents:delete': true,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': true,
    'templates:manage': false,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': false,
    
    // SISTEMA
    'system:manage_users': false,
    'system:settings': false
  },
  
  project_manager: {
    // PROJETOS
    'projects:view': true,
    'projects:create': true,
    'projects:edit': true,
    'projects:delete': true,
    'projects:add_members': true,
    'projects:remove_members': true,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': true,
    'tasks:edit_own': true,
    'tasks:edit_any': true,
    'tasks:delete': true,
    'tasks:update_status': true,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': true,
    'comments:delete_own': true,
    'comments:delete_any': true,
    'comments:rate': true,
    
    // DOCUMENTOS
    'documents:upload': true,
    'documents:download': true,
    'documents:delete': true,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': true,
    'templates:manage': true,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': true,
    
    // SISTEMA
    'system:manage_users': false,
    'system:settings': false
  },
  
  admin: {
    // PROJETOS
    'projects:view': true,
    'projects:create': true,
    'projects:edit': true,
    'projects:delete': true,
    'projects:add_members': true,
    'projects:remove_members': true,
    
    // TAREFAS
    'tasks:view': true,
    'tasks:create': true,
    'tasks:edit_own': true,
    'tasks:edit_any': true,
    'tasks:delete': true,
    'tasks:update_status': true,
    
    // COMENTÁRIOS
    'comments:create': true,
    'comments:edit_own': true,
    'comments:edit_any': true,
    'comments:delete_own': true,
    'comments:delete_any': true,
    'comments:rate': true,
    
    // DOCUMENTOS
    'documents:upload': true,
    'documents:download': true,
    'documents:delete': true,
    
    // COMUNICAÇÃO
    'chat:participate': true,
    'messages:send': true,
    
    // TEMPLATES
    'templates:use': true,
    'templates:create': true,
    'templates:manage': true,
    
    // DASHBOARD
    'dashboard:basic': true,
    'dashboard:advanced': false, // Admin não tem dashboard avançado
    
    // SISTEMA
    'system:manage_users': true,
    'system:settings': true
  }
};

/**
 * Verifica se um usuário tem uma permissão específica
 * @param {string} userRole - Cargo do usuário
 * @param {string} permission - Permissão a ser verificada
 * @returns {boolean} - True se tem permissão, false caso contrário
 */
const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) {
    return false;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) {
    return false;
  }
  
  return rolePermissions[permission] === true;
};

/**
 * Verifica se um usuário tem pelo menos uma das permissões fornecidas
 * @param {string} userRole - Cargo do usuário
 * @param {string[]} permissions - Array de permissões
 * @returns {boolean} - True se tem pelo menos uma permissão
 */
const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 * @param {string} userRole - Cargo do usuário
 * @param {string[]} permissions - Array de permissões
 * @returns {boolean} - True se tem todas as permissões
 */
const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Retorna todas as permissões de um cargo
 * @param {string} userRole - Cargo do usuário
 * @returns {object} - Objeto com todas as permissões do cargo
 */
const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || {};
};

/**
 * Verifica se um usuário pode editar um recurso específico
 * @param {string} userRole - Cargo do usuário
 * @param {number} resourceUserId - ID do usuário que criou o recurso
 * @param {number} currentUserId - ID do usuário atual
 * @param {string} permission - Permissão para editar qualquer recurso
 * @returns {boolean} - True se pode editar
 */
const canEditResource = (userRole, resourceUserId, currentUserId, permission) => {
  // Se é o próprio usuário, pode editar
  if (resourceUserId === currentUserId) {
    return true;
  }
  
  // Se tem permissão para editar qualquer recurso
  return hasPermission(userRole, permission);
};

module.exports = {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canEditResource,
  ROLE_PERMISSIONS
}; 