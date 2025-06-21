import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import GanttChart from '../components/GanttChart';
import DraggableTaskBoard from '../components/DraggableTaskBoard';
import tasksService from '../services/tasks.service';
import projectService from '../services/project.service';
import type { Task } from 'gantt-task-react';
import type { Project } from '../services/project.service';
import { Tab } from '@headlessui/react';

interface ProjectDashboardProps {}

const ProjectDashboard: React.FC<ProjectDashboardProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    progressPercentage: 0
  });

  // Carregar dados do projeto e tarefas
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar detalhes do projeto usando o serviço de projeto
        const projectData = await projectService.getProjectById(Number(projectId));
        setProject(projectData);
        
        // Buscar tarefas do projeto
        const tasksData = await tasksService.getProjectTasks(Number(projectId));
        setTasks(tasksData);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar dados do projeto:', err);
        setError(err.message || 'Ocorreu um erro ao carregar os dados do projeto. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  // Efeito para calcular estatísticas do projeto
  useEffect(() => {
    if (tasks.length > 0) {
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
      
      setProjectStats({
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        progressPercentage
      });
    }
  }, [tasks]);

  // Manipulador para quando uma tarefa é movida no quadro
  const handleTaskMove = async (taskId: number, newStatus: string, newPosition?: number) => {
    if (!projectId) {
      setError('ID do projeto não encontrado');
      return;
    }
    
    try {
      // Otimistic UI update - atualiza a UI antes da resposta do servidor
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Chamada para o backend, passando o projectId como primeiro parâmetro
      await tasksService.updateTaskStatus(Number(projectId), taskId, newStatus, newPosition);
      
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      
      // Em caso de erro, reverter a mudança no estado
      const originalTask = tasks.find(task => task.id === taskId);
      if (originalTask) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? originalTask : task
          )
        );
      }
      
      // Exibir mensagem de erro
      setError('Ocorreu um erro ao atualizar a tarefa. Por favor, tente novamente.');
    }
  };

  // Manipulador para alterações de data no gráfico Gantt
  const handleDateChange = async (task: Task) => {
    try {
      const taskId = parseInt(task.id);
      const dueDate = task.end.toISOString();
      
      // Atualizar a tarefa no backend
      await tasksService.updateTask(taskId, { due_date: dueDate });
      
      // Atualizar a lista de tarefas local
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, due_date: dueDate } : t
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar data da tarefa:', error);
      setError('Ocorreu um erro ao atualizar a data da tarefa. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[50vh] ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do projeto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-[50vh] ${theme === 'dark' ? 'text-dark-text bg-dark-secondary' : 'text-gray-700 bg-white'} p-6 rounded-lg shadow-md`}>
        <div className="text-center">
          <div className={`text-red-500 text-5xl mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-dark-accent hover:bg-dark-primary text-dark-text' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`flex justify-center items-center min-h-[50vh] ${theme === 'dark' ? 'text-dark-text bg-dark-secondary' : 'text-gray-700 bg-white'} p-6 rounded-lg shadow-md`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
          <p className="mb-4">O projeto solicitado não foi encontrado ou você não tem permissão para acessá-lo.</p>
          <button 
            onClick={() => navigate('/projects')}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-dark-accent hover:bg-dark-primary text-dark-text' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
          >
            Ver todos os projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 bg-theme-primary">
        <div className="flex justify-between items-center mb-6">
          <header className="mb-2">
            <h1 className="text-3xl font-bold mb-2 text-theme-primary">{project.name}</h1>
            {project.description && <p className="text-lg text-theme-secondary">{project.description}</p>}
          </header>
          
          <button 
            onClick={() => navigate(`/projects/${projectId}`)}
            className="px-4 py-2 rounded-md transition-colors duration-200 bg-theme-secondary hover:bg-theme-surface text-theme-primary"
          >
            Ver detalhes
          </button>
        </div>

        {/* Estatísticas do projeto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-4 bg-theme-surface shadow-sm border border-theme">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-theme-secondary">Total</p>
                <p className="text-2xl font-bold text-theme-primary">{projectStats.totalTasks}</p>
              </div>
              <div className="p-3 rounded-full bg-theme-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 bg-theme-surface shadow-sm border border-theme">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-theme-secondary">Pendentes</p>
                <p className="text-2xl font-bold text-theme-primary">{projectStats.pendingTasks}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 bg-theme-surface shadow-sm border border-theme">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-theme-secondary">Em Progresso</p>
                <p className="text-2xl font-bold text-theme-primary">{projectStats.inProgressTasks}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 bg-theme-surface shadow-sm border border-theme">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-theme-secondary">Concluídas</p>
                <p className="text-2xl font-bold text-theme-primary">{projectStats.completedTasks}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} shadow`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Progresso do Projeto</h3>
            <span className="text-sm font-semibold">{projectStats.progressPercentage}%</span>
          </div>
          <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-200'}`}>
            <div 
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${projectStats.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <Tab.Group>
          <Tab.List className={`flex space-x-1 rounded-xl ${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-100'} p-1 mb-6`}>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? theme === 'dark'
                      ? 'bg-dark-primary text-dark-text shadow'
                      : 'bg-white text-blue-700 shadow'
                    : theme === 'dark'
                    ? 'text-dark-muted hover:bg-dark-secondary'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                }
                `
              }
            >
              Quadro de Tarefas
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? theme === 'dark'
                      ? 'bg-dark-primary text-dark-text shadow'
                      : 'bg-white text-blue-700 shadow'
                    : theme === 'dark'
                    ? 'text-dark-muted hover:bg-dark-secondary'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                }
                `
              }
            >
              Gráfico Gantt
            </Tab>
          </Tab.List>
          
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-secondary text-dark-text' : 'bg-blue-50 text-blue-800'} border ${theme === 'dark' ? 'border-dark-accent' : 'border-blue-200'}`}>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium mb-1">Dicas para usar o dashboard:</p>
                <ul className="list-disc list-inside ml-2 text-sm">
                  <li>No <strong>Quadro de Tarefas</strong>, arraste e solte para mover tarefas entre as colunas de status</li>
                  <li>No <strong>Gráfico Gantt</strong>, você pode ajustar as datas arrastando as barras horizontalmente</li>
                  <li>Use o seletor na parte superior do Gantt para mudar a visualização (diária, semanal, mensal)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Tab.Panels>
            <Tab.Panel>
              <DraggableTaskBoard 
                tasks={tasks} 
                onTaskMove={handleTaskMove} 
              />
            </Tab.Panel>
            <Tab.Panel>
              <GanttChart 
                tasks={tasks} 
                onDateChange={handleDateChange} 
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
};

export default ProjectDashboard; 