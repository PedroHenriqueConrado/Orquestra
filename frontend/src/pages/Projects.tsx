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
    <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-theme-secondary rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-2">Nenhum projeto encontrado</h3>
        <p className="text-theme-secondary mb-6">
          Você ainda não possui nenhum projeto cadastrado.
          <br />
          Crie seu primeiro projeto para começar a organizar suas tarefas.
        </p>
        <Link to="/projects/new">
          <Button variant="primary">
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
    <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-6">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-theme-primary mb-2">Ocorreu um erro</h3>
        <p className="text-theme-secondary mb-4">{error}</p>
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
          className="text-theme-muted hover:text-theme-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-theme-primary min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-theme-primary mb-3 sm:mb-0">Projetos</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-theme-surface text-theme-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link to="/projects/new">
              <Button variant="primary" className="w-full sm:w-auto">
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Projeto
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="secondary" className="w-full sm:w-auto">
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v12H4V5zm2 2v2h8V7H6zm0 4v2h5v-2H6z" />
                </svg>
                Usar Template
              </Button>
            </Link>
          </div>
        </div>

        <Notification />

        {loading && (
          <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-theme-secondary">Carregando projetos...</p>
          </div>
        )}

        {error && !loading && <ErrorMessage />}

        {!loading && !error && filteredProjects.length === 0 && projects.length === 0 && <EmptyProjectsCard />}

        {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-theme-secondary rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">Nenhum projeto encontrado</h3>
              <p className="text-theme-secondary mb-6">
                Não foi encontrado nenhum projeto com o termo "{searchTerm}".
                <br />
                Tente buscar com outro termo ou criar um novo projeto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Limpar busca
                </button>
                <Link to="/projects/new">
                  <Button variant="primary">
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Criar projeto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-theme-surface rounded-lg shadow-sm border border-theme overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-theme-primary truncate flex-1 mr-2">
                      {project.name}
                    </h3>
                    <div className="flex space-x-2">
                      <Link to={`/projects/${project.id}/edit`}>
                        <button className="text-theme-muted hover:text-theme-secondary transition-colors">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-theme-muted hover:text-red-600 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-theme-secondary">Progresso</span>
                        <span className="text-theme-primary font-medium">{projectsProgress[project.id] || 0}%</span>
                      </div>
                      <div className="w-full bg-theme-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${projectsProgress[project.id] || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getProjectStatus(project) === 'Em progresso' ? 'bg-blue-100 text-blue-800' : 
                        getProjectStatus(project) === 'Concluído' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getProjectStatus(project)}
                      </span>
                      <span className="text-xs text-theme-muted">
                        {project.members.length} membro{project.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-theme">
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects; 