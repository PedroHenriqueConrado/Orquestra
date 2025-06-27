import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import projectService from '../services/project.service';
import type { ProjectData, Project } from '../services/project.service';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: ''
  });
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProject = async () => {
      try {
        setIsFetching(true);
        setError(null);
        const data = await projectService.getProjectById(Number(id));
        setProject(data);
        setFormData({
          name: data.name,
          description: data.description || ''
        });
        setIsFetching(false);
      } catch (err: any) {
        console.error('Erro ao buscar projeto:', err);
        setError(err.message || 'Erro ao carregar dados do projeto');
        setIsFetching(false);
      }
    };

    fetchProject();
    
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isFetching) {
        setIsFetching(false);
        setError('Tempo limite excedido ao carregar projeto. Por favor, tente novamente.');
      }
    }, 15000); // 15 segundos
    
    return () => clearTimeout(timeout);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome do projeto é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await projectService.updateProject(Number(id), formData);
      navigate('/projects');
    } catch (err: any) {
      console.error('Erro ao atualizar projeto:', err);
      setError(err.message || 'Ocorreu um erro ao atualizar o projeto');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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

  if (error && !project) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-500 text-center">
              <p>{error}</p>
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Editar Projeto</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atualize as informações do seu projeto.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Projeto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Digite o nome do projeto"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Descreva os objetivos e escopo do projeto"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/projects')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="save"
                isLoading={isLoading}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProject; 