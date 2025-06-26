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

interface DashboardData {
  metrics: {
    totalProjects: number;
    totalTasks: number;
    totalUsers: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
  trends: {
    tasksByStatus: { status: string; count: number }[];
    tasksByPriority: { priority: string; count: number }[];
    activityByDay: { date: string; count: number }[];
    performanceByUser: { user: string; completed: number; total: number }[];
  };
}

interface DashboardFilters {
  dateRange: string;
  projects: number[];
  users: number[];
  status: string[];
  priority: string[];
}

interface AdvancedDashboardWidgetsProps {
  filters: DashboardFilters;
}

const AdvancedDashboardWidgets: React.FC<AdvancedDashboardWidgetsProps> = ({ filters }) => {
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await advancedDashboardService.getAdvancedMetrics(filters);
        setData(dashboardData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="animate-pulse">
            <div className="h-4 bg-theme-secondary rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-theme-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="text-center text-theme-secondary">
            <p>{error || 'Nenhum dado disponível'}</p>
          </div>
        </div>
      </div>
    );
  }

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

  // Dados para o gráfico de linha (atividade por dia)
  const activityData = {
    labels: data.trends.activityByDay.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Atividades',
        data: data.trends.activityByDay.map(item => item.count),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados para o gráfico de barras (tarefas por status)
  const statusData = {
    labels: data.trends.tasksByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Tarefas',
        data: data.trends.tasksByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // Amarelo para pendente
          'rgba(59, 130, 246, 0.8)',  // Azul para em progresso
          'rgba(34, 197, 94, 0.8)',   // Verde para concluída
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de rosca (tarefas por prioridade)
  const priorityData = {
    labels: data.trends.tasksByPriority.map(item => item.priority),
    datasets: [
      {
        data: data.trends.tasksByPriority.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Verde para baixa
          'rgba(245, 158, 11, 0.8)',  // Amarelo para média
          'rgba(251, 146, 60, 0.8)',  // Laranja para alta
          'rgba(239, 68, 68, 0.8)',   // Vermelho para urgente
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Dados para o gráfico de barras (performance por usuário)
  const performanceData = {
    labels: data.trends.performanceByUser.map(item => item.user),
    datasets: [
      {
        label: 'Tarefas Concluídas',
        data: data.trends.performanceByUser.map(item => item.completed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total de Tarefas',
        data: data.trends.performanceByUser.map(item => item.total),
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-theme-secondary">Total de Projetos</p>
              <p className="text-2xl font-bold text-theme-primary">{data.metrics.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-theme-secondary">Total de Tarefas</p>
              <p className="text-2xl font-bold text-theme-primary">{data.metrics.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-theme-secondary">Membros da Equipe</p>
              <p className="text-2xl font-bold text-theme-primary">{data.metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-theme-secondary">Tarefas Atrasadas</p>
              <p className="text-2xl font-bold text-theme-primary">{data.metrics.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Atividade por Dia */}
      <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
        <h3 className="text-lg font-medium text-theme-primary mb-4">Atividade por Dia</h3>
        <div className="h-64">
          <Line data={activityData} options={chartOptions} />
        </div>
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tarefas por Status */}
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <h3 className="text-lg font-medium text-theme-primary mb-4">Tarefas por Status</h3>
          <div className="h-64">
            <Bar data={statusData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico de Tarefas por Prioridade */}
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <h3 className="text-lg font-medium text-theme-primary mb-4">Tarefas por Prioridade</h3>
          <div className="h-64">
            <Doughnut data={priorityData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Gráfico de Performance por Usuário */}
      {data.trends.performanceByUser.length > 0 && (
        <div className="bg-theme-surface rounded-lg p-6 shadow-sm border border-theme">
          <h3 className="text-lg font-medium text-theme-primary mb-4">Performance por Usuário</h3>
          <div className="h-64">
            <Bar data={performanceData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDashboardWidgets; 