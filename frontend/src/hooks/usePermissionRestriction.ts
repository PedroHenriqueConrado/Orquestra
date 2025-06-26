import { useState } from 'react';
import { usePermissions } from './usePermissions';
import { useAuth } from '../contexts/AuthContext';

interface PermissionRestriction {
  action: string;
  requiredRoles: string[];
  permissionKey?: string;
}

const PERMISSION_RESTRICTIONS: Record<string, PermissionRestriction> = {
  // PROJETOS
  'create_project': {
    action: 'criar projetos',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'projects:create'
  },
  'edit_project': {
    action: 'editar projetos',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'projects:edit'
  },
  'delete_project': {
    action: 'excluir projetos',
    requiredRoles: ['project_manager', 'admin'],
    permissionKey: 'projects:delete'
  },
  'add_members': {
    action: 'adicionar membros ao projeto',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'projects:add_members'
  },
  'remove_members': {
    action: 'remover membros do projeto',
    requiredRoles: ['project_manager', 'admin'],
    permissionKey: 'projects:remove_members'
  },

  // TAREFAS
  'create_task': {
    action: 'criar tarefas',
    requiredRoles: ['developer', 'supervisor', 'team_leader', 'project_manager', 'admin'],
    permissionKey: 'tasks:create'
  },
  'edit_own_task': {
    action: 'editar próprias tarefas',
    requiredRoles: ['developer', 'supervisor', 'team_leader', 'project_manager', 'admin'],
    permissionKey: 'tasks:edit_own'
  },
  'edit_any_task': {
    action: 'editar tarefas de outros usuários',
    requiredRoles: ['supervisor', 'team_leader', 'project_manager', 'admin'],
    permissionKey: 'tasks:edit_any'
  },
  'delete_task': {
    action: 'excluir tarefas',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'tasks:delete'
  },
  'update_task_status': {
    action: 'atualizar status de tarefas',
    requiredRoles: ['developer', 'supervisor', 'team_leader', 'project_manager', 'admin'],
    permissionKey: 'tasks:update_status'
  },

  // COMENTÁRIOS
  'edit_any_comment': {
    action: 'editar comentários de outros usuários',
    requiredRoles: ['project_manager', 'admin'],
    permissionKey: 'comments:edit_any'
  },
  'delete_any_comment': {
    action: 'excluir comentários de outros usuários',
    requiredRoles: ['project_manager', 'admin'],
    permissionKey: 'comments:delete_any'
  },
  'rate_task': {
    action: 'avaliar tarefas',
    requiredRoles: ['tutor', 'project_manager', 'admin'],
    permissionKey: 'comments:rate'
  },

  // DOCUMENTOS
  'upload_document': {
    action: 'fazer upload de documentos',
    requiredRoles: ['developer', 'supervisor', 'team_leader', 'project_manager', 'admin'],
    permissionKey: 'documents:upload'
  },
  'delete_document': {
    action: 'excluir documentos',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'documents:delete'
  },

  // TEMPLATES
  'create_template': {
    action: 'criar templates',
    requiredRoles: ['team_leader', 'project_manager', 'admin'],
    permissionKey: 'templates:create'
  },
  'manage_templates': {
    action: 'gerenciar templates',
    requiredRoles: ['project_manager', 'admin'],
    permissionKey: 'templates:manage'
  },

  // DASHBOARD
  'advanced_dashboard': {
    action: 'acessar o dashboard avançado',
    requiredRoles: ['project_manager'],
    permissionKey: 'dashboard:advanced'
  },

  // SISTEMA
  'manage_users': {
    action: 'gerenciar usuários',
    requiredRoles: ['admin'],
    permissionKey: 'system:manage_users'
  },
  'system_settings': {
    action: 'acessar configurações do sistema',
    requiredRoles: ['admin'],
    permissionKey: 'system:settings'
  }
};

export const usePermissionRestriction = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRestriction, setCurrentRestriction] = useState<PermissionRestriction | null>(null);
  const { permissions, hasPermission } = usePermissions();
  const { user } = useAuth();

  const checkPermission = (restrictionKey: string): boolean => {
    const restriction = PERMISSION_RESTRICTIONS[restrictionKey];
    if (!restriction) return true;

    // Se tem a permissão específica, permite
    if (restriction.permissionKey && hasPermission(restriction.permissionKey)) {
      return true;
    }

    return false;
  };

  const handleRestrictedAction = (restrictionKey: string): boolean => {
    const restriction = PERMISSION_RESTRICTIONS[restrictionKey];
    if (!restriction) return true;

    // Verifica se tem permissão
    if (checkPermission(restrictionKey)) {
      return true;
    }

    // Se não tem permissão, mostra o modal
    setCurrentRestriction(restriction);
    setIsModalOpen(true);
    return false;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRestriction(null);
  };

  return {
    isModalOpen,
    currentRestriction,
    handleRestrictedAction,
    closeModal,
    checkPermission
  };
}; 