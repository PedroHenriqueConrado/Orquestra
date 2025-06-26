import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import taskService from '../services/task.service';
import projectService from '../services/project.service';
import type { TaskData, TaskStatus, TaskPriority } from '../services/task.service';
import type { Project } from '../services/project.service';
import { useTheme } from '../contexts/ThemeContext';

const NewTask: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [task, setTask] = useState<TaskData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    estimated_hours: undefined,
    assignees: []
  });
  
  // Carregar dados do projeto
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectById(Number(projectId));
        setProject(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao buscar projeto:', err);
        setError(err.message || 'Erro ao carregar dados do projeto');
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Converter valores numéricos quando apropriado
    if (type === 'number') {
      setTask(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setTask(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro de formulário quando o usuário digita
    setFormError(null);
  };
  
  // Enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!task.title.trim()) {
      setFormError('O título da tarefa é obrigatório');
      return;
    }
    
    if (task.title.trim().length < 3) {
      setFormError('O título da tarefa deve ter pelo menos 3 caracteres');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Criar a tarefa
      await taskService.createTask(Number(projectId), task);
      
      // Redirecionar para a página de detalhes do projeto com a aba de tarefas ativa
      navigate(`/projects/${projectId}?tab=tasks`);
    } catch (err: any) {
      console.error('Erro ao criar tarefa:', err);
      setError(err.message || 'Erro ao criar tarefa. Tente novamente.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className={theme === 'dark' ? 'bg-dark-background min-h-screen' : 'bg-gray-50 min-h-screen'}>
        <Header />
        <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className={theme === 'dark' ? 'bg-dark-secondary shadow rounded-lg p-6 flex justify-center' : 'bg-white shadow rounded-lg p-6 flex justify-center'}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className={theme === 'dark' ? 'bg-dark-background min-h-screen' : 'bg-gray-50 min-h-screen'}>
        <Header />
        <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className={theme === 'dark' ? 'bg-dark-secondary shadow rounded-lg p-6' : 'bg-white shadow rounded-lg p-6'}>
            <div className={theme === 'dark' ? 'text-red-400 text-center' : 'text-red-500 text-center'}>
              <p>{error || 'Projeto não encontrado'}</p>
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
    <div className={theme === 'dark' ? 'bg-dark-background min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <Header />
      <main className="max-w-3xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className={theme === 'dark' ? 'text-xl sm:text-2xl font-semibold text-dark-text' : 'text-xl sm:text-2xl font-semibold text-gray-900'}>Nova Tarefa</h1>
          <p className={theme === 'dark' ? 'mt-1 text-sm text-dark-muted' : 'mt-1 text-sm text-gray-500'}>
            Projeto: {project.name}
          </p>
        </div>
        
        {formError && (
          <div className={theme === 'dark' ? 'mb-4 p-3 bg-red-900/20 text-red-400 rounded-md text-sm border border-red-800' : 'mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200'}>
            {formError}
          </div>
        )}
        
        {error && (
          <div className={theme === 'dark' ? 'mb-4 p-3 bg-red-900/20 text-red-400 rounded-md text-sm border border-red-800' : 'mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200'}>
            {error}
          </div>
        )}
        
        <div className={theme === 'dark' ? 'bg-dark-secondary shadow rounded-lg overflow-hidden' : 'bg-white shadow rounded-lg overflow-hidden'}>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="title" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={task.title}
                onChange={handleChange}
                className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
                placeholder="Título da tarefa"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={task.description || ''}
                onChange={handleChange}
                rows={4}
                className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
                placeholder="Descrição detalhada da tarefa"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="status" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={task.status}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={task.priority}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
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
                <label htmlFor="due_date" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                  Data de Entrega
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={task.due_date || ''}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
                />
              </div>
              
              <div>
                <label htmlFor="estimated_hours" className={theme === 'dark' ? 'block text-sm font-medium text-dark-text mb-1' : 'block text-sm font-medium text-gray-700 mb-1'}>
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  id="estimated_hours"
                  name="estimated_hours"
                  value={task.estimated_hours || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary'}
                  placeholder="Ex: 4.5"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-b-2 border-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewTask; 