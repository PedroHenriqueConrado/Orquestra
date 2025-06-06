import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'tasks'>(
    (tabParam === 'tasks' || tabParam === 'members') ? tabParam : 'overview'
  );

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

  // ... resto do componente continua igual ...
};

export default ProjectDetails; 