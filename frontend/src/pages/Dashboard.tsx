import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import progressService from '../services/progress.service';
import { getRoleDisplayName, getRoleColor, getRoleIcon } from '../utils/roleTranslations';
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-theme-primary">Olá, {user?.name}!</h1>
              <p className="mt-1 text-sm text-theme-secondary">
                Bem-vindo ao seu painel de controle. Aqui está um resumo de suas atividades.
              </p>
            </div>
            
            {/* Cargo do usuário */}
            {user?.role && (
              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <span className="text-lg">{getRoleIcon(user.role)}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            )}
          </div>
          
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-theme-secondary">Carregando projetos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="secondary">
                    Tentar Novamente
                  </Button>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-theme-secondary mb-4">Nenhum projeto encontrado.</p>
                  <Link to="/projects/new">
                    <Button variant="primary">Criar Primeiro Projeto</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-theme border border-theme rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-theme-primary truncate">{project.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProjectStatus(project.id) === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {getProjectStatus(project.id)}
                        </span>
                      </div>
                      <p className="text-theme-secondary text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-theme-secondary">
                          {project.members.length} membro{project.members.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-theme-secondary">
                          {calculateProjectProgress(project.id)}% concluído
                        </span>
                      </div>
                      <div className="w-full bg-theme-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${calculateProjectProgress(project.id)}%` }}
                        ></div>
                      </div>
                      <div className="mt-3">
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="secondary" className="w-full text-sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab de Tarefas */}
          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Minhas Tarefas</h2>
              
              {loadingTasks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-theme-secondary">Carregando tarefas...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-theme-secondary mb-4">Nenhuma tarefa encontrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="bg-theme border border-theme rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-theme-primary">{task.title}</h4>
                          <p className="text-sm text-theme-secondary mt-1">{task.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status === 'completed' ? 'Concluída' :
                               task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                            </span>
                            <span className="text-xs text-theme-secondary">
                              {task.priority === 'high' ? 'Alta' :
                               task.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                            </span>
                          </div>
                        </div>
                        <Link to={`/projects/${task.project_id}/tasks/${task.id}`}>
                          <Button variant="secondary" className="text-sm">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {tasks.length > 10 && (
                    <div className="text-center pt-4">
                      <Link to="/tasks">
                        <Button variant="secondary">
                          Ver Todas as Tarefas ({tasks.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab de Equipe */}
          {activeTab === 'team' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Equipe</h2>
              <div className="text-center py-8">
                <p className="text-theme-secondary">Funcionalidade de equipe em desenvolvimento.</p>
              </div>
            </div>
          )}

          {/* Tab de Perfil */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Perfil</h2>
              <div className="bg-theme border border-theme rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{user?.name}</h3>
                    <p className="text-theme-secondary">{user?.email}</p>
                    {user?.role && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg">{getRoleIcon(user.role)}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Link to="/profile">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 