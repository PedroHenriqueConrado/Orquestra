import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import ProjectChat from '../components/ProjectChat';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import progressService from '../services/progress.service';
import type { Project } from '../services/project.service';
import type { Task, TaskStatus } from '../services/task.service';
import TaskList from '../components/TaskList';
import MemberSelector from '../components/MemberSelector';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [projectProgress, setProjectProgress] = useState<number>(0);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Verifica se há um parâmetro de consulta 'tab' na URL
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Define a aba ativa com base no parâmetro de consulta, ou usa 'overview' como padrão
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'tasks' | 'chat'>(
    (tabParam === 'tasks' || tabParam === 'members' || tabParam === 'chat') ? tabParam as any : 'overview'
  );

  // Função para lidar com a exclusão do projeto
  const handleDeleteProject = async () => {
    if (!id || !project) return;
    
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await projectService.deleteProject(Number(id));
      navigate('/projects', { 
        state: { 
          message: 'Projeto excluído com sucesso!', 
          type: 'success' 
        } 
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir projeto');
    }
  };

  useEffect(() => {
    if (!id) return;
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectById(Number(id));
        setProject(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao buscar projeto:', err);
        setError(err.message || 'Erro ao carregar detalhes do projeto');
        setLoading(false);
      }
    };

    fetchProject();
    
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Tempo limite excedido ao carregar projeto. Por favor, tente novamente.');
      }
    }, 15000000000); // 15 segundos
    
    return () => clearTimeout(timeout);
  }, [id]);

  // Efeito para carregar as tarefas quando a aba de tarefas é selecionada
  useEffect(() => {
    if (activeTab === 'tasks' && id) {
      fetchTasks();
    }
  }, [activeTab, id]);

  // Atualiza a URL quando a aba ativa muda
  useEffect(() => {
    // Não atualiza a URL para a aba padrão (overview)
    if (activeTab === 'overview') {
      navigate(`/projects/${id}`, { replace: true });
    } else {
      navigate(`/projects/${id}?tab=${activeTab}`, { replace: true });
    }
  }, [activeTab, id, navigate]);

  // Efeito para adicionar manipulador de eventos para fechar dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fechar todos os dropdowns quando clicar fora deles
      const dropdowns = document.querySelectorAll('[id^="status-dropdown-"]');
      dropdowns.forEach(dropdown => {
        if (!(dropdown as HTMLElement).classList.contains('hidden')) {
          const button = document.getElementById((dropdown as HTMLElement).id.replace('dropdown', 'button'));
          // Verificar se o clique foi fora do dropdown e do seu botão
          if (button && !button.contains(event.target as Node) && !dropdown.contains(event.target as Node)) {
            (dropdown as HTMLElement).classList.add('hidden');
          }
        }
      });
    };

    // Adicionar event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para buscar as tarefas do projeto
  const fetchTasks = async () => {
    if (!id) return;
    
    try {
      setTasksLoading(true);
      setTasksError(null);
      const fetchedTasks = await taskService.getProjectTasks(Number(id));
      setTasks(fetchedTasks);
      setFilteredTasks(fetchedTasks);
      setTasksLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err);
      setTasksError(err.message || 'Erro ao carregar tarefas do projeto');
      setTasksLoading(false);
    }
  };

  // Efeito para calcular o progresso do projeto
  useEffect(() => {
    const calculateProgress = async () => {
      if (id) {
        const progress = await progressService.getProjectProgress(Number(id));
        setProjectProgress(progress);
      }
    };
    calculateProgress();
  }, [id, tasks]); // Recalcula quando as tarefas mudam

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    if (!id || !project) return;
    
    try {
      await taskService.updateTaskStatus(Number(id), taskId, newStatus);
      fetchTasks();
    } catch (err: any) {
      console.error('Erro ao atualizar status da tarefa:', err);
      setTaskError(err.message || 'Erro ao atualizar status da tarefa');
    }
  };

  useEffect(() => {
    if (tasks) {
      const filtered = taskFilter === 'all' 
        ? tasks 
        : tasks.filter(task => task.status === taskFilter);
      setFilteredTasks(filtered);
    }
  }, [tasks, taskFilter]);

  const handleAddMembers = async () => {
    if (!project || selectedMembers.length === 0) return;

    try {
      setIsAddingMembers(true);
      
      // Adiciona cada membro selecionado ao projeto
      await Promise.all(
        selectedMembers.map(userId =>
          projectService.addMember(project.id, userId)
        )
      );

      // Atualiza a lista de membros do projeto
      const updatedProject = await projectService.getProjectById(project.id);
      setProject(updatedProject);
      
      // Fecha o modal e limpa a seleção
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
    } catch (err: any) {
      console.error('Erro ao adicionar membros:', err);
      setError(err.message || 'Erro ao adicionar membros ao projeto');
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!project || !memberToRemove) return;

    try {
      setIsRemovingMember(true);
      await projectService.removeMember(project.id, memberToRemove.id);
      
      // Atualiza a lista de membros do projeto
      const updatedProject = await projectService.getProjectById(project.id);
      setProject(updatedProject);
      
      // Fecha o modal de confirmação
      setMemberToRemove(null);
    } catch (err: any) {
      console.error('Erro ao remover membro:', err);
      setError(err.message || 'Erro ao remover membro do projeto');
    } finally {
      setIsRemovingMember(false);
    }
  };

  const renderProjectActions = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <Link to={`/projects/${id}/edit`}>
          <Button variant="outline" size="sm">
            <i className="fas fa-edit mr-2"></i>
            Editar Projeto
          </Button>
        </Link>
        <Link to={`/projects/${id}/tasks/new`}>
          <Button variant="primary" size="sm">
            <i className="fas fa-plus-circle mr-2"></i>
            Nova Tarefa
          </Button>
        </Link>
        <Link to={`/projects/${id}/dashboard`}>
          <Button variant="secondary" size="sm">
            <i className="fas fa-chart-bar mr-2"></i>
            Dashboard Avançado
          </Button>
        </Link>
        <Button variant="danger" size="sm" onClick={handleDeleteProject}>
          <i className="fas fa-trash-alt mr-2"></i>
          Excluir Projeto
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-500 text-center">
              <p>{error || 'Projeto não encontrado'}</p>
              <Button 
                variant="primary" 
                className="mt-4" 
                onClick={() => navigate('/projects')}
              >
                Voltar para Projetos
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
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Cabeçalho do projeto */}
        <div className="bg-white shadow rounded-lg mb-4 sm:mb-6">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {renderProjectActions()}
            </div>
            
            {/* Progresso do projeto */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-medium text-gray-700">{projectProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${projectProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                    : 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Visão Geral
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                    : 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                }`}
                onClick={() => setActiveTab('members')}
              >
                Membros
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                    : 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                }`}
                onClick={() => setActiveTab('tasks')}
              >
                Tarefas
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                    : 'whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 text-white hover:bg-gray-700 hover:border-white'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
            </nav>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sobre o Projeto</h2>
                {project.description ? (
                  <p className="text-gray-700">{project.description}</p>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma descrição fornecida.</p>
                )}
                
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Detalhes do Projeto</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Membros</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {project.members.length} participantes
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Gerente do Projeto</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {project.members.find(m => m.role === 'project_manager')?.user.name || 'Não definido'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Membros do Projeto</h2>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Adicionar Membro
                  </Button>
                </div>
                
                {project.members.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Membro
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Função
                            </th>
                            <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Desde
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {project.members.map((member) => (
                            <tr key={member.id}>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-primary-lighter flex items-center justify-center text-white">
                                    {member.user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                                    <div className="text-sm text-gray-500 hidden sm:block">{member.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {member.role === 'project_manager' ? 'Gerente' : 
                                   member.role === 'developer' ? 'Dev' : 
                                   member.role === 'team_leader' ? 'Líder' : 
                                   member.role}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {member.user.id !== currentUser?.id && (
                                  <button
                                    onClick={() => setMemberToRemove({ id: member.user.id, name: member.user.name })}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remover
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comece adicionando membros ao projeto.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={() => setIsAddMemberModalOpen(true)}
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Adicionar Membro
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Tarefas do Projeto</h2>
                  <Link
                    to={`/projects/${project.id}/tasks/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Tarefa
                  </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTaskFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          taskFilter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setTaskFilter('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          taskFilter === 'pending'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Pendentes
                      </button>
                      <button
                        onClick={() => setTaskFilter('in_progress')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          taskFilter === 'in_progress'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Em Progresso
                      </button>
                      <button
                        onClick={() => setTaskFilter('completed')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          taskFilter === 'completed'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Concluídas
                      </button>
                    </div>
                  </div>

                  <TaskList
                    tasks={filteredTasks}
                    loading={loadingTasks}
                    error={taskError}
                    onStatusChange={handleTaskStatusChange}
                    onRefresh={fetchTasks}
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat' && id && (
              <ProjectChat projectId={Number(id)} />
            )}
          </div>
        </div>

        {/* Modal de Adicionar Membros */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Adicionar Membros</h3>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <MemberSelector
                selectedMembers={selectedMembers}
                onChange={setSelectedMembers}
                currentUserId={currentUser?.id}
              />

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddMembers}
                  disabled={selectedMembers.length === 0 || isAddingMembers}
                  isLoading={isAddingMembers}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Remoção */}
        {memberToRemove && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Remover Membro
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Tem certeza que deseja remover {memberToRemove.name} do projeto? Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={handleRemoveMember}
                  disabled={isRemovingMember}
                  isLoading={isRemovingMember}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Remover
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemovingMember}
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails; 