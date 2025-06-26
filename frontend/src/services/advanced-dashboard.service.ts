import api from './api.service';

export interface DashboardFilters {
  dateRange?: string;
  projects?: number[];
  users?: number[];
  status?: string[];
  priority?: string[];
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  totalUsers: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export interface DashboardTrends {
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  activityByDay: { date: string; count: number }[];
  performanceByUser: { user: string; completed: number; total: number }[];
}

export interface DashboardData {
  metrics: DashboardMetrics;
  trends: DashboardTrends;
}

export interface ProjectAnalytics {
  taskMetrics: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
    estimatedHours: number;
    actualHours: number;
    efficiency: number;
  };
  memberPerformance: {
    user: string;
    role: string;
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  }[];
  timelineData: {
    date: string;
    created: number;
    completed: number;
  }[];
  riskAnalysis: {
    riskLevel: string;
    overdueTasks: number;
    highPriorityTasks: number;
    pendingTasks: number;
    recommendations: string[];
  };
}

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

class AdvancedDashboardService {
  async getAdvancedMetrics(filters: DashboardFilters = {}): Promise<DashboardData> {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.projects?.length) params.append('projects', filters.projects.join(','));
      if (filters.users?.length) params.append('users', filters.users.join(','));
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));

      const response = await api.get(`/advanced-dashboard/metrics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas avançadas:', error);
      throw error;
    }
  }

  async getProjectAnalytics(projectId: number, filters: DashboardFilters = {}): Promise<ProjectAnalytics> {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));

      const response = await api.get(`/advanced-dashboard/project/${projectId}/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análises do projeto:', error);
      throw error;
    }
  }

  async exportReport(filters: DashboardFilters, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.projects?.length) params.append('projects', filters.projects.join(','));
      if (filters.users?.length) params.append('users', filters.users.join(','));
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));
      
      params.append('format', format);

      const response = await api.get(`/advanced-dashboard/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }

  async saveDashboardLayout(layout: any, name: string): Promise<void> {
    try {
      await api.post('/advanced-dashboard/layouts', {
        name,
        layout
      });
    } catch (error) {
      console.error('Erro ao salvar layout do dashboard:', error);
      throw error;
    }
  }

  async getDashboardLayouts(): Promise<{ id: number; name: string; layout: any }[]> {
    try {
      const response = await api.get('/advanced-dashboard/layouts');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar layouts do dashboard:', error);
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const response = await api.get('/advanced-dashboard/projects');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/advanced-dashboard/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
}

export default new AdvancedDashboardService(); 