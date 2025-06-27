import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedDashboardWidgets from '../components/AdvancedDashboardWidgets';
import DashboardFilters from '../components/DashboardFilters';
import DashboardBuilder from '../components/DashboardBuilder';
import DetailedAnalytics from '../components/DetailedAnalytics';
import { useTheme } from '../contexts/ThemeContext';
import advancedDashboardService from '../services/advanced-dashboard.service';
import type { DashboardData, DashboardFilters as Filters } from '../services/advanced-dashboard.service';

interface DashboardFilters {
  dateRange: string;
  projects: number[];
  users: number[];
  status: string[];
  priority: string[];
}

const AdvancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: '30d',
    projects: [],
    users: [],
    status: [],
    priority: []
  });

  // Verificar permissão de acesso
  useEffect(() => {
    if (user && user.role !== 'project_manager') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Se não tem permissão, não renderiza nada
  if (user && user.role !== 'project_manager') {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'analytics', label: 'Análises Detalhadas', icon: '📈' },
    { id: 'builder', label: 'Construtor de Relatórios', icon: '🔧' }
  ];

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await advancedDashboardService.getAdvancedMetrics(filters);
        setDashboardData(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError(err.message || 'Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Exportar relatório
  const handleExportReport = async () => {
    try {
      const blob = await advancedDashboardService.exportReport(filters, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório');
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-primary min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-theme-primary min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-background' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Botão Voltar */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-theme-secondary hover:text-theme-primary transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Voltar</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">
              Dashboard Avançado
            </h1>
            <p className="text-theme-secondary">
              Análises detalhadas e relatórios customizáveis para seus projetos
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <DashboardFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-theme">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
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
          </div>

          {/* Conteúdo das Tabs */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-theme-primary mb-4">
                  Visão Geral
                </h2>
                <AdvancedDashboardWidgets filters={filters} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-theme-primary mb-4">
                  Análises Detalhadas
                </h2>
                <DetailedAnalytics filters={filters} onFiltersChange={handleFilterChange} />
              </div>
            )}

            {activeTab === 'builder' && (
              <div>
                <h2 className="text-xl font-semibold text-theme-primary mb-4">
                  Construtor de Relatórios
                </h2>
                <DashboardBuilder filters={filters} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedDashboard; 