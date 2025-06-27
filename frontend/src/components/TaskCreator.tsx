import React, { useState } from 'react';
import type { TaskData, TaskPriority, TaskStatus } from '../services/task.service';
import Button from './ui/Button';

interface TaskCreatorProps {
  tasks: TaskData[];
  onChange: (tasks: TaskData[]) => void;
  availableMembers?: Array<{id: number, name: string}>; // Opcional: usuários disponíveis para atribuição
}

// Novo componente UserMultiSelect
interface UserMultiSelectProps {
  users: Array<{ id: number; name: string }>;
  value: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  required?: boolean;
}

const UserMultiSelect: React.FC<UserMultiSelectProps> = ({ users, value, onChange, label, required }) => {
  const [search, setSearch] = useState('');
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
      )}
      {/* Chips dos selecionados */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(id => {
          const user = users.find(u => u.id === id);
          if (!user) return null;
          return (
            <span key={id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-lighter dark:bg-dark-accent text-primary dark:text-dark-text border border-primary dark:border-dark-border">
              {user.name}
              <button
                type="button"
                className="ml-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                onClick={() => onChange(value.filter(v => v !== id))}
                aria-label={`Remover ${user.name}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      {/* Campo de busca */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar usuário..."
        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900 placeholder:text-gray-400 dark:placeholder:text-dark-muted"
      />
      {/* Lista de usuários com checkbox */}
      <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-accent divide-y divide-gray-100 dark:divide-dark-border">
        {filteredUsers.length === 0 && (
          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</div>
        )}
        {filteredUsers.map(user => (
          <label key={user.id} className="flex items-center px-3 py-2 cursor-pointer hover:bg-primary-lighter dark:hover:bg-dark-secondary transition-colors">
            <input
              type="checkbox"
              checked={value.includes(user.id)}
              onChange={e => {
                if (e.target.checked) {
                  onChange([...value, user.id]);
                } else {
                  onChange(value.filter(v => v !== user.id));
                }
              }}
              className="form-checkbox h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-dark-border rounded mr-2"
            />
            <span className="text-sm text-gray-900 dark:text-dark-text">{user.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const TaskCreator: React.FC<TaskCreatorProps> = ({ tasks, onChange, availableMembers = [] }) => {
  // Estado para a tarefa sendo editada atualmente
  const [currentTask, setCurrentTask] = useState<TaskData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    assignees: []
  });
  
  // Estado para controlar se estamos editando uma tarefa existente
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Estado para mensagens de erro de validação
  const [validationError, setValidationError] = useState<string | null>(null);

  // Função para lidar com mudanças nos campos da tarefa atual
  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTask(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa erro de validação quando o usuário digita
    setValidationError(null);
  };

  // Função para adicionar ou atualizar uma tarefa
  const handleAddOrUpdateTask = () => {
    // Validação básica
    if (!currentTask.title.trim()) {
      setValidationError('O título da tarefa é obrigatório');
      return;
    }
    
    if (currentTask.title.trim().length < 3) {
      setValidationError('O título da tarefa deve ter pelo menos 3 caracteres');
      return;
    }
    
    if (currentTask.description && currentTask.description.trim().length > 1000) {
      setValidationError('A descrição da tarefa deve ter no máximo 1000 caracteres');
      return;
    }
    
    if (!currentTask.assignees || currentTask.assignees.length === 0) {
      setValidationError('Selecione pelo menos um responsável para a tarefa');
      return;
    }
    
    let updatedTasks: TaskData[];
    
    if (editingIndex !== null) {
      // Atualizando uma tarefa existente
      updatedTasks = [...tasks];
      updatedTasks[editingIndex] = currentTask;
    } else {
      // Adicionando uma nova tarefa
      updatedTasks = [...tasks, currentTask];
    }
    
    // Atualiza as tarefas
    onChange(updatedTasks);
    
    // Limpa o formulário
    setCurrentTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: '',
      assignees: []
    });
    
    // Sai do modo de edição
    setEditingIndex(null);
    setValidationError(null);
  };

  // Função para editar uma tarefa existente
  const handleEditTask = (index: number) => {
    setCurrentTask(tasks[index]);
    setEditingIndex(index);
  };

  // Função para remover uma tarefa
  const handleRemoveTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    onChange(updatedTasks);
    
    // Se estava editando essa tarefa, limpa o formulário
    if (editingIndex === index) {
      setCurrentTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        assignees: []
      });
      setEditingIndex(null);
    }
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setCurrentTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: '',
      assignees: []
    });
    setEditingIndex(null);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 dark:border-dark-border rounded-md p-4 bg-white dark:bg-dark-secondary">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {editingIndex !== null ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800">
            {validationError}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Título da tarefa */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Título <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={currentTask.title}
              onChange={handleTaskChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900 placeholder:text-gray-400 dark:placeholder:text-dark-muted"
              placeholder="Título da tarefa"
            />
          </div>
          
          {/* Descrição da tarefa */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={currentTask.description || ''}
              onChange={handleTaskChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900 placeholder:text-gray-400 dark:placeholder:text-dark-muted"
              placeholder="Descrição da tarefa"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Prioridade */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                value={currentTask.priority || 'medium'}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            
            {/* Status inicial */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Status Inicial
              </label>
              <select
                id="status"
                name="status"
                value={currentTask.status || 'pending'}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Progresso</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
            
            {/* Data de vencimento */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={currentTask.due_date || ''}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-accent dark:text-dark-text bg-white text-gray-900"
              />
            </div>
          </div>
          
          {/* Responsáveis (multi-select) */}
          {availableMembers.length > 0 && (
            <div>
              <UserMultiSelect
                users={availableMembers}
                value={currentTask.assignees || []}
                onChange={ids => {
                  setCurrentTask(prev => ({ ...prev, assignees: ids }));
                  setValidationError(null);
                }}
                label="Responsáveis"
                required
              />
              {/* <span className="text-xs text-gray-500 dark:text-gray-300">Segure Ctrl ou Shift para selecionar mais de um.</span> */}
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex justify-end space-x-2 pt-2">
            {editingIndex !== null && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              variant="create"
              onClick={handleAddOrUpdateTask}
            >
              {editingIndex !== null ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Lista de tarefas */}
      {tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tarefas Iniciais ({tasks.length})</h3>
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Prioridade */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${task.priority === 'low' ? 'bg-green-100 text-green-800' : 
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          task.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {task.priority === 'low' ? 'Baixa' : 
                         task.priority === 'medium' ? 'Média' :
                         task.priority === 'high' ? 'Alta' : 'Urgente'}
                      </span>
                      
                      {/* Status */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${task.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.status === 'pending' ? 'Pendente' : 
                         task.status === 'in_progress' ? 'Em Progresso' : 'Concluída'}
                      </span>
                      
                      {/* Data de vencimento */}
                      {task.due_date && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Entrega: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      
                      {/* Atribuição */}
                      {task.assignees && task.assignees.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Atribuída: {task.assignees.map(id => availableMembers?.find(m => m.id === id)?.name || `Usuário ${id}`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditTask(index)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCreator; 