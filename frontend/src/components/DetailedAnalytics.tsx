import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import advancedDashboardService from '../services/advanced-dashboard.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardFilters {
  dateRange: string;
  projects: number[];
  users: number[];
  status: string[];
  priority: string[];
}

interface ProjectAnalytics {
  taskMetrics: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
    estimatedHours: number;
    actualHours: number;
    efficiency: number;
  };
  memberPerformance: Array<{
    user: string;
    role: string;
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  }>;
  timelineData: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
  riskAnalysis: {
    riskLevel: string;
    overdueTasks: number;
    highPriorityTasks: number;
    pendingTasks: number;
    recommendations: string[];
  };
}

interface DetailedAnalyticsProps {
  filters: DashboardFilters;
  onFiltersChange?: (filters: Partial<DashboardFilters>) => void;
}

const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({ filters, onFiltersChange }) => {
  const { theme } = useTheme();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState('performance');

  // Carregar projetos quando o componente montar
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await advancedDashboardService.getProjects();
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };

    loadProjects();
  }, []);

  // Sincronizar selectedProject com filters.projects
  useEffect(() => {
    if (filters.projects && filters.projects.length > 0) {
      setSelectedProject(filters.projects[0]);
    }
  }, [filters.projects]);

  // Carregar análises do projeto selecionado
  useEffect(() => {
    const loadProjectAnalytics = async () => {
      if (!selectedProject) return;

      try {
        setLoading(true);
        const analytics = await advancedDashboardService.getProjectAnalytics(selectedProject, filters);
        setProjectAnalytics(analytics);
      } catch (error) {
        console.error('Erro ao carregar análises do projeto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectAnalytics();
  }, [selectedProject, filters]);

  // Configurações comuns para os gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#E0E0E0' : '#374151',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#E0E0E0' : '#374151',
        },
        grid: {
          color: theme === 'dark' ? '#404040' : '#E5E7EB',
        },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#E0E0E0' : '#374151',
        },
        grid: {
          color: theme === 'dark' ? '#404040' : '#E5E7EB',
        },
      },
    },
  };

  const renderPerformanceAnalysis = () => {
    if (!projectAnalytics) return null;

    const performanceData = {
      labels: projectAnalytics.memberPerformance.map(member => member.user),
      datasets: [
        {
          label: 'Taxa de Conclusão (%)',
          data: projectAnalytics.memberPerformance.map(member => member.completionRate),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Tarefas Atrasadas',
          data: projectAnalytics.memberPerformance.map(member => member.overdue),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Taxa de Conclusão</h4>
            <p className="text-3xl font-bold text-green-600">
              {projectAnalytics.taskMetrics.completionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-theme-secondary">
              {projectAnalytics.taskMetrics.completed} de {projectAnalytics.taskMetrics.total} tarefas
            </p>
          </div>
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Eficiência</h4>
            <p className="text-3xl font-bold text-blue-600">
              {projectAnalytics.taskMetrics.efficiency.toFixed(1)}%
            </p>
            <p className="text-sm text-theme-secondary">
              Horas reais vs estimadas
            </p>
          </div>
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Tarefas Atrasadas</h4>
            <p className="text-3xl font-bold text-red-600">
              {projectAnalytics.taskMetrics.overdue}
            </p>
            <p className="text-sm text-theme-secondary">
              Requerem atenção imediata
            </p>
          </div>
        </div>

        <div className="bg-theme-surface rounded-lg p-6 border border-theme">
          <h4 className="text-lg font-medium text-theme-primary mb-4">Performance por Membro</h4>
          <div className="h-80">
            <Bar data={performanceData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  const renderRiskAnalysis = () => {
    if (!projectAnalytics) return null;

    const riskData = {
      labels: ['Baixo', 'Médio', 'Alto'],
      datasets: [
        {
          label: 'Nível de Risco',
          data: [
            projectAnalytics.riskAnalysis.riskLevel === 'Baixo' ? 1 : 0,
            projectAnalytics.riskAnalysis.riskLevel === 'Médio' ? 1 : 0,
            projectAnalytics.riskAnalysis.riskLevel === 'Alto' ? 1 : 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const getRiskColor = (level: string) => {
      switch (level) {
        case 'Baixo': return 'text-green-600';
        case 'Médio': return 'text-yellow-600';
        case 'Alto': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Nível de Risco</h4>
            <p className={`text-3xl font-bold ${getRiskColor(projectAnalytics.riskAnalysis.riskLevel)}`}>
              {projectAnalytics.riskAnalysis.riskLevel}
            </p>
          </div>
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Tarefas Atrasadas</h4>
            <p className="text-3xl font-bold text-red-600">
              {projectAnalytics.riskAnalysis.overdueTasks}
            </p>
          </div>
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Alta Prioridade</h4>
            <p className="text-3xl font-bold text-orange-600">
              {projectAnalytics.riskAnalysis.highPriorityTasks}
            </p>
          </div>
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-2">Pendentes</h4>
            <p className="text-3xl font-bold text-yellow-600">
              {projectAnalytics.riskAnalysis.pendingTasks}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-4">Distribuição de Riscos</h4>
            <div className="h-64">
              <Doughnut data={riskData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-4">Recomendações</h4>
            <div className="space-y-3">
              {projectAnalytics.riskAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-theme-secondary">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineAnalysis = () => {
    if (!projectAnalytics) return null;

    const timelineData = {
      labels: projectAnalytics.timelineData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          label: 'Tarefas Criadas',
          data: projectAnalytics.timelineData.map(item => item.created),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Tarefas Concluídas',
          data: projectAnalytics.timelineData.map(item => item.completed),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="bg-theme-surface rounded-lg p-6 border border-theme">
          <h4 className="text-lg font-medium text-theme-primary mb-4">Timeline de Atividades</h4>
          <div className="h-80">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-4">Resumo de Atividades</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-theme-secondary">Total de tarefas criadas:</span>
                <span className="font-medium text-theme-primary">
                  {projectAnalytics.timelineData.reduce((sum, item) => sum + item.created, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-secondary">Total de tarefas concluídas:</span>
                <span className="font-medium text-theme-primary">
                  {projectAnalytics.timelineData.reduce((sum, item) => sum + item.completed, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-secondary">Dias com atividade:</span>
                <span className="font-medium text-theme-primary">
                  {projectAnalytics.timelineData.filter(item => item.created > 0 || item.completed > 0).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-theme-surface rounded-lg p-6 border border-theme">
            <h4 className="text-lg font-medium text-theme-primary mb-4">Tendências</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-theme-secondary">Criação de tarefas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-theme-secondary">Conclusão de tarefas</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {projectAnalytics.timelineData.length > 0 ? 
                    `Análise baseada em ${projectAnalytics.timelineData.length} dias de atividade` :
                    'Dados insuficientes para análise de tendências'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const analysisTabs = [
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'risks', label: 'Análise de Riscos', icon: '⚠️' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
  ];

  return (
    <div className="space-y-6">
      {/* Seletor de Projeto */}
      <div className="bg-theme-surface rounded-lg p-6 border border-theme">
        <h3 className="text-lg font-medium text-theme-primary mb-4">Selecionar Projeto</h3>
        <select
          value={selectedProject || ''}
          onChange={(e) => {
            const projectId = Number(e.target.value);
            setSelectedProject(projectId);
            if (onFiltersChange) {
              onFiltersChange({ projects: [projectId] });
            }
          }}
          className={`px-4 py-2 border rounded-md transition-colors duration-200 ${
            theme === 'dark'
              ? 'bg-dark-accent border-dark-border text-dark-text'
              : 'bg-white border-gray-300 text-gray-700'
          } focus:ring-2 focus:ring-primary focus:border-transparent`}
        >
          <option value="">Selecione um projeto</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && selectedProject && projectAnalytics && (
        <>
          {/* Tabs de Análise */}
          <div className="border-b border-theme">
            <nav className="-mb-px flex space-x-8">
              {analysisTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAnalysis(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeAnalysis === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo das Análises */}
          <div className="mt-6">
            {activeAnalysis === 'performance' && renderPerformanceAnalysis()}
            {activeAnalysis === 'risks' && renderRiskAnalysis()}
            {activeAnalysis === 'timeline' && renderTimelineAnalysis()}
          </div>
        </>
      )}

      {!loading && !selectedProject && (
        <div className="bg-theme-surface rounded-lg p-6 border border-theme text-center">
          <p className="text-theme-secondary">Selecione um projeto para ver as análises detalhadas</p>
        </div>
      )}
    </div>
  );
};

export default DetailedAnalytics; 