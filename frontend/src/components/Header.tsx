import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import NotificationIcon from './NotificationIcon';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import Tooltip from './ui/Tooltip';

const Header: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Simular contagem de notificações não lidas (substituir por lógica real)
  useEffect(() => {
    // TODO: Implementar lógica real de contagem de notificações
    setUnreadNotifications(3);
  }, []);

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Função para lidar com atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + D para Dashboard
      if (e.altKey && e.key === 'd') {
        navigate('/dashboard');
      }
      // Alt + P para Projetos
      if (e.altKey && e.key === 'p') {
        navigate('/projects');
      }
      // Alt + M para Mensagens
      if (e.altKey && e.key === 'm') {
        navigate('/messages');
      }
      // Alt + T para alternar tema
      if (e.altKey && e.key === 't') {
        // TODO: Implementar toggle de tema
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <header className={`${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} shadow transition-colors duration-200 sticky top-0 z-50`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Tooltip content="Página inicial" position="bottom">
                <Link to="/" className="flex items-center">
                  <img className="h-8 w-auto" src="/src/assets/favicon.svg" alt="Orquestra" />
                  <span className={`ml-2 text-xl font-bold ${theme === 'dark' ? 'text-primary-light hover:text-primary-lighter' : 'text-primary-dark hover:text-primary-lighter'} transition-colors duration-200`}>
                    Orquestra
                  </span>
                </Link>
              </Tooltip>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Tooltip content="Dashboard (Alt + D)" position="bottom">
                <Link
                  to="/dashboard"
                  className={`${
                    isActiveRoute('/dashboard')
                      ? theme === 'dark' ? 'border-primary-light text-dark-text' : 'border-primary text-gray-900'
                      : theme === 'dark' ? 'border-transparent text-dark-muted hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 hover:scale-105`}
                  aria-current={isActiveRoute('/dashboard') ? 'page' : undefined}
                >
                  Dashboard
                </Link>
              </Tooltip>
              <Tooltip content="Projetos (Alt + P)" position="bottom">
                <Link
                  to="/projects"
                  className={`${
                    isActiveRoute('/projects')
                      ? theme === 'dark' ? 'border-primary-light text-dark-text' : 'border-primary text-gray-900'
                      : theme === 'dark' ? 'border-transparent text-dark-muted hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 hover:scale-105`}
                  aria-current={isActiveRoute('/projects') ? 'page' : undefined}
                >
                  Projetos
                </Link>
              </Tooltip>
              <Tooltip content="Mensagens (Alt + M)" position="bottom">
                <Link
                  to="/messages"
                  className={`${
                    isActiveRoute('/messages')
                      ? theme === 'dark' ? 'border-primary-light text-dark-text' : 'border-primary text-gray-900'
                      : theme === 'dark' ? 'border-transparent text-dark-muted hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 hover:scale-105`}
                  aria-current={isActiveRoute('/messages') ? 'page' : undefined}
                >
                  Mensagens
                </Link>
              </Tooltip>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Tooltip content="Menu" position="bottom">
              <button
                type="button"
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  theme === 'dark' ? 'text-dark-muted hover:text-dark-text hover:bg-dark-accent' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 hover:scale-105`}
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Abrir menu principal</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </Tooltip>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Theme toggle button */}
            <Tooltip content="Alternar tema (Alt + T)" position="bottom">
              <div className="mr-4">
                <ThemeToggle className="transition-all duration-200 hover:scale-105" />
              </div>
            </Tooltip>
            
            {isLoggedIn ? (
              <>
                <Tooltip content={`${unreadNotifications} notificações não lidas`} position="bottom">
                  <div className="relative">
                    <NotificationIcon />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                </Tooltip>
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Tooltip content="Menu do usuário" position="bottom">
                      <Menu.Button 
                        className={`${theme === 'dark' ? 'bg-dark-accent' : 'bg-white'} rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:border-white transition-all duration-200 hover:scale-105`}
                        aria-label="Menu do usuário"
                      >
                        <span className="sr-only">Abrir menu do usuário</span>
                        <div className="h-8 w-8 rounded-full bg-primary-lighter flex items-center justify-center text-white font-semibold">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      </Menu.Button>
                    </Tooltip>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-dark-accent' : 'bg-white'} ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-200`}>
                      <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>{user?.name}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>{user?.email}</p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? (theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-100') : ''
                            } block px-4 py-2 text-sm ${theme === 'dark' ? 'text-dark-text hover:text-white' : 'text-gray-700 hover:text-white'} transition-all duration-200 hover:scale-105`}
                          >
                            Meu perfil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`${
                              active ? (theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-100') : ''
                            } block px-4 py-2 text-sm ${theme === 'dark' ? 'text-dark-text hover:text-white' : 'text-gray-700 hover:text-white'} transition-all duration-200 hover:scale-105`}
                          >
                            Configurações
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? (theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-100') : ''
                            } w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-dark-text hover:text-white' : 'text-gray-700 hover:text-white'} transition-all duration-200 hover:scale-105`}
                          >
                            Sair
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex space-x-4">
                <Tooltip content="Entrar no sistema" position="bottom">
                  <Link
                    to="/login"
                    className={`${theme === 'dark' ? 'text-dark-muted hover:text-dark-text' : 'text-gray-500 hover:text-gray-700'} px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105`}
                  >
                    Entrar
                  </Link>
                </Tooltip>
                <Tooltip content="Criar nova conta" position="bottom">
                  <Link
                    to="/register"
                    className={`${theme === 'dark' ? 'bg-primary-dark hover:bg-primary-darker' : 'bg-primary hover:bg-primary-dark'} text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105`}
                  >
                    Cadastrar
                  </Link>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className="sm:hidden"
          id="mobile-menu"
        >
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`${
                isActiveRoute('/dashboard')
                  ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                  : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActiveRoute('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`${
                isActiveRoute('/projects')
                  ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                  : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActiveRoute('/projects') ? 'page' : undefined}
            >
              Projetos
            </Link>
            <Link
              to="/messages"
              className={`${
                isActiveRoute('/messages')
                  ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                  : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActiveRoute('/messages') ? 'page' : undefined}
            >
              Mensagens
            </Link>
            {/* Theme toggle in mobile menu */}
            <div className="flex items-center pl-3 pr-4 py-2">
              <span className={`${theme === 'dark' ? 'text-dark-text' : 'text-gray-600'} mr-2`}>Alternar tema:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Transition>
    </header>
  );
};

export default Header; 