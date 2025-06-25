import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Task, TaskStatus } from '../services/task.service';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onRefresh: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, error, onStatusChange, onRefresh }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status') || 'all';

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
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
        <Link 
          to="tasks/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Nova Tarefa
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface shadow overflow-hidden sm:rounded-md border border-theme">
      <div className="flex justify-between items-center p-4 border-b border-theme">
        <h2 className="text-lg font-medium text-theme-primary">Tarefas</h2>
        <button
          onClick={onRefresh}
          className="whitespace-nowrap m-1 py-3 sm:py-4 px-3 sm:px-5 font-medium text-sm flex-shrink-0 text-theme-secondary hover:text-theme-primary transition-colors"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 dark:bg-red-900/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4 text-center text-theme-secondary">
          Carregando tarefas...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-4 text-center text-theme-secondary">
          Nenhuma tarefa encontrada.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-theme">
          <thead className="bg-theme">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Tarefa
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Prioridade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Data Limite
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Responsável
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface divide-y divide-theme">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-theme transition-colors">
                <td className="px-6 py-4 align-top min-w-0">
                  <div className="w-full">
                    <div className="text-sm font-medium text-theme-primary break-words whitespace-normal w-full block">
                      <Link 
                        to={`/projects/${task.project_id}/tasks/${task.id}?from=list&tab=tasks&status=${status}`} 
                        className="hover:text-primary break-words whitespace-normal w-full block"
                      >
                        {task.title}
                      </Link>
                    </div>
                    {task.description && (
                      <div className="text-sm text-theme-secondary whitespace-normal break-words w-full block mt-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status || 'pending'}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status || 'pending')}`}
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluída</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getPriorityColor(task.priority || 'medium')}`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                  {task.assignedUser?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/projects/${task.project_id}/tasks/${task.id}?from=list&tab=tasks&status=${status}`}
                      className="px-3 py-1 text-xs border border-theme rounded-md text-theme-primary hover:bg-theme transition-colors"
                    >
                      Abrir
                    </Link>
                    <button
                      onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                        task.status === 'completed'
                          ? 'text-primary hover:bg-primary hover:text-white border-primary'
                          : 'text-primary hover:bg-primary hover:text-white border-primary'
                      }`}
                    >
                      {task.status === 'completed' ? 'Reabrir' : 'Concluir'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskList; 