import React, { useState, useEffect, useMemo } from 'react';
import userService from '../services/user.service';
import type { User } from '../services/user.service';
import { getRoleDisplayName } from '../utils/roleTranslations';

interface MemberSelectorProps {
  selectedMembers: number[];
  onChange: (selectedIds: number[]) => void;
  currentUserId?: number;
}

const ALL_ROLES = [
  'developer',
  'supervisor',
  'tutor',
  'team_leader',
  'project_manager',
  'admin'
];

const MemberSelector: React.FC<MemberSelectorProps> = ({ 
  selectedMembers, 
  onChange,
  currentUserId
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Busca os usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allUsers = await userService.getAllUsers();
        // Filtra o usuário atual (o criador do projeto) se for necessário
        const filteredUsers = currentUserId 
          ? allUsers.filter(user => user.id !== currentUserId)
          : allUsers;
        setUsers(filteredUsers);
      } catch (err: any) {
        console.error('Erro ao buscar usuários:', err);
        setError('Não foi possível carregar os usuários disponíveis.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  // Função para alternar a seleção de um usuário
  const toggleUserSelection = (userId: number) => {
    if (selectedMembers.includes(userId)) {
      onChange(selectedMembers.filter(id => id !== userId));
    } else {
      onChange([...selectedMembers, userId]);
    }
  };

  // Função para alternar filtro de cargo
  const toggleRoleFilter = (role: string) => {
    setRoleFilters(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Filtragem dos usuários
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (roleFilters.length > 0) {
      filtered = filtered.filter(user => roleFilters.includes(user.role));
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(s) || user.email.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [users, roleFilters, search]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-theme-primary">
        Adicionar membros ao projeto
      </label>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 gap-2">
        {/* Filtro de cargos */}
        <div>
          <span className="block text-xs font-semibold text-theme-secondary mb-1">Filtrar por função:</span>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map(role => (
              <label key={role} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleFilters.includes(role)}
                  onChange={() => toggleRoleFilter(role)}
                  className="h-4 w-4 text-primary border-theme rounded"
                />
                <span className="text-xs text-theme-secondary">{getRoleDisplayName(role)}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Filtro de nome/email */}
        <div className="flex-1">
          <span className="block text-xs font-semibold text-theme-secondary mb-1">Buscar por nome ou email:</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Digite o nome ou email..."
            className="w-full px-3 py-2 border border-theme rounded-md bg-theme-surface text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <svg className="animate-spin h-5 w-5 text-theme-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredUsers.length === 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md text-sm">
          Nenhum usuário encontrado com os filtros selecionados.
        </div>
      )}

      {!isLoading && !error && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-theme rounded-md bg-theme-surface">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className={`p-2 rounded-md cursor-pointer flex items-center ${
                selectedMembers.includes(user.id) 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                  : 'bg-theme border border-theme hover:bg-theme-secondary'
              }`}
              onClick={() => toggleUserSelection(user.id)}
            >
              <div className="flex-shrink-0 h-8 w-8 bg-theme-secondary rounded-full flex items-center justify-center text-theme-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-theme-primary">{user.name}</p>
                <p className="text-xs text-theme-secondary">{user.email}</p>
                <p className="text-xs text-theme-secondary mt-0.5">{getRoleDisplayName(user.role)}</p>
              </div>
              <div className="ml-auto">
                <input 
                  type="checkbox" 
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => {}} // Controlado pelo clique no item
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-theme rounded bg-theme-surface"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedMembers.length > 0 && (
        <p className="text-sm text-theme-secondary">
          {selectedMembers.length} {selectedMembers.length === 1 ? 'membro selecionado' : 'membros selecionados'}
        </p>
      )}
    </div>
  );
};

export default MemberSelector; 