import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-primary-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Menu Hamburguer */}
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-primary-darker focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
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
            </button>
          </div>

          {/* Logo / Nome */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold tracking-wider text-primary-lighter">
                Orquestra
              </Link>
            </div>
          </div>

          {/* Perfil */}
          <div>
            <Link to="/login" className="p-1 rounded-full text-white hover:bg-primary-darker focus:outline-none">
              <span className="sr-only">Ver perfil</span>
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu lateral */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-primary-darker overflow-y-auto transition duration-300 ease-in-out z-50`}
      >
        <div className="pt-5 pb-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary-lighter">Orquestra</span>
            </div>
            <button
              onClick={toggleMenu}
              className="rounded-md text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <span className="sr-only">Fechar menu</span>
              <svg
                className="h-6 w-6"
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
            </button>
          </div>
          <div className="mt-6">
            <nav className="grid gap-y-8">
              <Link
                to="/"
                className="-m-3 p-3 flex items-center rounded-md hover:bg-primary-dark"
                onClick={toggleMenu}
              >
                <span className="ml-3 text-base font-medium text-white">
                  Início
                </span>
              </Link>
              <Link
                to="/dashboard"
                className="-m-3 p-3 flex items-center rounded-md hover:bg-primary-dark"
                onClick={toggleMenu}
              >
                <span className="ml-3 text-base font-medium text-white">
                  Dashboard
                </span>
              </Link>
              <Link
                to="/projects"
                className="-m-3 p-3 flex items-center rounded-md hover:bg-primary-dark"
                onClick={toggleMenu}
              >
                <span className="ml-3 text-base font-medium text-white">
                  Projetos
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Overlay para fechar o menu quando clicar fora */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={toggleMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar; 