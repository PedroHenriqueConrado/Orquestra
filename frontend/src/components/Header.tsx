import React, { Fragment, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import NotificationIcon from './NotificationIcon';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-theme-surface shadow-sm border-b border-theme transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img className="h-8 w-auto" src="/src/assets/favicon.svg" alt="Orquestra" />
              </Link>
              <Link to="/" className="ml-2 text-xl font-bold text-theme-primary hover:text-primary transition-colors duration-200">
                Orquestra
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  isActiveRoute('/dashboard')
                    ? 'border-primary text-theme-primary'
                    : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className={`${
                  isActiveRoute('/projects')
                    ? 'border-primary text-theme-primary'
                    : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Projetos
              </Link>
              <Link
                to="/messages"
                className={`${
                  isActiveRoute('/messages')
                    ? 'border-primary text-theme-primary'
                    : 'border-transparent text-theme-secondary hover:border-theme hover:text-theme-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Mensagens
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
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
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Theme toggle button */}
            <ThemeToggle className="mr-4" />
            
            {isLoggedIn ? (
              <>
                <NotificationIcon/>
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-theme-surface rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:border-white transition-colors duration-200">
                      <span className="sr-only">Abrir menu do usuário</span>
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    </Menu.Button>
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
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-sm border border-theme py-1 bg-theme-surface ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-colors duration-200">
                      <div className="px-4 py-2 border-b border-theme">
                        <p className="text-sm font-semibold text-theme-primary">{user?.name}</p>
                        <p className="text-xs text-theme-muted">{user?.email}</p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-theme-secondary' : ''
                            } block px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors duration-200`}
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
                              active ? 'bg-theme-secondary' : ''
                            } block px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors duration-200`}
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
                              active ? 'bg-theme-secondary' : ''
                            } w-full text-left px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors duration-200`}
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
                <Link
                  to="/login"
                  className="text-theme-secondary hover:text-theme-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={`${
              isActiveRoute('/dashboard')
                ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className={`${
              isActiveRoute('/projects')
                ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Projetos
          </Link>
          <Link
            to="/messages"
            className={`${
              isActiveRoute('/messages')
                ? theme === 'dark' ? 'bg-dark-accent text-primary-light border-primary-light' : 'bg-primary-lighter text-primary border-primary'
                : theme === 'dark' ? 'border-transparent text-dark-muted hover:bg-dark-accent hover:border-dark-border hover:text-dark-text' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Mensagens
          </Link>
          {/* Adicionar botão de tema no menu mobile */}
          <div className="flex items-center pl-3 pr-4 py-2">
            <span className={`${theme === 'dark' ? 'text-dark-text' : 'text-gray-600'} mr-2`}>Alternar tema:</span>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile user profile menu */}
        {isLoggedIn ? (
          <div className={`pt-4 pb-3 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'} transition-colors duration-200`}>
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-lighter flex items-center justify-center text-white font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className={`text-base font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'} transition-colors duration-200`}>
                  {user?.name}
                </div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} transition-colors duration-200`}>
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-dark-text hover:bg-dark-accent' : 'text-gray-500 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Meu perfil
              </Link>
              <Link
                to="/settings"
                className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-dark-text hover:bg-dark-accent' : 'text-gray-500 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Configurações
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-dark-text hover:bg-dark-accent' : 'text-gray-500 hover:bg-gray-100'} transition-colors duration-200`}
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          <div className={`pt-4 pb-3 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'} transition-colors duration-200`}>
            <div className="flex flex-col items-start px-4 space-y-2">
              <Link
                to="/login"
                className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-500'} hover:bg-gray-100 transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'bg-primary-dark hover:bg-primary-darker' : 'bg-primary hover:bg-primary-dark'} text-white rounded-md transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cadastrar
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 