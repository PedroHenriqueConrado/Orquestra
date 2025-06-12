import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { theme } = useTheme();
  const location = useLocation();

  // Mapeamento de rotas para labels amigáveis
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    profile: 'Perfil',
    projects: 'Projetos',
    messages: 'Mensagens',
    notifications: 'Notificações',
    new: 'Novo',
    edit: 'Editar',
    tasks: 'Tarefas'
  };

  // Se não foram fornecidos items, gera automaticamente baseado na rota atual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className={`text-sm ${
              theme === 'dark'
                ? 'text-dark-muted hover:text-dark-text'
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
          >
            Home
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <svg
              className={`h-5 w-5 ${
                theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {index === breadcrumbItems.length - 1 ? (
              <span
                className={`ml-2 text-sm font-medium ${
                  theme === 'dark' ? 'text-dark-text' : 'text-gray-900'
                }`}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className={`ml-2 text-sm ${
                  theme === 'dark'
                    ? 'text-dark-muted hover:text-dark-text'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 