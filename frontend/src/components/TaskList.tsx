import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Task, TaskStatus, TaskPriority } from '../services/task.service';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionRestriction } from '../hooks/usePermissionRestriction';
import PermissionRestrictionModal from '../components/ui/PermissionRestrictionModal';
import { useTheme } from '../contexts/ThemeContext';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onRefresh: () => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  projectId: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, error, onStatusChange, onRefresh, onTaskUpdate, onTaskDelete, projectId }) => {
  const { user } = useAuth();
  const { handleRestrictedAction, isModalOpen, currentRestriction, closeModal } = usePermissionRestriction();
  const { theme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status') || 'all';
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '' as TaskStatus,
    priority: '' as TaskPriority,
    due_date: ''
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditTask = (task: Task) => {
    if (!canEditTask(task)) {
      handleRestrictedAction('edit_task');
      return;
    }
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
  };

  const handleSaveTask = async (taskId: number) => {
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask) return;

      const updatedTask: Task = {
        ...originalTask,
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
        due_date: editForm.due_date
      };
      
      onTaskUpdate(updatedTask);
      setEditingTask(null);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!canDeleteTask(tasks.find(t => t.id === taskId) || {} as Task)) {
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    try {
      onTaskDelete(taskId);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const canEditTask = (task: Task) => {
    if (!user) return false;
    // Permite editar se usuário for responsável ou admin
    const isAssignee = task.assignees && task.assignees.some(a => a.user.id === user.id);
    return isAssignee || user.role === 'admin';
  };

  const canDeleteTask = (task: Task) => {
    if (!user) return false;
    const isAssignee = task.assignees && task.assignees.some(a => a.user.id === user.id);
    return isAssignee || user.role === 'admin';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={onRefresh}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-theme-secondary mb-4">Nenhuma tarefa encontrada</p>
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!handleRestrictedAction('create_task')) {
              return;
            }
            // Se tem permissão, navega para a página de criação
            window.location.href = 'tasks/new';
          }}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Nova Tarefa
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-theme-secondary">Nenhuma tarefa encontrada.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <Link to={`/projects/${projectId}/tasks/${task.id}`} key={task.id} className="block bg-theme-surface border border-theme rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:bg-theme-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">{task.title}</h3>
                <p className="text-theme-secondary mb-3">{task.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status || 'pending')}`}>
                    {task.status === 'pending' && 'Pendente'}
                    {task.status === 'in_progress' && 'Em Progresso'}
                    {task.status === 'completed' && 'Concluída'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority || 'medium')}`}>
                    {task.priority === 'low' && 'Baixa'}
                    {task.priority === 'medium' && 'Média'}
                    {task.priority === 'high' && 'Alta'}
                    {task.priority === 'urgent' && 'Urgente'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-theme-secondary">
                  <div>
                    <span className="font-medium">Responsáveis:</span> {task.assignees && task.assignees.length > 0
                      ? task.assignees.map(a => a.user.name).join(', ')
                      : 'Não atribuído'}
                  </div>
                  <div>
                    <span className="font-medium">Criado em:</span> {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  {task.due_date && (
                    <div>
                      <span className="font-medium">Prazo:</span> {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center space-y-2 ml-4">
                <button
                  onClick={e => { e.preventDefault(); handleEditTask(task); }}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
                  title="Editar tarefa"
                  disabled={!canEditTask(task)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.preventDefault(); handleDeleteTask(task.id); }}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer"
                  title="Excluir tarefa"
                  disabled={!canDeleteTask(task)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))
      )}

      {isModalOpen && currentRestriction && user && (
        <PermissionRestrictionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          action={currentRestriction.action}
          requiredRoles={currentRestriction.requiredRoles}
          currentRole={user.role}
        />
      )}
    </div>
  );
};

export default TaskList; 