import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/projects', icon: 'projects', label: 'Projetos' },
    { path: '/templates', icon: 'template', label: 'Templates' },
    { path: '/messages', icon: 'messages', label: 'Mensagens' },
    { path: '/notifications', icon: 'notifications', label: 'Notificações' },
    { path: '/profile', icon: 'profile', label: 'Meu Perfil' }
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img src="/src/assets/favicon.svg" alt="Orquestra" className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">Orquestra</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'color-white text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="material-icons text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil do Usuário */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src="/default-avatar.png"
              alt="Foto de perfil"
              className="h-10 w-10 rounded-full object-cover cursor-pointer"
              onClick={() => navigate('/profile')}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 