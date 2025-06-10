import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProjectChat from '../components/ProjectChat';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../services/project.service';
import Button from '../components/ui/Button';

const ChatTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectName = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const project = await projectService.getProjectById(Number(id));
        setProjectName(project.name);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao buscar projeto:', err);
        setError(err.message || 'Erro ao carregar detalhes do projeto');
        setLoading(false);
      }
    };

    fetchProjectName();
  }, [id]);

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-red-500">Você precisa estar logado para acessar esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Chat do Projeto: {projectName}
              </h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <p className="text-gray-600">
                  Esta é uma página de teste para o chat do projeto. Aqui você pode enviar e receber mensagens em tempo real.
                </p>
              </div>
              
              {id && !isNaN(Number(id)) && Number(id) > 0 ? (
                <ProjectChat projectId={Number(id)} />
              ) : (
                <div className="bg-red-50 p-4 rounded-md text-red-500 text-center">
                  <p>ID de projeto inválido</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.history.back()}
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatTest; 