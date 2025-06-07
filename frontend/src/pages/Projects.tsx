import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import projectService from '../services/project.service';
import type { Project } from '../services/project.service';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progress.service';

type LocationState = {
  message?: string;
  type?: 'success' | 'error' | 'info';
};

const Projects: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [projectsProgress, setProjectsProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    // Verifica se há uma mensagem na navegação (ex: após criar um projeto)
    const state = location.state as LocationState;
    if (state?.message) {
      setNotification({
        message: state.message,
        type: state.type || 'info'
      });
      
      // Limpa o estado da navegação para que a mensagem não reapareça após refresh
      window.history.replaceState({}, document.title);
      
      // Define um timer para remover a notificação após 5 segundos
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Erro ao buscar projetos:', err);
      setError(err.message || 'Erro ao carregar projetos');
      
      // Se for erro de autenticação, redireciona para login
      if (err.message && err.message.includes('Sessão expirada')) {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter(project => project.id !== id));
      setNotification({
        message: 'Projeto excluído com sucesso!',
        type: 'success'
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir projeto');
    }
  };

  // Efeito para calcular o progresso dos projetos
  useEffect(() => {
    const calculateProjectsProgress = async () => {
      const progressMap: Record<number, number> = {};
      for (const project of projects) {
        const progress = await progressService.getProjectProgress(project.id);
        progressMap[project.id] = progress;
      }
      setProjectsProgress(progressMap);
    };
    calculateProjectsProgress();
  }, [projects]);

  // Função para determinar o status do projeto
  const getProjectStatus = (project: Project): string => {
    const progress = projectsProgress[project.id] || 0;
    return progressService.getProjectStatus(progress);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente para quando não há projetos
  const EmptyProjectsCard = () => (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-primary-lighter rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
        <p className="text-gray-600 mb-6">
          Você ainda não possui nenhum projeto cadastrado.
          <br />
          Crie seu primeiro projeto para começar a organizar suas tarefas.
        </p>
        <Link to="/projects/new">
          <Button variant="primary" className="hover:border-white">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Criar primeiro projeto
          </Button>
        </Link>
      </div>
    </div>
  );

  // Componente para mostrar erro
  const ErrorMessage = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ocorreu um erro</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="primary" onClick={loadProjects}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );

  // Componente para mostrar notificações
  const Notification = () => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'success' 
      ? 'bg-green-50 border-green-400' 
      : notification.type === 'error' 
        ? 'bg-red-50 border-red-400' 
        : 'bg-blue-50 border-blue-400';
    
    const textColor = notification.type === 'success' 
      ? 'text-green-700' 
      : notification.type === 'error' 
        ? 'text-red-700' 
        : 'text-blue-700';
    
    return (
      <div className={`mb-4 p-3 ${bgColor} border-l-4 rounded-md flex justify-between items-center`}>
        <span className={textColor}>{notification.message}</span>
        <button 
          onClick={() => setNotification(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-0">Projetos</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Buscar projetos..."
              />
            </div>
            <Link to="/projects/new">
              <Button 
                variant="primary"
                className="w-full sm:w-auto hover:border-white"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Projeto
              </Button>
            </Link>
          </div>
        </div>

        <Notification />

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 truncate">
                        <Link to={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          getProjectStatus(project) === 'Em Progresso'
                            ? 'bg-yellow-100 text-yellow-800'
                            : getProjectStatus(project) === 'Concluído'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getProjectStatus(project)}
                      </p>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className="text-sm font-medium text-gray-700">{projectsProgress[project.id] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${projectsProgress[project.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.members.slice(0, 3).map((member, index) => (
                        <div 
                          key={member.id} 
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-primary-lighter text-white flex items-center justify-center text-xs font-medium"
                          title={member.user.name}
                        >
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div 
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-medium"
                          title={`${project.members.length - 3} outros membros`}
                        >
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/projects/${project.id}`}
                        className=" hover:text-black hover:border-white inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Ver
                      </Link>
                      <Link 
                        to={`/projects/${project.id}/edit`}
                        className="hover:text-black hover:border-white inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-black bg-primary-lighter hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="hover:text-black hover:border-white inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum projeto encontrado</h3>
            {searchTerm ? (
              <p className="mt-1 text-sm text-gray-500">
                Não encontramos projetos com o termo "{searchTerm}".
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Comece criando seu primeiro projeto.
              </p>
            )}
            <div className="mt-6">
              <Link to="/projects/new">
                <Button variant="primary">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Criar Projeto
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects; 