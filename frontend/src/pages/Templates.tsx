import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import templateService, { type ProjectTemplate } from '../services/template.service';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import FormField from '../components/ui/FormField';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionRestriction } from '../hooks/usePermissionRestriction';
import PermissionRestrictionModal from '../components/ui/PermissionRestrictionModal';

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    category: '',
    is_public: false
  });
  const [useFormData, setUseFormData] = useState({
    name: '',
    description: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleRestrictedAction, isModalOpen, currentRestriction, closeModal } = usePermissionRestriction();

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [selectedCategory, searchTerm]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      
      const data = await templateService.getTemplates(filters);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await templateService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await templateService.createFromProject(1, createFormData); // TODO: Pegar projectId dinamicamente
      setShowCreateModal(false);
      setCreateFormData({ name: '', description: '', category: '', is_public: false });
      loadTemplates();
    } catch (error) {
      console.error('Erro ao criar template:', error);
    }
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const project = await templateService.createProjectFromTemplate(selectedTemplate.id, useFormData);
      setShowUseModal(false);
      setUseFormData({ name: '', description: '' });
      setSelectedTemplate(null);
      // Redirecionar para o novo projeto
      window.location.href = `/projects/${project.id}`;
    } catch (error) {
      console.error('Erro ao usar template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return;
    
    try {
      await templateService.deleteTemplate(templateId);
      loadTemplates();
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    }
  };

  const openUseModal = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setUseFormData({ name: '', description: '' });
    setShowUseModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTemplateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!handleRestrictedAction('create_template')) {
      return;
    }
    // Se tem permissão, abre o modal de criação
    setShowCreateModal(true);
  };

  const handleDeleteTemplateClick = (templateId: number) => {
    if (!handleRestrictedAction('manage_templates')) {
      return;
    }
    // Se tem permissão, executa a exclusão
    handleDeleteTemplate(templateId);
  };

  if (loading) {
    return (
      <div className="bg-theme-primary min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-theme-surface shadow rounded-lg p-6 flex justify-center border border-theme">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-theme-primary min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left mr-2"></i> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-theme-primary">Templates de Projeto</h1>
            <p className="text-theme-secondary mt-2">
              Use templates para criar projetos rapidamente com estruturas pré-definidas
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-theme-primary mb-3 sm:mb-0">Templates</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar templates..."
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
            <button onClick={handleCreateTemplateClick}>
              <Button variant="primary" className="w-full sm:w-auto">
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Criar Template
              </Button>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-theme-primary mb-2">
                Categoria
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-theme-surface text-theme-primary"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-theme-surface rounded-lg shadow-sm border border-theme p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-theme-primary truncate flex-1 mr-2">
                  {template.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {template.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                  )}
                  {template.is_public ? (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Público
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      Privado
                    </span>
                  )}
                </div>
              </div>

              {template.description && (
                <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-theme-secondary mb-4">
                <span>Criado por {template.creator.name}</span>
                <span>{new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-theme-secondary mb-4">
                <span>{template._count.tasks} tarefas</span>
                <span>{template._count.members} membros</span>
              </div>

              {/* Tarefas do template */}
              {template.tasks.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-theme-primary mb-2">
                    Tarefas incluídas:
                  </h4>
                  <div className="space-y-1">
                    {template.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between text-xs">
                        <span className="text-theme-secondary truncate">
                          {task.title}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                    {template.tasks.length > 3 && (
                      <span className="text-xs text-theme-secondary">
                        +{template.tasks.length - 3} mais tarefas
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => openUseModal(template)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white text-sm"
                >
                  Usar Template
                </Button>
                {template.created_by === user?.id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteTemplateClick(template.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-md transition-colors"
                  >
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-theme-secondary text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-theme-secondary">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro template para começar'
              }
            </p>
          </div>
        )}

        {/* Modal de Criar Template */}
        <Dialog
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Criar Template"
        >
          <div className="space-y-4">
            <FormField
              id="template-name"
              label="Nome do Template"
              value={createFormData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder="Digite o nome do template"
              required
            />
            <div className="mb-4">
              <label htmlFor="template-description" className="block text-sm font-medium mb-1 text-theme-primary">
                Descrição
              </label>
              <textarea
                id="template-description"
                value={createFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Digite uma descrição (opcional)"
                className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-theme-surface text-theme-primary"
                rows={3}
              />
            </div>
            <FormField
              id="template-category"
              label="Categoria"
              value={createFormData.category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData({ ...createFormData, category: e.target.value })}
              placeholder="Digite uma categoria (opcional)"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={createFormData.is_public}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData({ ...createFormData, is_public: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_public" className="text-sm text-theme-secondary">
                Template público (visível para todos os usuários)
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={!createFormData.name}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Criar Template
            </Button>
          </div>
        </Dialog>

        {/* Modal de Usar Template */}
        <Dialog
          isOpen={showUseModal}
          onClose={() => setShowUseModal(false)}
          title={`Usar Template: ${selectedTemplate?.name}`}
        >
          <div className="space-y-4">
            <FormField
              id="project-name"
              label="Nome do Projeto"
              value={useFormData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseFormData({ ...useFormData, name: e.target.value })}
              placeholder="Digite o nome do novo projeto"
              required
            />
            <div className="mb-4">
              <label htmlFor="project-description" className="block text-sm font-medium mb-1 text-theme-primary">
                Descrição
              </label>
              <textarea
                id="project-description"
                value={useFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUseFormData({ ...useFormData, description: e.target.value })}
                placeholder="Digite uma descrição (opcional)"
                className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-theme-surface text-theme-primary"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowUseModal(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUseTemplate}
              disabled={!useFormData.name}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Criar Projeto
            </Button>
          </div>
        </Dialog>

        {/* Modal de restrição de permissão */}
        {isModalOpen && currentRestriction && user && (
          <PermissionRestrictionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            action={currentRestriction.action}
            requiredRoles={currentRestriction.requiredRoles}
            currentRole={user.role}
          />
        )}
      </main>
    </div>
  );
};

export default Templates; 