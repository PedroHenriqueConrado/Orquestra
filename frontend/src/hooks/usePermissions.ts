import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gerenciar permissões do usuário
 * Baseado na hierarquia: developer < supervisor < tutor < team_leader < project_manager < admin
 */
export const usePermissions = () => {
  const { user } = useAuth();

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
   * Verifica se o usuário tem uma permissão específica
   */
  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) return false;
    
    return rolePermissions[permission as keyof typeof rolePermissions] === true;
  };

  /**
   * Verifica se o usuário tem pelo menos uma das permissões fornecidas
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Verifica se o usuário tem todas as permissões fornecidas
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Verifica se o usuário pode editar um recurso específico
   */
  const canEditResource = (resourceUserId: number, permission: string): boolean => {
    if (!user?.id) return false;
    
    // Se é o próprio usuário, pode editar
    if (resourceUserId === user.id) {
      return true;
    }
    
    // Se tem permissão para editar qualquer recurso
    return hasPermission(permission);
  };

  /**
   * Retorna todas as permissões do usuário atual
   */
  const getUserPermissions = () => {
    if (!user?.role) return {};
    
    return ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || {};
  };

  // Permissões específicas para facilitar o uso
  const permissions = {
    // PROJETOS
    canViewProjects: hasPermission('projects:view'),
    canCreateProjects: hasPermission('projects:create'),
    canEditProjects: hasPermission('projects:edit'),
    canDeleteProjects: hasPermission('projects:delete'),
    canAddMembers: hasPermission('projects:add_members'),
    canRemoveMembers: hasPermission('projects:remove_members'),
    
    // TAREFAS
    canViewTasks: hasPermission('tasks:view'),
    canCreateTasks: hasPermission('tasks:create'),
    canEditOwnTasks: hasPermission('tasks:edit_own'),
    canEditAnyTasks: hasPermission('tasks:edit_any'),
    canDeleteTasks: hasPermission('tasks:delete'),
    canUpdateTaskStatus: hasPermission('tasks:update_status'),
    
    // COMENTÁRIOS
    canCreateComments: hasPermission('comments:create'),
    canEditOwnComments: hasPermission('comments:edit_own'),
    canEditAnyComments: hasPermission('comments:edit_any'),
    canDeleteOwnComments: hasPermission('comments:delete_own'),
    canDeleteAnyComments: hasPermission('comments:delete_any'),
    canRateTasks: hasPermission('comments:rate'),
    
    // DOCUMENTOS
    canUploadDocuments: hasPermission('documents:upload'),
    canDownloadDocuments: hasPermission('documents:download'),
    canDeleteDocuments: hasPermission('documents:delete'),
    
    // COMUNICAÇÃO
    canParticipateChat: hasPermission('chat:participate'),
    canSendMessages: hasPermission('messages:send'),
    
    // TEMPLATES
    canUseTemplates: hasPermission('templates:use'),
    canCreateTemplates: hasPermission('templates:create'),
    canManageTemplates: hasPermission('templates:manage'),
    
    // DASHBOARD
    canAccessBasicDashboard: hasPermission('dashboard:basic'),
    canAccessAdvancedDashboard: hasPermission('dashboard:advanced'),
    
    // SISTEMA
    canManageUsers: hasPermission('system:manage_users'),
    canManageSettings: hasPermission('system:settings')
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEditResource,
    getUserPermissions,
    permissions,
    userRole: user?.role
  };
}; 