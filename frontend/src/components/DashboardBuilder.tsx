import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
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
import advancedDashboardService from '../services/advanced-dashboard.service';

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

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table';
  title: string;
  dataSource: string;
  chartType?: 'line' | 'bar' | 'doughnut';
  metricType?: 'total_projects' | 'total_tasks' | 'total_users' | 'completed_tasks' | 'overdue_tasks';
  config: any;
}

interface DashboardFilters {
  dateRange: string;
  projects: number[];
  users: number[];
  status: string[];
  priority: string[];
}

interface DashboardBuilderProps {
  filters: DashboardFilters;
}

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

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({ filters }) => {
  const { theme } = useTheme();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // Carregar dados do dashboard
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await advancedDashboardService.getAdvancedMetrics(filters);
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Layout padrão responsivo
  const defaultLayout = {
    lg: [
      { i: 'metric-1', x: 0, y: 0, w: 3, h: 2 },
      { i: 'metric-2', x: 3, y: 0, w: 3, h: 2 },
      { i: 'metric-3', x: 6, y: 0, w: 3, h: 2 },
      { i: 'metric-4', x: 9, y: 0, w: 3, h: 2 },
      { i: 'chart-1', x: 0, y: 2, w: 6, h: 4 },
      { i: 'chart-2', x: 6, y: 2, w: 6, h: 4 },
    ],
    md: [
      { i: 'metric-1', x: 0, y: 0, w: 6, h: 2 },
      { i: 'metric-2', x: 6, y: 0, w: 6, h: 2 },
      { i: 'metric-3', x: 0, y: 2, w: 6, h: 2 },
      { i: 'metric-4', x: 6, y: 2, w: 6, h: 2 },
      { i: 'chart-1', x: 0, y: 4, w: 12, h: 4 },
      { i: 'chart-2', x: 0, y: 8, w: 12, h: 4 },
    ],
    sm: [
      { i: 'metric-1', x: 0, y: 0, w: 12, h: 2 },
      { i: 'metric-2', x: 0, y: 2, w: 12, h: 2 },
      { i: 'metric-3', x: 0, y: 4, w: 12, h: 2 },
      { i: 'metric-4', x: 0, y: 6, w: 12, h: 2 },
      { i: 'chart-1', x: 0, y: 8, w: 12, h: 4 },
      { i: 'chart-2', x: 0, y: 12, w: 12, h: 4 },
    ],
  };

  // Widgets disponíveis para adicionar
  const availableWidgets = [
    { type: 'metric', title: 'Métrica Simples', icon: '📊', description: 'Exibe uma métrica específica' },
    { type: 'chart', title: 'Gráfico de Linha', icon: '📈', description: 'Mostra tendências ao longo do tempo' },
    { type: 'chart', title: 'Gráfico de Barras', icon: '📊', description: 'Compara valores entre categorias' },
    { type: 'chart', title: 'Gráfico de Pizza', icon: '🥧', description: 'Mostra proporções de um todo' },
    { type: 'table', title: 'Tabela de Dados', icon: '📋', description: 'Exibe dados em formato tabular' },
  ];

  const addWidget = (widgetType: string) => {
    const newWidget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType as 'chart' | 'metric' | 'table',
      title: `Novo ${widgetType}`,
      dataSource: 'tasks',
      chartType: widgetType === 'chart' ? 'line' : undefined,
      metricType: widgetType === 'metric' ? 'total_tasks' : undefined,
      config: {},
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  const getMetricValue = (metricType: string) => {
    if (!dashboardData) return 0;
    
    switch (metricType) {
      case 'total_projects': return dashboardData.metrics.totalProjects;
      case 'total_tasks': return dashboardData.metrics.totalTasks;
      case 'total_users': return dashboardData.metrics.totalUsers;
      case 'completed_tasks': return dashboardData.metrics.completedTasks;
      case 'overdue_tasks': return dashboardData.metrics.overdueTasks;
      default: return 0;
    }
  };

  const getMetricLabel = (metricType: string) => {
    switch (metricType) {
      case 'total_projects': return 'Projetos';
      case 'total_tasks': return 'Tarefas';
      case 'total_users': return 'Usuários';
      case 'completed_tasks': return 'Concluídas';
      case 'overdue_tasks': return 'Atrasadas';
      default: return 'Métrica';
    }
  };

  const getChartData = (widget: Widget) => {
    if (!dashboardData) return null;

    switch (widget.dataSource) {
      case 'tasks_by_status':
        return {
          labels: dashboardData.trends.tasksByStatus.map(item => item.status),
          datasets: [{
            label: 'Tarefas',
            data: dashboardData.trends.tasksByStatus.map(item => item.count),
            backgroundColor: [
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
            ],
            borderColor: [
              'rgba(245, 158, 11, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(34, 197, 94, 1)',
            ],
            borderWidth: 1,
          }]
        };

      case 'tasks_by_priority':
        return {
          labels: dashboardData.trends.tasksByPriority.map(item => item.priority),
          datasets: [{
            data: dashboardData.trends.tasksByPriority.map(item => item.count),
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 2,
          }]
        };

      case 'activity_by_day':
        return {
          labels: dashboardData.trends.activityByDay.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          }),
          datasets: [{
            label: 'Atividades',
            data: dashboardData.trends.activityByDay.map(item => item.count),
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
          }]
        };

      case 'performance_by_user':
        return {
          labels: dashboardData.trends.performanceByUser.map(item => item.user),
          datasets: [
            {
              label: 'Tarefas Concluídas',
              data: dashboardData.trends.performanceByUser.map(item => item.completed),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1,
            },
            {
              label: 'Total de Tarefas',
              data: dashboardData.trends.performanceByUser.map(item => item.total),
              backgroundColor: 'rgba(156, 163, 175, 0.8)',
              borderColor: 'rgba(156, 163, 175, 1)',
              borderWidth: 1,
            }
          ]
        };

      default:
        return null;
    }
  };

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

  const renderWidget = (widget: Widget) => {
    const handleWidgetClick = () => {
      if (isEditMode) {
        setSelectedWidget(widget.id);
      }
    };

    switch (widget.type) {
      case 'metric':
        const metricValue = getMetricValue(widget.metricType || 'total_tasks');
        const metricLabel = getMetricLabel(widget.metricType || 'total_tasks');
        
        return (
          <div 
            className={`bg-theme-surface rounded-lg p-4 shadow-sm border border-theme h-full cursor-pointer transition-all duration-200 ${
              selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={handleWidgetClick}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-theme-primary">{widget.title}</h3>
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-2xl font-bold text-theme-primary">{metricValue}</div>
            <p className="text-xs text-theme-secondary">{metricLabel}</p>
          </div>
        );

      case 'chart':
        const chartData = getChartData(widget);
        
        return (
          <div 
            className={`bg-theme-surface rounded-lg p-4 shadow-sm border border-theme h-full cursor-pointer transition-all duration-200 ${
              selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={handleWidgetClick}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-theme-primary">{widget.title}</h3>
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="h-32">
              {chartData ? (
                widget.chartType === 'line' ? (
                  <Line data={chartData} options={chartOptions} />
                ) : widget.chartType === 'doughnut' ? (
                  <Doughnut data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )
              ) : (
                <div className="flex items-center justify-center h-full bg-theme-secondary rounded">
                  <span className="text-theme-secondary">Sem dados</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'table':
        return (
          <div 
            className={`bg-theme-surface rounded-lg p-4 shadow-sm border border-theme h-full cursor-pointer transition-all duration-200 ${
              selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={handleWidgetClick}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-theme-primary">{widget.title}</h3>
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="h-32 overflow-auto">
              {dashboardData ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme">
                      <th className="text-left py-2 text-theme-secondary">Status</th>
                      <th className="text-right py-2 text-theme-secondary">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.trends.tasksByStatus.map((item, index) => (
                      <tr key={index} className="border-b border-theme">
                        <td className="py-2 text-theme-primary">{item.status}</td>
                        <td className="py-2 text-right text-theme-primary">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full bg-theme-secondary rounded">
                  <span className="text-theme-secondary">Sem dados</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const saveReport = () => {
    const report = {
      id: Date.now(),
      name: `Relatório ${new Date().toLocaleDateString('pt-BR')}`,
      widgets,
      filters,
      createdAt: new Date().toISOString()
    };

    setSavedReports([...savedReports, report]);
    
    // Salvar no localStorage
    const reports = JSON.parse(localStorage.getItem('dashboardReports') || '[]');
    reports.push(report);
    localStorage.setItem('dashboardReports', JSON.stringify(reports));
    
    alert('Relatório salvo com sucesso!');
  };

  const loadSavedReports = () => {
    const reports = JSON.parse(localStorage.getItem('dashboardReports') || '[]');
    setSavedReports(reports);
  };

  useEffect(() => {
    loadSavedReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header do construtor */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-lg font-medium text-theme-primary">Construtor de Relatórios</h3>
          <p className="text-sm text-theme-secondary">
            Crie relatórios personalizados arrastando e soltando widgets
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isEditMode
                ? 'bg-primary text-white'
                : 'bg-theme-secondary text-theme-primary hover:bg-theme-surface'
            }`}
          >
            {isEditMode ? 'Sair do Modo Edição' : 'Modo Edição'}
          </button>
          <button 
            onClick={saveReport}
            disabled={widgets.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors duration-200"
          >
            Salvar Relatório
          </button>
        </div>
      </div>

      {/* Barra de ferramentas */}
      {isEditMode && (
        <div className="bg-theme-surface rounded-lg p-4 shadow-sm border border-theme">
          <h4 className="text-sm font-medium text-theme-primary mb-3">Widgets Disponíveis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableWidgets.map((widget, index) => (
              <button
                key={index}
                onClick={() => addWidget(widget.type)}
                className="flex items-center space-x-3 p-3 bg-theme-secondary hover:bg-theme-surface text-theme-primary rounded-md text-sm transition-colors duration-200 text-left"
              >
                <span className="text-lg">{widget.icon}</span>
                <div>
                  <div className="font-medium">{widget.title}</div>
                  <div className="text-xs text-theme-secondary">{widget.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área do dashboard */}
      <div className="bg-theme-surface rounded-lg p-4 shadow-sm border border-theme min-h-96">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Nenhum widget adicionado
            </h3>
            <p className="text-theme-secondary mb-4">
              Ative o modo edição e adicione widgets para criar seu relatório
            </p>
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium transition-colors duration-200"
            >
              Começar a Construir
            </button>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={defaultLayout}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 1, xxs: 1 }}
            rowHeight={100}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={(layout, layouts) => {
              console.log('Layout changed:', layouts);
            }}
          >
            {widgets.map((widget) => (
              <div key={widget.id}>
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>

      {/* Painel de configuração */}
      {isEditMode && selectedWidget && (
        <div className="bg-theme-surface rounded-lg p-4 shadow-sm border border-theme">
          <h4 className="text-sm font-medium text-theme-primary mb-3">Configurar Widget</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Título
              </label>
              <input
                type="text"
                value={widgets.find(w => w.id === selectedWidget)?.title || ''}
                onChange={(e) => updateWidget(selectedWidget, { title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 bg-theme-secondary border-theme text-theme-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite o título do widget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Fonte de Dados
              </label>
              <select 
                value={widgets.find(w => w.id === selectedWidget)?.dataSource || 'tasks'}
                onChange={(e) => updateWidget(selectedWidget, { dataSource: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 bg-theme-secondary border-theme text-theme-primary focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="tasks_by_status">Tarefas por Status</option>
                <option value="tasks_by_priority">Tarefas por Prioridade</option>
                <option value="activity_by_day">Atividade por Dia</option>
                <option value="performance_by_user">Performance por Usuário</option>
              </select>
            </div>
            {widgets.find(w => w.id === selectedWidget)?.type === 'metric' && (
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Tipo de Métrica
                </label>
                <select 
                  value={widgets.find(w => w.id === selectedWidget)?.metricType || 'total_tasks'}
                  onChange={(e) => updateWidget(selectedWidget, { metricType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 bg-theme-secondary border-theme text-theme-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="total_projects">Total de Projetos</option>
                  <option value="total_tasks">Total de Tarefas</option>
                  <option value="total_users">Total de Usuários</option>
                  <option value="completed_tasks">Tarefas Concluídas</option>
                  <option value="overdue_tasks">Tarefas Atrasadas</option>
                </select>
              </div>
            )}
            {widgets.find(w => w.id === selectedWidget)?.type === 'chart' && (
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Tipo de Gráfico
                </label>
                <select 
                  value={widgets.find(w => w.id === selectedWidget)?.chartType || 'line'}
                  onChange={(e) => updateWidget(selectedWidget, { chartType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 bg-theme-secondary border-theme text-theme-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="line">Linha</option>
                  <option value="bar">Barras</option>
                  <option value="doughnut">Pizza</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relatórios salvos */}
      {savedReports.length > 0 && (
        <div className="bg-theme-surface rounded-lg p-4 shadow-sm border border-theme">
          <h4 className="text-sm font-medium text-theme-primary mb-3">Relatórios Salvos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedReports.map((report) => (
              <div key={report.id} className="p-3 bg-theme-secondary rounded-md">
                <h5 className="font-medium text-theme-primary">{report.name}</h5>
                <p className="text-xs text-theme-secondary">
                  {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-theme-secondary">
                  {report.widgets.length} widgets
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilder; 