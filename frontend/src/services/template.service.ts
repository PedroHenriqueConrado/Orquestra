import api from './api.service';

export interface TemplateTask {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  order_index: number;
}

export interface TemplateMember {
  id: number;
  user_id: number;
  role: 'developer' | 'supervisor' | 'tutor' | 'project_manager' | 'team_leader' | 'admin';
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_by: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  tasks: TemplateTask[];
  members: TemplateMember[];
  _count: {
    tasks: number;
    members: number;
  };
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category?: string;
  is_public?: boolean;
}

export interface CreateProjectFromTemplateData {
  name: string;
  description?: string;
  members?: number[];
}

class TemplateService {
  /**
   * Listar templates disponíveis
   */
  async getTemplates(filters?: { category?: string; search?: string }): Promise<ProjectTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/templates?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Buscar template por ID
   */
  async getTemplateById(templateId: number): Promise<ProjectTemplate> {
    const response = await api.get(`/templates/${templateId}`);
    return response.data.data;
  }

  /**
   * Criar template a partir de projeto existente
   */
  async createFromProject(projectId: number, templateData: CreateTemplateData): Promise<ProjectTemplate> {
    const response = await api.post(`/templates/from-project/${projectId}`, templateData);
    return response.data.data;
  }

  /**
   * Criar projeto a partir de template
   */
  async createProjectFromTemplate(templateId: number, projectData: CreateProjectFromTemplateData): Promise<any> {
    const token = localStorage.getItem('orquestra_token');
    console.log('[FRONTEND] Token antes da chamada:', token);
    try {
      const response = await api.post(`/templates/${templateId}/create-project`, projectData);
      console.log('[FRONTEND] Resposta da criação de projeto via template:', response.status, response.data);
      return response.data.data;
    } catch (error) {
      console.error('[FRONTEND] Erro ao criar projeto via template:', error);
      throw error;
    }
  }

  /**
   * Deletar template
   */
  async deleteTemplate(templateId: number): Promise<void> {
    await api.delete(`/templates/${templateId}`);
  }

  /**
   * Buscar categorias disponíveis
   */
  async getCategories(): Promise<string[]> {
    const response = await api.get('/templates/categories');
    return response.data.data;
  }
}

export default new TemplateService(); 