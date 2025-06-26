/**
 * Utilitário para traduzir cargos do sistema
 */

export const getRoleDisplayName = (role: string): string => {
  const roleTranslations: Record<string, string> = {
    'developer': 'Desenvolvedor',
    'supervisor': 'Supervisor',
    'tutor': 'Tutor',
    'team_leader': 'Líder de Equipe',
    'project_manager': 'Gerente de Projeto',
    'admin': 'Administrador'
  };

  return roleTranslations[role] || role;
};

export const getRoleDescription = (role: string): string => {
  const roleDescriptions: Record<string, string> = {
    'developer': 'Responsável por desenvolver e implementar funcionalidades',
    'supervisor': 'Supervisiona o trabalho da equipe e coordena atividades',
    'tutor': 'Avalia e orienta o desenvolvimento das tarefas',
    'team_leader': 'Lidera a equipe e gerencia projetos',
    'project_manager': 'Gerencia projetos e tem acesso a recursos avançados',
    'admin': 'Acesso total ao sistema e gerenciamento de usuários'
  };

  return roleDescriptions[role] || 'Cargo não definido';
};

export const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    'developer': 'bg-blue-100 text-blue-800 border-blue-200',
    'supervisor': 'bg-green-100 text-green-800 border-green-200',
    'tutor': 'bg-purple-100 text-purple-800 border-purple-200',
    'team_leader': 'bg-orange-100 text-orange-800 border-orange-200',
    'project_manager': 'bg-red-100 text-red-800 border-red-200',
    'admin': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getRoleIcon = (role: string): string => {
  const roleIcons: Record<string, string> = {
    'developer': '💻',
    'supervisor': '👨‍💼',
    'tutor': '📚',
    'team_leader': '👥',
    'project_manager': '🎯',
    'admin': '⚙️'
  };

  return roleIcons[role] || '👤';
}; 