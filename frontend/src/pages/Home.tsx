import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import authService from '../services/auth.service';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-primary-dark">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-25"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Equipe trabalhando"
          />
          <div className="absolute inset-0 bg-primary-dark mix-blend-multiply" aria-hidden="true"></div>
        </div>
        <header className="relative pt-6 z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {/* Hamburger button */}
                <button 
                  onClick={toggleSidebar}
                  className="text-white mr-4 focus:outline-none"
                  aria-label="Menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img className="h-10 w-auto" src="/src/assets/favicon.svg" alt="Orquestra" />
                  </Link>
                  <Link to="/" className="ml-3 text-2xl font-bold text-white hover:text-yellow-500">
                    Orquestra
                  </Link>
                </div>
              </div>
              <div className="flex space-x-4">
                {isLoggedIn ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    href="/dashboard"
                    className="border-white text-black hover:bg-primary-dark hover:bg-opacity-50 hover:text-white"
                  >
                    Acessar Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      href="/login"
                      className="border-white text-black hover:bg-primary-dark hover:bg-opacity-50 hover:text-white"
                    >
                      Entrar
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      href="/register"
                      className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 hover:text-white hover:border-white"
                    >
                      Cadastrar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </header>
        
        {/* Sidebar / Mobile menu */}
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={toggleSidebar}
        >
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        </div>
        
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-dark shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <img className="h-8 w-auto" src="/src/assets/favicon.svg" alt="Orquestra" />
                <span className="ml-2 text-xl font-bold text-white">Orquestra</span>
              </div>
              <button 
                onClick={toggleSidebar}
                className="text-white focus:outline-none hover:border-white"
                aria-label="Fechar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              
              <hr className="border-gray-700 my-4" />
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="block text-white hover:text-primary-lighter transition-colors">
                  Dashboard
                  </Link>
                  <Link to="/projects" className="block text-white hover:text-primary-lighter transition-colors">
                    Projetos
                  </Link>
                  <Link to="/tasks" className="block text-white hover:text-primary-lighter transition-colors">
                    Tarefas
                  </Link>
                  <Link to="/teams" className="block text-white hover:text-primary-lighter transition-colors">
                    Equipes
                  </Link>
                  <Link to="/profile" className="block text-white hover:text-primary-lighter transition-colors">
                    Meu Perfil
                  </Link>
                  <Link to="/notifications" className="block text-white hover:text-primary-lighter transition-colors">
                    Notificações
                  </Link>
                  <button 
                    className="block text-white hover:text-primary-lighter transition-colors w-full text-center hover:border-white bg-primary-white hover:text-white"
                    onClick={() => {
                      authService.logout();
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block text-white hover:text-primary-lighter transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link 
                    to="/register" 
                    className="block text-white hover:text-primary-lighter hover:text-white transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Organize seus projetos como uma orquestra
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-primary-lighter">
            Transforme a gestão de projetos da sua empresa em uma sinfonia de
            produtividade e colaboração.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 hover:text-white hover:border-white"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              {isLoggedIn ? 'Acessar Dashboard' : 'Comece Agora - É Grátis'}
            </Button>
            
            {!isLoggedIn && (
              <Button 
                variant="outline" 
                size="lg" 
                href="/login"
                className="border-white text-black hover:bg-primary-dark hover:bg-opacity-50 hover:text-white"
              >
                Já tenho uma conta
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
              Funcionalidades
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-primary-dark sm:text-5xl sm:tracking-tight">
              Por que escolher o Orquestra?
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Nossa plataforma foi projetada para tornar a gestão de projetos corporativos
              mais simples, eficiente e colaborativa.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-primary-dark tracking-tight">
                      Organização simplificada
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Organize todos os seus projetos, tarefas e recursos em um único lugar. 
                      Visualize facilmente o progresso e mantenha todos na mesma página.
                    </p>
                    <div className="mt-5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        href="/register"
                        rightIcon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        Saiba mais
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-primary-dark tracking-tight">
                      Colaboração em tempo real
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Trabalhe em conjunto com sua equipe em tempo real. Compartilhe arquivos, 
                      atribua tarefas e comunique-se diretamente na plataforma.
                    </p>
                    <div className="mt-5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        href="/register"
                        rightIcon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        Saiba mais
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-primary-dark tracking-tight">
                      Análises e relatórios avançados
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Obtenha insights valiosos sobre o desempenho dos seus projetos com 
                      relatórios detalhados e análises personalizáveis.
                    </p>
                    <div className="mt-5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        href="/register"
                        rightIcon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        Saiba mais
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
              Depoimentos
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-primary-dark sm:text-5xl sm:tracking-tight">
              O que nossos clientes dizem
            </p>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/women/32.jpg" alt="Cliente" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-primary-darker">Ana Silva</h4>
                    <p className="text-gray-600">Gerente de Projetos, TechCorp</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-800">
                  "O Orquestra transformou a maneira como gerenciamos nossos projetos. A interface intuitiva e as 
                  ferramentas de colaboração permitiram que nossa equipe trabalhasse de forma mais eficiente."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/men/46.jpg" alt="Cliente" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-primary-darker">Carlos Mendes</h4>
                    <p className="text-gray-600">Diretor de Operações, InnovaSoft</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-800">
                  "Desde que começamos a usar o Orquestra, nossos prazos de entrega melhoraram em 30%. 
                  A visibilidade que temos do progresso dos projetos é incrível."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/women/68.jpg" alt="Cliente" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-primary-darker">Mariana Costa</h4>
                    <p className="text-gray-600">CEO, StartUp Ventures</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-800">
                  "Como uma startup em crescimento, precisávamos de uma ferramenta que crescesse conosco. 
                  O Orquestra nos ofereceu flexibilidade, escalabilidade e recursos que atenderam às nossas necessidades."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-primary-dark text-white border-t-4 border-primary">
        <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          {/* Newsletter Section */}
          <div className="pb-10 mb-10 border-b border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-white mb-2">Assine nossa newsletter</h3>
                <p className="text-gray-300">Receba dicas, novidades e atualizações sobre gerenciamento de projetos diretamente no seu e-mail.</p>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    className="px-4 py-3 bg-gray-800 text-white rounded-t-md sm:rounded-l-md sm:rounded-tr-none flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="primary"
                    className="rounded-b-md sm:rounded-r-md sm:rounded-bl-none"
                  >
                    Inscrever-se
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <img className="h-10 w-auto" src="/src/assets/favicon.svg" alt="Orquestra" />
                <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-primary">Orquestra</span>
              </div>
              <p className="mt-4 text-gray-300 max-w-md">
                A plataforma de gestão de projetos que transforma a produtividade e a
                colaboração da sua equipe em uma sinfonia perfeita.
              </p>
              <div className="mt-6 flex space-x-5">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-lighter">Empresa</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Sobre nós</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Carreiras</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Parceiros</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-lighter">Suporte</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Centro de ajuda</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contato</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Status do sistema</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Segurança</a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Termos de Serviço</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Política de Privacidade</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 