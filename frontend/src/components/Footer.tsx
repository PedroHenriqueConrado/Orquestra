import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-darker text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e descrição */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-lighter">Orquestra</h2>
            <p className="text-gray-300 text-sm">
              Simplificando a gestão de projetos corporativos para equipes de todos os tamanhos.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-primary-light">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-lighter text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-lighter text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-primary-lighter text-sm">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-primary-lighter text-sm">
                  Planos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-primary-light">Contato</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">
                <span className="inline-block w-5 mr-2 text-primary-light">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                contato@orquestra.com.br
              </li>
              <li className="text-gray-300 text-sm">
                <span className="inline-block w-5 mr-2 text-primary-light">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                (11) 3456-7890
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Orquestra. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 