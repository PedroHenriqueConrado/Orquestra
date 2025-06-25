import api from './api.service';

export interface SearchResult {
  type: 'project' | 'task' | 'document';
  id: number;
  title: string;
  description?: string;
  relevance?: number;
  project?: {
    id: number;
    name: string;
  };
}

export interface ProjectSearchResult {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  _count: {
    tasks: number;
    members: number;
  };
}

export interface TaskSearchResult {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  created_at: string;
  project: {
    id: number;
    name: string;
  };
  assignedUser: {
    id: number;
    name: string;
  } | null;
}

export interface DocumentSearchResult {
  id: number;
  title: string;
  created_at: string;
  project: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  };
  versions: {
    id: number;
    version_number: number;
    original_name: string;
    uploaded_at: string;
  }[];
}

export interface GlobalSearchResponse {
  projects: ProjectSearchResult[];
  tasks: TaskSearchResult[];
  documents: DocumentSearchResult[];
  total: number;
}

export interface QuickSearchResult {
  type: 'project' | 'task';
  id: number;
  title: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  project?: {
    id: number;
    name: string;
  };
}

class SearchService {
  private API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  /**
   * Busca global em projetos, tarefas e documentos
   */
  async globalSearch(
    query: string,
    type: 'all' | 'projects' | 'tasks' | 'documents' = 'all',
    limit: number = 20
  ): Promise<GlobalSearchResponse> {
    try {
      const response = await api.get('/search/global', {
        params: {
          query,
          type,
          limit
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro na busca global:', error);
      throw new Error(
        error.response?.data?.error || 'Erro ao realizar busca global'
      );
    }
  }

  /**
   * Busca rápida para autocomplete
   */
  async quickSearch(query: string, limit: number = 5): Promise<QuickSearchResult[]> {
    try {
      const response = await api.get('/search/quick', {
        params: {
          query,
          limit
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro na busca rápida:', error);
      throw new Error(
        error.response?.data?.error || 'Erro ao realizar busca rápida'
      );
    }
  }

  /**
   * Formatar resultado de busca para exibição
   */
  formatSearchResult(result: ProjectSearchResult | TaskSearchResult | DocumentSearchResult): SearchResult {
    if ('name' in result) {
      // É um projeto
      return {
        type: 'project',
        id: result.id,
        title: result.name,
        description: result.description || undefined,
        project: {
          id: result.id,
          name: result.name
        }
      };
    } else if ('status' in result) {
      // É uma tarefa
      return {
        type: 'task',
        id: result.id,
        title: result.title,
        description: result.description || undefined,
        project: result.project
      };
    } else {
      // É um documento
      return {
        type: 'document',
        id: result.id,
        title: result.title,
        project: result.project
      };
    }
  }

  /**
   * Obter ícone baseado no tipo de resultado
   */
  getResultIcon(type: 'project' | 'task' | 'document'): string {
    switch (type) {
      case 'project':
        return '📁';
      case 'task':
        return '📋';
      case 'document':
        return '📄';
      default:
        return '🔍';
    }
  }

  /**
   * Obter cor baseada na prioridade da tarefa
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Obter texto da prioridade
   */
  getPriorityText(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Baixa';
      case 'medium':
        return 'Média';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  }

  /**
   * Obter cor baseada no status da tarefa
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Obter texto do status
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Progresso';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  }
}

export default new SearchService(); 