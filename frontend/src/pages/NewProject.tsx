import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import MemberSelector from '../components/MemberSelector';
import TaskCreator from '../components/TaskCreator';
import projectService from '../services/project.service';
import userService from '../services/user.service';
import type { ProjectData } from '../services/project.service';
import type { TaskData } from '../services/task.service';
import type { User } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSession, user: currentUser } = useAuth();
  const { theme } = useTheme();
  
  // Estado principal do formulário
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    initialTasks: [],
    initialMembers: []
  });
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  // Estados de erros de validação
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Carrega os usuários disponíveis quando o componente monta
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        // Não definimos erro aqui para não interferir com o fluxo principal
      }
    };
    
    fetchUsers();
  }, []);

  // Validação do formulário base (passo 1)
  const validateBasicForm = (): boolean => {
    const errors: {
      name?: string;
      description?: string;
    } = {};
    
    // Validação do nome (backend exige mínimo 3 caracteres, máximo 150)
    if (!formData.name.trim()) {
      errors.name = 'O nome do projeto é obrigatório';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'O nome do projeto deve ter no mínimo 3 caracteres';
    } else if (formData.name.trim().length > 150) {
      errors.name = 'O nome do projeto deve ter no máximo 150 caracteres';
    }
    
    // Validação da descrição (se fornecida, deve ter mínimo 10 caracteres, máximo 1000)
    if (formData.description && formData.description.trim()) {
      if (formData.description.trim().length < 10) {
        errors.description = 'A descrição deve ter no mínimo 10 caracteres';
      } else if (formData.description.trim().length > 1000) {
        errors.description = 'A descrição deve ter no máximo 1000 caracteres';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manipuladores de eventos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro específico do campo quando o usuário começa a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleMembersChange = (selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      initialMembers: selectedIds
    }));
  };

  const handleTasksChange = (tasks: TaskData[]) => {
    setFormData(prev => ({
      ...prev,
      initialTasks: tasks
    }));
  };

  const handleTryAgain = async () => {
    setError(null);
    setAuthError(false);
    
    // Tenta renovar a sessão antes de tentar novamente
    const sessionRefreshed = await refreshSession();
    
    if (sessionRefreshed) {
      // Se a sessão foi renovada com sucesso, continua com o envio do formulário
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      // Se não foi possível renovar a sessão, mostra um erro
      setError('Não foi possível renovar sua sessão. Por favor, faça login novamente.');
      setAuthError(true);
    }
  };

  // Função para avançar para o próximo passo
  const goToNextStep = () => {
    if (currentStep === 1 && validateBasicForm()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  // Função para voltar para o passo anterior
  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  // Função para submeter o formulário completo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação final
    if (!validateBasicForm()) {
      setCurrentStep(1);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAuthError(false);
      
      const newProject = await projectService.createProject(formData);
      console.log('Projeto criado com sucesso:', newProject);
      
      // Redireciona para a página de projetos com uma mensagem de sucesso
      navigate('/projects', { 
        state: { 
          message: 'Projeto criado com sucesso!', 
          type: 'success' 
        } 
      });
    } catch (err: any) {
      console.error('Erro ao criar projeto:', err);
      
      // Verifica se é um erro de autenticação
      if (err.message && (
          err.message.includes('Sessão expirada') || 
          err.message.includes('Token inválido') || 
          err.message.includes('401')
        )) {
        setAuthError(true);
      }
      
      // Trata erros de validação do backend
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        const fieldErrors: {
          name?: string;
          description?: string;
        } = {};
        
        backendErrors.forEach((error: any) => {
          if (error.path.includes('name')) {
            fieldErrors.name = error.message;
          } else if (error.path.includes('description')) {
            fieldErrors.description = error.message;
          }
        });
        
        setFormErrors(fieldErrors);
        setCurrentStep(1); // Volta para o primeiro passo se houver erros de validação
      } else {
        setError(err.message || 'Ocorreu um erro ao criar o projeto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Transforma os usuários disponíveis em formato adequado para o TaskCreator
  const availableMembersForTasks = [
    // Inclui o usuário atual (criador do projeto)
    ...(currentUser ? [{ id: currentUser.id, name: currentUser.name }] : []),
    
    // Inclui os membros selecionados no passo 2
    ...(formData.initialMembers ?? []).map(memberId => {
      const user = availableUsers.find(u => u.id === memberId);
      return user ? { id: user.id, name: user.name } : { id: memberId, name: `Usuário ${memberId}` };
    })
  ];

  // Barra de progresso
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold border-2 transition-colors duration-200 ${
            currentStep >= 1
              ? theme === 'dark'
                ? 'bg-primary text-white border-primary' 
                : 'bg-primary text-white border-primary'
              : theme === 'dark'
                ? 'bg-dark-accent text-dark-muted border-dark-border'
                : 'bg-gray-200 text-gray-500 border-gray-300'
          }`}>
            1
          </div>
          <div className={`ml-2 text-sm font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Informações Básicas</div>
        </div>
        <div className={`flex-1 mx-4 h-1 rounded transition-colors duration-200 ${
          currentStep >= 2
            ? theme === 'dark'
              ? 'bg-primary' : 'bg-primary'
            : theme === 'dark'
              ? 'bg-dark-border' : 'bg-gray-300'
        }`}></div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold border-2 transition-colors duration-200 ${
            currentStep >= 2
              ? theme === 'dark'
                ? 'bg-primary text-white border-primary' 
                : 'bg-primary text-white border-primary'
              : theme === 'dark'
                ? 'bg-dark-accent text-dark-muted border-dark-border'
                : 'bg-gray-200 text-gray-500 border-gray-300'
          }`}>
            2
          </div>
          <div className={`ml-2 text-sm font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Membros da Equipe</div>
        </div>
        <div className={`flex-1 mx-4 h-1 rounded transition-colors duration-200 ${
          currentStep >= 3
            ? theme === 'dark'
              ? 'bg-primary' : 'bg-primary'
            : theme === 'dark'
              ? 'bg-dark-border' : 'bg-gray-300'
        }`}></div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold border-2 transition-colors duration-200 ${
            currentStep >= 3
              ? theme === 'dark'
                ? 'bg-primary text-white border-primary' 
                : 'bg-primary text-white border-primary'
              : theme === 'dark'
                ? 'bg-dark-accent text-dark-muted border-dark-border'
                : 'bg-gray-200 text-gray-500 border-gray-300'
          }`}>
            3
          </div>
          <div className={`ml-2 text-sm font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Tarefas Iniciais</div>
        </div>
      </div>
    </div>
  );

  // Conteúdo do passo 1: Informações básicas
  const renderStep1 = () => (
    <>
      <div className="mb-4">
        <label htmlFor="name" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}> 
          Nome do Projeto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 ${
            formErrors.name
              ? 'border-red-500'
              : theme === 'dark'
                ? 'bg-dark-accent text-dark-text border-dark-border placeholder:text-dark-muted'
                : 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400'
          }`}
          placeholder="Digite o nome do projeto (mínimo 3 caracteres)"
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="description" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}> 
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 ${
            formErrors.description
              ? 'border-red-500'
              : theme === 'dark'
                ? 'bg-dark-accent text-dark-text border-dark-border placeholder:text-dark-muted'
                : 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400'
          }`}
          placeholder="Descreva os objetivos e escopo do projeto (mínimo 10 caracteres se preenchido)"
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
        )}
        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}> 
          A descrição é opcional, mas se preenchida deve ter pelo menos 10 caracteres.
        </p>
      </div>
    </>
  );

  // Conteúdo do passo 2: Seleção de membros
  const renderStep2 = () => (
    <div className="mb-6">
      <MemberSelector 
        selectedMembers={formData.initialMembers || []} 
        onChange={handleMembersChange}
        currentUserId={currentUser?.id}
      />
      <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}> 
        Você será automaticamente adicionado como gerente do projeto.
      </p>
    </div>
  );

  // Conteúdo do passo 3: Criação de tarefas iniciais
  const renderStep3 = () => (
    <div className="mb-6">
      <TaskCreator 
        tasks={formData.initialTasks || []} 
        onChange={handleTasksChange}
        availableMembers={availableMembersForTasks}
      />
      <div className={`mt-4 p-4 rounded-md border transition-colors duration-200 ${theme === 'dark' ? 'bg-dark-accent border-dark-border' : 'bg-blue-50 border-blue-100'}`}>
        <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-primary-light' : 'text-blue-800'}`}>Resumo do Projeto</h4>
        <dl className="mt-2 text-sm">
          <div className="flex justify-between py-1">
            <dt className={`${theme === 'dark' ? 'text-dark-muted' : 'text-gray-600'}`}>Nome:</dt>
            <dd className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>{formData.name}</dd>
          </div>
          {formData.description && (
            <div className="flex justify-between py-1">
              <dt className={`${theme === 'dark' ? 'text-dark-muted' : 'text-gray-600'}`}>Descrição:</dt>
              <dd className={`font-medium max-w-md truncate ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>{formData.description}</dd>
            </div>
          )}
          <div className="flex justify-between py-1">
            <dt className={`${theme === 'dark' ? 'text-dark-muted' : 'text-gray-600'}`}>Membros:</dt>
            <dd className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
              {currentUser ? 1 : 0} + {formData.initialMembers?.length || 0} membros
            </dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className={`${theme === 'dark' ? 'text-dark-muted' : 'text-gray-600'}`}>Tarefas:</dt>
            <dd className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>{formData.initialTasks?.length || 0} tarefas</dd>
          </div>
        </dl>
      </div>
    </div>
  );

  // Botões de navegação entre passos
  const renderStepButtons = () => (
    <div className="flex justify-end space-x-3">
      {/* Botão Cancelar (sempre visível) */}
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate('/dashboard')}
      >
        Cancelar
      </Button>
      
      {/* Botão Voltar (visível nos passos 2 e 3) */}
      {currentStep > 1 && (
        <Button
          type="button"
          variant="secondary"
          onClick={goToPreviousStep}
          disabled={isLoading}
        >
          Voltar
        </Button>
      )}
      
      {/* Botão Próximo (visível nos passos 1 e 2) */}
      {currentStep < 3 && (
        <Button
          type="button"
          variant="primary"
          onClick={goToNextStep}
          disabled={isLoading}
        >
          Próximo
        </Button>
      )}
      
      {/* Botão Criar Projeto (visível apenas no passo 3) */}
      {currentStep === 3 && (
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Criar Projeto
        </Button>
      )}
    </div>
  );

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-50'} min-h-screen transition-colors duration-200`}>
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Novo Projeto</h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
            Crie um novo projeto para organizar suas tarefas e colaboradores.
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} shadow rounded-lg overflow-hidden transition-colors duration-200`}>
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className={`mb-4 p-3 ${authError ? (theme === 'dark' ? 'bg-amber-900 border-amber-400 border-l-4' : 'bg-amber-50 border-amber-400 border-l-4') : (theme === 'dark' ? 'bg-red-900' : 'bg-red-50')} rounded-md`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${authError ? 'text-amber-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${authError ? (theme === 'dark' ? 'text-amber-200' : 'text-amber-800') : (theme === 'dark' ? 'text-red-200' : 'text-red-800')}`}>
                      {error}
                    </h3>
                    {authError && (
                      <div className="mt-2">
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleTryAgain}
                            className="px-2 py-1 text-xs"
                          >
                            Tentar novamente
                          </Button>
                          <Link to="/login">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="px-2 py-1 text-xs"
                            >
                              Fazer login
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Barra de progresso */}
            {renderProgressBar()}

            {/* Conteúdo dos passos */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Botões de navegação */}
            {renderStepButtons()}
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewProject; 