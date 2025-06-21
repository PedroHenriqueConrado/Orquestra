import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import progressService from '../services/progress.service';
import type { Project } from '../services/project.service';
import type { Task } from '../services/task.service';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats para mostrar no dashboard
  const [stats, setStats] = useState([
    { id: 1, name: 'Projetos Ativos', value: '0' },
    { id: 2, name: 'Tarefas Pendentes', value: '0' },
    { id: 3, name: 'Tarefas Concluídas', value: '0' },
    { id: 4, name: 'Colaboradores', value: '0' }
  ]);

  // Carregar projetos do banco de dados
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setError(null);
        const data = await projectService.getAllProjects();
        setProjects(data);
        
        // Atualizar estatísticas
        updateStats(data, tasks);
        
        setLoadingProjects(false);
      } catch (err: any) {
        console.error('Erro ao carregar projetos:', err);
        setError(err.message || 'Erro ao carregar projetos');
        setLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Função para buscar as tarefas de cada projeto
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (projects.length === 0) return;
      
      try {
        setLoadingTasks(true);
        
        let allTasks: Task[] = [];
        
        // Para cada projeto, buscar suas tarefas
        for (const project of projects) {
          try {
            const projectTasks = await taskService.getProjectTasks(project.id);
            allTasks = [...allTasks, ...projectTasks];
          } catch (err) {
            console.error(`Erro ao carregar tarefas do projeto ${project.id}:`, err);
            // Continuar mesmo com erro em um projeto específico
          }
        }
        
        setTasks(allTasks);
        
        // Atualizar estatísticas com as tarefas carregadas
        updateStats(projects, allTasks);
        
        setLoadingTasks(false);
      } catch (err: any) {
        console.error('Erro ao carregar tarefas:', err);
        setLoadingTasks(false);
      }
    };
    
    fetchAllTasks();
  }, [projects]);

  // Função para calcular as estatísticas
  const updateStats = (projectsData: Project[], tasksData: Task[]) => {
    const pendingTasks = tasksData.filter(task => task.status === 'pending').length;
    const completedTasks = tasksData.filter(task => task.status === 'completed').length;
    
    // Contar membros únicos em todos os projetos
    const allMembersIds = new Set<number>();
    projectsData.forEach(project => {
      project.members.forEach(member => {
        allMembersIds.add(member.user_id);
      });
    });
    
    setStats([
      { id: 1, name: 'Projetos Ativos', value: projectsData.length.toString() },
      { id: 2, name: 'Tarefas Pendentes', value: pendingTasks.toString() },
      { id: 3, name: 'Tarefas Concluídas', value: completedTasks.toString() },
      { id: 4, name: 'Colaboradores', value: allMembersIds.size.toString() }
    ]);
  };

  // Função para calcular o progresso de um projeto
  const calculateProjectProgress = (projectId: number): number => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    return progressService.calculateProgress(projectTasks);
  };

  // Função para determinar o status do projeto
  const getProjectStatus = (projectId: number): string => {
    const progress = calculateProjectProgress(projectId);
    return progressService.getProjectStatus(progress);
  };

  return (
    <div className="bg-theme-primary min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Boas-vindas e estatísticas */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-theme-primary">Olá, {user?.name}!</h1>
          <p className="mt-1 text-sm text-theme-secondary">
            Bem-vindo ao seu painel de controle. Aqui está um resumo de suas atividades.
          </p>
          
          {/* Estatísticas */}
          <dl className="mt-4 sm:mt-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="overflow-hidden rounded-lg bg-theme-surface px-4 py-5 shadow-sm border border-theme sm:p-6"
              >
                <dt className="truncate text-sm font-medium text-theme-secondary">{stat.name}</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-primary">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tabs para navegação */}
        <div className="mb-4 sm:mb-6 border-b border-theme">
          <nav className="-mb-px flex overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('projects')}
              className={`${
                activeTab === 'projects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
              } whitespace-nowrap py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 m-2 transition-colors duration-200`}
            >
              Projetos
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`${
                activeTab === 'tasks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
              } whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 transition-colors duration-200`}
            >
              Tarefas
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`${
                activeTab === 'team'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
              } whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 transition-colors duration-200`}
            >
              Equipe
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
              } whitespace-nowrap m-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm flex-shrink-0 transition-colors duration-200`}
            >
              Perfil
            </button>
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-theme-surface shadow-sm border border-theme rounded-lg p-4 sm:p-6">
          {/* Tab de Projetos */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg font-medium text-gray-900">Meus Projetos</h2>
                <Link to="/projects/new">
                  <Button variant="primary" className="w-full sm:w-auto hover:border-white">
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Novo Projeto
                  </Button>
                </Link>
              </div>
              
              {loadingProjects ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              ) : projects.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-theme">
                      <thead className="bg-theme">
                        <tr>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Nome
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Progresso
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Membros
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-surface divide-y divide-theme">
                        {projects.map((project) => (
                          <tr key={project.id}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-theme-primary">{project.name}</div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                getProjectStatus(project.id) === 'Em progresso' ? 'bg-blue-100 text-blue-800' : 
                                getProjectStatus(project.id) === 'Concluído' ? 'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {getProjectStatus(project.id)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-theme rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${calculateProjectProgress(project.id)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-theme-secondary mt-1">{calculateProjectProgress(project.id)}%</span>
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                              <div className="flex -space-x-2 overflow-hidden">
                                {project.members.slice(0, 3).map((member) => (
                                  <div 
                                    key={member.id}
                                    className="h-6 w-6 rounded-full bg-primary-lighter flex items-center justify-center text-white text-xs"
                                    title={member.user.name}
                                  >
                                    {member.user.name.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {project.members.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-theme flex items-center justify-center text-theme-secondary text-xs">
                                    +{project.members.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/projects/${project.id}`} className="text-primary hover:text-primary-dark mr-3">
                                <span className="hidden sm:inline">Visualizar</span>
                                <span className="sm:hidden">Ver</span>
                              </Link>
                              <Link to={`/projects/${project.id}/edit`} className="text-theme-secondary hover:text-theme-primary">
                                <span className="hidden sm:inline">Editar</span>
                                <span className="sm:hidden">Edit</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-theme p-4 text-center rounded-md">
                  <p className="text-sm text-theme-secondary">
                    Nenhum projeto para exibir no momento.
                  </p>
                  <Link to="/projects/new">
                    <Button className="mt-4" variant="primary">
                      Criar Novo Projeto
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tab de Tarefas */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg font-medium text-theme-primary">Minhas Tarefas</h2>
                <Button variant="primary" className="w-full sm:w-auto" onClick={() => setActiveTab('projects')}>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nova Tarefa
                </Button>
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tasks.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-theme">
                      <thead className="bg-theme">
                        <tr>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Tarefa
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Projeto
                          </th>
                          <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Data Limite
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Prioridade
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-surface divide-y divide-theme">
                        {tasks.map((task) => {
                          const project = projects.find(p => p.id === task.project_id);
                          return (
                            <tr key={task.id}>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-theme-primary">{task.title}</div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                                {project?.name || 'Desconhecido'}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Não definido'}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority === 'high' ? 'Alta' : 
                                   task.priority === 'medium' ? 'Média' : 
                                   task.priority === 'low' ? 'Baixa' : 'Urgente'}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                  task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {task.status === 'pending' ? 'Pendente' : 
                                   task.status === 'in_progress' ? 'Em progresso' : 
                                   'Concluída'}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link 
                                  to={`/projects/${task.project_id}/tasks/${task.id}`} 
                                  className="text-primary hover:text-primary-dark"
                                >
                                  <span className="hidden sm:inline">Detalhes</span>
                                  <span className="sm:hidden">Ver</span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-theme p-4 text-center rounded-md">
                  <p className="text-sm text-theme-secondary">
                    Nenhuma tarefa para exibir no momento.
                  </p>
                  <Button 
                    className="mt-4" 
                    variant="primary"
                    onClick={() => setActiveTab('projects')}
                  >
                    Ir para Projetos
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tab de Equipe - Mantido simples, pode ser expandido depois */}
          {activeTab === 'team' && (
            <div>
              <h2 className="text-lg font-medium text-theme-primary mb-4">Membros da Equipe</h2>
              <div className="bg-theme p-4 rounded-md text-center">
                <p className="text-sm text-theme-secondary">
                  Você tem {stats[3].value} colaboradores em seus projetos.
                </p>
              </div>
            </div>
          )}

          {/* Tab de Perfil - Mantido simples, pode ser expandido depois */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium text-theme-primary mb-4">Meu Perfil</h2>
              <div className="bg-theme p-4 rounded-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-lighter flex items-center justify-center text-white text-lg font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-theme-primary">{user?.name}</h3>
                    <p className="text-sm text-theme-secondary">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-theme-secondary">
                    Você está trabalhando em {projects.length} projetos e tem {tasks.filter(t => t.status !== 'completed').length} tarefas pendentes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 