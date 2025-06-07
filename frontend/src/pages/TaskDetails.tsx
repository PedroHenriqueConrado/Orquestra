import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import TaskDocuments from '../components/TaskDocuments';
import taskService from '../services/task.service';
import projectService from '../services/project.service';
import type { Task, TaskStatus, TaskPriority } from '../services/task.service';
import type { Project } from '../services/project.service';
import toast from 'react-hot-toast';

const TaskDetails: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Carregar os dados da tarefa e do projeto
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar o projeto primeiro
        const projectData = await projectService.getProjectById(Number(projectId));
        setProject(projectData);
        
        // Então carregar a tarefa
        const taskData = await taskService.getTaskById(Number(projectId), Number(taskId));
        setTask(taskData);
        setEditedTask(taskData);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar detalhes da tarefa');
        setLoading(false);
      }
    };
    
    if (projectId && taskId) {
      fetchData();
    }
  }, [projectId, taskId]);
  
  // Função para atualizar uma tarefa
  const handleUpdateTask = async () => {
    if (!task || !editedTask || !projectId || !taskId) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Enviar apenas os campos que foram editados
      const updatedTask = await taskService.updateTask(
        Number(projectId),
        Number(taskId),
        editedTask
      );
      
      setTask(updatedTask);
      setIsEditing(false);
      setIsSaving(false);
    } catch (err: any) {
      console.error('Erro ao atualizar tarefa:', err);
      setError(err.message || 'Erro ao atualizar tarefa');
      setIsSaving(false);
    }
  };
  
  // Função para atualizar apenas o status da tarefa
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !projectId || !taskId) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const updatedTask = await taskService.updateTaskStatus(
        Number(projectId),
        Number(taskId),
        newStatus
      );
      
      setTask(updatedTask);
      setIsSaving(false);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message || 'Erro ao atualizar status da tarefa');
      setIsSaving(false);
    }
  };
  
  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setEditedTask(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setEditedTask(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Função para lidar com a exclusão da tarefa
  const handleDeleteTask = async () => {
    if (!projectId || !taskId) return;
    
    try {
      setIsDeleting(true);
      await taskService.deleteTask(Number(projectId), Number(taskId));
      toast.success('Tarefa excluída com sucesso');
      
      // Verifica se veio da lista de tarefas ou de outro lugar
      const searchParams = new URLSearchParams(location.search);
      const fromList = searchParams.get('from') === 'list';
      
      if (fromList) {
        // Se veio da lista, volta para a lista mantendo os filtros
        const tab = searchParams.get('tab') || 'tasks';
        const status = searchParams.get('status') || 'all';
        navigate(`/projects/${projectId}?tab=${tab}&status=${status}`);
      } else {
        // Se veio de outro lugar, volta para a página anterior
        navigate(-1);
      }
    } catch (err: any) {
      console.error('Erro ao excluir tarefa:', err);
      toast.error(err.message || 'Erro ao excluir tarefa');
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !task || !project) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-500 text-center">
              <p>{error || 'Tarefa não encontrada'}</p>
              <Button 
                variant="primary" 
                className="mt-4" 
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                Voltar para o Projeto
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Navegação e cabeçalho */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex mb-3 sm:mb-5 overflow-x-auto hide-scrollbar" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 min-w-full">
              <li className="inline-flex items-center">
                <Link to="/projects" className="text-xs sm:text-sm text-gray-500 hover:text-gray-700">
                  Projetos
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link to={`/projects/${projectId}`} className="ml-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 md:ml-2 truncate max-w-[100px] sm:max-w-none">
                    {project.name}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 truncate">
                    Tarefa
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">{task.title}</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleDeleteTask}
                    isLoading={isDeleting}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
                  <Button 
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => navigate(`/projects/${projectId}?tab=tasks`)}
                  >
                    Voltar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask(task || {});
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleUpdateTask}
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}
        
        {/* Conteúdo da tarefa */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {!isEditing ? (
            // Modo de visualização
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status da tarefa */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-gray-200 gap-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Status</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                       task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                       'bg-green-100 text-green-800'}`}
                    >
                      {task.status === 'pending' ? 'Pendente' : 
                       task.status === 'in_progress' ? 'Em Progresso' : 
                       'Concluída'}
                    </span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${task.priority === 'low' ? 'bg-green-100 text-green-800' : 
                       task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                       task.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'}`}
                    >
                      {task.priority === 'low' ? 'Prioridade Baixa' : 
                       task.priority === 'medium' ? 'Prioridade Média' :
                       task.priority === 'high' ? 'Prioridade Alta' : 'Prioridade Urgente'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={task.status === 'pending' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleStatusChange('pending')}
                    disabled={task.status === 'pending' || isSaving}
                  >
                    Pendente
                  </Button>
                  <Button 
                    variant={task.status === 'in_progress' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={task.status === 'in_progress' || isSaving}
                  >
                    Em Progresso
                  </Button>
                  <Button 
                    variant={task.status === 'completed' ? 'success' : 'outline'}
                    size="xs"
                    onClick={() => handleStatusChange('completed')}
                    disabled={task.status === 'completed' || isSaving}
                  >
                    Concluída
                  </Button>
                </div>
              </div>
              
              {/* Descrição */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Descrição</h2>
                <div className="mt-2 prose max-w-none text-gray-700">
                  {task.description ? (
                    <p className="text-sm sm:text-base break-words">{task.description}</p>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500 italic">Nenhuma descrição fornecida.</p>
                  )}
                </div>
              </div>
              
              {/* Detalhes */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Detalhes</h2>
                <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:gap-y-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Responsável</h3>
                    <div className="mt-1">
                      {task.assignedUser ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-lighter flex items-center justify-center text-white">
                            {task.assignedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 text-sm text-gray-900 truncate">{task.assignedUser.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Não atribuído</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Data de Entrega</h3>
                    <div className="mt-1 text-sm text-gray-900">
                      {task.due_date ? (
                        new Date(task.due_date).toLocaleDateString('pt-BR')
                      ) : (
                        <span className="text-gray-500">Não definido</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Horas Estimadas</h3>
                    <div className="mt-1 text-sm text-gray-900">
                      {task.estimated_hours ? (
                        `${task.estimated_hours} horas`
                      ) : (
                        <span className="text-gray-500">Não definido</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Horas Registradas</h3>
                    <div className="mt-1 text-sm text-gray-900">
                      {task.actual_hours ? (
                        `${task.actual_hours} horas`
                      ) : (
                        <span className="text-gray-500">Nenhuma hora registrada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documentos */}
              {!isEditing && projectId && taskId && (
                <TaskDocuments
                  projectId={Number(projectId)}
                  taskId={Number(taskId)}
                />
              )}
            </div>
          ) : (
            // Modo de edição
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedTask.title || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Título da tarefa"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedTask.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Descrição detalhada da tarefa"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editedTask.status || 'pending'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editedTask.priority || 'medium'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Horas Estimadas
                  </label>
                  <input
                    type="number"
                    id="estimated_hours"
                    name="estimated_hours"
                    value={editedTask.estimated_hours || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Ex: 4.5"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Atribuir Para
                </label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={editedTask.assigned_to || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Não atribuído</option>
                  {project.members.map(member => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="actual_hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Registradas
                </label>
                <input
                  type="number"
                  id="actual_hours"
                  name="actual_hours"
                  value={editedTask.actual_hours || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Ex: 3.5"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskDetails; 