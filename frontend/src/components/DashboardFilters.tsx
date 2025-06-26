import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import advancedDashboardService from '../services/advanced-dashboard.service';

interface DashboardFiltersProps {
  filters: {
    dateRange: string;
    projects: number[];
    users: number[];
    status: string[];
    priority: string[];
  };
  onFilterChange: (filters: any) => void;
}

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, onFilterChange }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'completed', label: 'Concluída' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  // Carregar projetos e usuários quando expandir os filtros
  useEffect(() => {
    if (isExpanded && projects.length === 0) {
      loadProjects();
    }
    if (isExpanded && users.length === 0) {
      loadUsers();
    }
  }, [isExpanded]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await advancedDashboardService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await advancedDashboardService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ dateRange: value });
  };

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ status: newStatus });
  };

  const handlePriorityChange = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFilterChange({ priority: newPriority });
  };

  const handleProjectChange = (projectId: number) => {
    const newProjects = filters.projects.includes(projectId)
      ? filters.projects.filter(p => p !== projectId)
      : [...filters.projects, projectId];
    onFilterChange({ projects: newProjects });
  };

  const handleUserChange = (userId: number) => {
    const newUsers = filters.users.includes(userId)
      ? filters.users.filter(u => u !== userId)
      : [...filters.users, userId];
    onFilterChange({ users: newUsers });
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: '30d',
      projects: [],
      users: [],
      status: [],
      priority: []
    });
  };

  const activeFiltersCount = [
    filters.projects.length,
    filters.users.length,
    filters.status.length,
    filters.priority.length
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-theme-surface rounded-lg shadow-sm border border-theme p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-theme-primary">Filtros</h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-theme-secondary hover:text-theme-primary transition-colors duration-200"
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtros rápidos sempre visíveis */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className={`px-3 py-2 border rounded-md text-sm transition-colors duration-200 ${
              theme === 'dark'
                ? 'bg-dark-accent border-dark-border text-dark-text'
                : 'bg-white border-gray-300 text-gray-700'
            } focus:ring-2 focus:ring-primary focus:border-transparent`}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  filters.status.includes(option.value)
                    ? 'bg-primary text-white'
                    : 'bg-theme-secondary text-theme-secondary hover:bg-theme-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Prioridade
          </label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handlePriorityChange(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  filters.priority.includes(option.value)
                    ? 'bg-primary text-white'
                    : 'bg-theme-secondary text-theme-secondary hover:bg-theme-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros avançados (expandíveis) */}
      {isExpanded && (
        <div className="border-t border-theme pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Projetos Específicos
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {loading ? (
                  <div className="text-sm text-theme-secondary">Carregando projetos...</div>
                ) : projects.length > 0 ? (
                  projects.map(project => (
                    <label key={project.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.projects.includes(project.id)}
                        onChange={() => handleProjectChange(project.id)}
                        className="rounded border-theme text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-theme-secondary">{project.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-theme-secondary">Nenhum projeto encontrado</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Membros da Equipe
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {loading ? (
                  <div className="text-sm text-theme-secondary">Carregando usuários...</div>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <label key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.users.includes(user.id)}
                        onChange={() => handleUserChange(user.id)}
                        className="rounded border-theme text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-theme-secondary">{user.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-theme-secondary">Nenhum usuário encontrado</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters; 