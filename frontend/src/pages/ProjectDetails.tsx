import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import ProjectChat from '../components/ProjectChat';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import type { Project } from '../services/project.service';
import type { Task } from '../services/task.service';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

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
    }, 15000); // 15 segundos
    
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
      setTasksLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err);
      setTasksError(err.message || 'Erro ao carregar tarefas do projeto');
      setTasksLoading(false);
    }
  };

  // Função para calcular o progresso (mock)
  const getProjectProgress = (): number => {
    // Aqui seria implementado uma lógica real para calcular o progresso baseado nas tarefas
    // Por enquanto, usando um valor aleatório entre 0 e 100
    return Math.floor(Math.random() * 100);
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
              <div className="flex space-x-2">
                <Link to={`/projects/${project.id}/edit`}>
                  <Button variant="outline">
                    Editar Projeto
                  </Button>
                </Link>
                <Button 
                  variant="danger"
                  onClick={handleDeleteProject}
                >
                  Excluir Projeto
                </Button>
              </div>
            </div>
            
            {/* Progresso do projeto */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-medium text-gray-700">{getProjectProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${getProjectProgress()}%` }}
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
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Visão Geral
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('members')}
              >
                Membros
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('tasks')}
              >
                Tarefas
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  <Button variant="primary" size="sm">
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
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => {
                                    if (window.confirm(`Deseja remover ${member.user.name} do projeto?`)) {
                                      // Implement remove member functionality
                                      alert('Funcionalidade de remoção a ser implementada');
                                    }
                                  }}
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhum membro encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Tarefas do Projeto</h2>
                  <Link to={`/projects/${project.id}/tasks/new`}>
                    <Button variant="primary" size="sm">
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Nova Tarefa
                    </Button>
                  </Link>
                </div>
                
                {tasksLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{tasksError}</p>
                    <Button 
                      variant="secondary" 
                      className="mt-2" 
                      onClick={fetchTasks}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Título
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prioridade
                            </th>
                            <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Responsável
                            </th>
                            <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data de Entrega
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 sm:px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                {task.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs hidden sm:block">{task.description}</div>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                     task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                     'bg-green-100 text-green-800'}`}
                                  >
                                    {task.status === 'pending' ? 'Pendente' : 
                                     task.status === 'in_progress' ? 'Em Prog.' : 
                                     'Concluída'}
                                  </span>
                                  <div className="relative inline-block text-left">
                                    <button
                                      type="button"
                                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                      id={`status-button-${task.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const dropdown = document.getElementById(`status-dropdown-${task.id}`);
                                        if (dropdown) {
                                          dropdown.classList.toggle('hidden');
                                        }
                                      }}
                                    >
                                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                    <div 
                                      id={`status-dropdown-${task.id}`}
                                      className="hidden origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                    >
                                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby={`status-button-${task.id}`}>
                                        <button
                                          className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={async () => {
                                            try {
                                              await taskService.updateTaskStatus(Number(project.id), task.id, 'pending');
                                              fetchTasks(); // Recarrega as tarefas
                                              const dropdown = document.getElementById(`status-dropdown-${task.id}`);
                                              if (dropdown) dropdown.classList.add('hidden');
                                            } catch (err) {
                                              console.error('Erro ao atualizar status:', err);
                                              alert('Erro ao atualizar status da tarefa');
                                            }
                                          }}
                                        >
                                          Marcar como Pendente
                                        </button>
                                        <button
                                          className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={async () => {
                                            try {
                                              await taskService.updateTaskStatus(Number(project.id), task.id, 'in_progress');
                                              fetchTasks(); // Recarrega as tarefas
                                              const dropdown = document.getElementById(`status-dropdown-${task.id}`);
                                              if (dropdown) dropdown.classList.add('hidden');
                                            } catch (err) {
                                              console.error('Erro ao atualizar status:', err);
                                              alert('Erro ao atualizar status da tarefa');
                                            }
                                          }}
                                        >
                                          Marcar como Em Progresso
                                        </button>
                                        <button
                                          className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={async () => {
                                            try {
                                              await taskService.updateTaskStatus(Number(project.id), task.id, 'completed');
                                              fetchTasks(); // Recarrega as tarefas
                                              const dropdown = document.getElementById(`status-dropdown-${task.id}`);
                                              if (dropdown) dropdown.classList.add('hidden');
                                            } catch (err) {
                                              console.error('Erro ao atualizar status:', err);
                                              alert('Erro ao atualizar status da tarefa');
                                            }
                                          }}
                                        >
                                          Marcar como Concluída
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${task.priority === 'low' ? 'bg-green-100 text-green-800' : 
                                   task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                   task.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-red-100 text-red-800'}`}
                                >
                                  {task.priority === 'low' ? 'Baixa' : 
                                   task.priority === 'medium' ? 'Média' :
                                   task.priority === 'high' ? 'Alta' : 'Urgente'}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                {task.assignedUser ? (
                                  <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-primary-lighter flex items-center justify-center text-white text-xs">
                                      {task.assignedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-900">{task.assignedUser.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Não atribuído</span>
                                )}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Não definido'}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right">
                                <Link to={`/projects/${project.id}/tasks/${task.id}`} className="text-primary hover:text-primary-dark mr-3">
                                  <span className="hidden sm:inline">Detalhes</span>
                                  <span className="sm:hidden">Ver</span>
                                </Link>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => {
                                    if (window.confirm(`Deseja remover a tarefa "${task.title}"?`)) {
                                      // Implementar funcionalidade de remoção
                                    }
                                  }}
                                >
                                  <span className="hidden sm:inline">Excluir</span>
                                  <span className="sm:hidden">Del</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sem tarefas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comece criando uma nova tarefa para este projeto.
                    </p>
                    <div className="mt-6">
                      <Link to={`/projects/${project.id}/tasks/new`}>
                        <Button variant="primary">
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Criar Tarefa
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && id && (
              <ProjectChat projectId={Number(id)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails; 