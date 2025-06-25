import React, { useState } from 'react';
import type { TaskData, TaskPriority, TaskStatus } from '../services/task.service';
import Button from './ui/Button';

interface TaskCreatorProps {
  tasks: TaskData[];
  onChange: (tasks: TaskData[]) => void;
  availableMembers?: Array<{id: number, name: string}>; // Opcional: usuários disponíveis para atribuição
}

const TaskCreator: React.FC<TaskCreatorProps> = ({ tasks, onChange, availableMembers = [] }) => {
  // Estado para a tarefa sendo editada atualmente
  const [currentTask, setCurrentTask] = useState<TaskData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
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
      due_date: ''
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
        due_date: ''
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
      due_date: ''
    });
    setEditingIndex(null);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingIndex !== null ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {validationError}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Título da tarefa */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={currentTask.title}
              onChange={handleTaskChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Título da tarefa"
            />
          </div>
          
          {/* Descrição da tarefa */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={currentTask.description || ''}
              onChange={handleTaskChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Descrição da tarefa"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Prioridade */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-white mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                value={currentTask.priority || 'medium'}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            
            {/* Status inicial */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-1">
                Status Inicial
              </label>
              <select
                id="status"
                name="status"
                value={currentTask.status || 'pending'}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Progresso</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
            
            {/* Data de vencimento */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-white mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={currentTask.due_date || ''}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Atribuição a membro (se houver membros disponíveis) */}
          {availableMembers.length > 0 && (
            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-white mb-1">
                Atribuir Para
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={currentTask.assigned_to?.toString() || ''}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Não atribuído</option>
                {availableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
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
              variant="primary"
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
                      {task.assigned_to && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Atribuída: {availableMembers?.find(m => m.id === task.assigned_to)?.name || `Usuário ${task.assigned_to}`}
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