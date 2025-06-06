import React, { useState, useEffect } from 'react';
import userService from '../services/user.service';
import type { User } from '../services/user.service';

interface MemberSelectorProps {
  selectedMembers: number[];
  onChange: (selectedIds: number[]) => void;
  currentUserId?: number;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ 
  selectedMembers, 
  onChange,
  currentUserId
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Se já estiver selecionado, remove
      onChange(selectedMembers.filter(id => id !== userId));
    } else {
      // Se não estiver selecionado, adiciona
      onChange([...selectedMembers, userId]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Adicionar membros ao projeto
      </label>
      
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          Não há outros usuários disponíveis para adicionar ao projeto.
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
          {users.map(user => (
            <div 
              key={user.id} 
              className={`p-2 rounded-md cursor-pointer flex items-center ${
                selectedMembers.includes(user.id) 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => toggleUserSelection(user.id)}
            >
              <div className="flex-shrink-0 h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="ml-auto">
                <input 
                  type="checkbox" 
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => {}} // Controlado pelo clique no item
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedMembers.length > 0 && (
        <p className="text-sm text-gray-500">
          {selectedMembers.length} {selectedMembers.length === 1 ? 'membro selecionado' : 'membros selecionados'}
        </p>
      )}
    </div>
  );
};

export default MemberSelector; 