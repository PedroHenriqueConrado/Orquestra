import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  // Stats fictícios para demonstração
  const stats = [
    { id: 1, name: 'Projetos Ativos', value: '3' },
    { id: 2, name: 'Tarefas Pendentes', value: '12' },
    { id: 3, name: 'Tarefas Concluídas', value: '24' },
    { id: 4, name: 'Colaboradores', value: '8' }
  ];

  // Dados fictícios para projetos
  const projects = [
    { id: 1, name: 'Projeto Website', status: 'Em progresso', progress: 65, team: 'Desenvolvimento Web' },
    { id: 2, name: 'App Mobile', status: 'Em progresso', progress: 35, team: 'Equipe Mobile' },
    { id: 3, name: 'Design System', status: 'Pendente', progress: 15, team: 'Design' }
  ];

  // Dados fictícios para tarefas
  const tasks = [
    { id: 1, name: 'Desenvolver página inicial', dueDate: '2023-07-15', priority: 'Alta', status: 'Em progresso' },
    { id: 2, name: 'Corrigir bugs de layout', dueDate: '2023-07-12', priority: 'Média', status: 'Pendente' },
    { id: 3, name: 'Implementar autenticação', dueDate: '2023-07-20', priority: 'Alta', status: 'Pendente' },
    { id: 4, name: 'Revisão de código', dueDate: '2023-07-10', priority: 'Baixa', status: 'Concluída' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Boas-vindas e estatísticas */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Olá, {user?.name}!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo ao seu painel de controle. Aqui está um resumo de suas atividades.
          </p>
          
          {/* Estatísticas */}
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
              >
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="mt-1 text-3xl font-semibold text-primary">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tabs para navegação */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`${
                activeTab === 'projects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Projetos
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`${
                activeTab === 'tasks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tarefas
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`${
                activeTab === 'team'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Equipe
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Perfil
            </button>
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Tab de Projetos */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Meus Projetos</h2>
                <Button variant="primary">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Novo Projeto
                </Button>
              </div>
              
              {projects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progresso
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipe
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              project.status === 'Em progresso' ? 'bg-blue-100 text-blue-800' : 
                              project.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.team}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-primary hover:text-primary-dark mr-3">Visualizar</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900">Editar</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 text-center rounded-md">
                  <p className="text-sm text-gray-500">
                    Nenhum projeto para exibir no momento.
                  </p>
                  <Button className="mt-4" variant="primary">
                    Criar Novo Projeto
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tab de Tarefas */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Minhas Tarefas</h2>
                <Button variant="primary">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nova Tarefa
                </Button>
              </div>

              {tasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarefa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Limite
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prioridade
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{task.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.priority === 'Alta' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === 'Em progresso' ? 'bg-blue-100 text-blue-800' : 
                              task.status === 'Concluída' ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-primary hover:text-primary-dark mr-3">Visualizar</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900">Editar</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 text-center rounded-md">
                  <p className="text-sm text-gray-500">
                    Nenhuma tarefa para exibir no momento.
                  </p>
                  <Button className="mt-4" variant="primary">
                    Criar Nova Tarefa
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tab de Perfil */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Meu Perfil</h2>
              
              <div className="bg-primary-lighter bg-opacity-10 p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary-dark flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Informações Pessoais</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        value={user?.name}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        value={user?.email}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Função
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        value={user?.role}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Ações da Conta</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                    <Button variant="primary" fullWidth>
                      Editar Perfil
                    </Button>
                    <Button variant="outline" fullWidth>
                      Alterar Senha
                    </Button>
                    <Button variant="secondary" fullWidth>
                      Gerenciar Notificações
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab de Equipe */}
          {activeTab === 'team' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Minha Equipe</h2>
                <Button variant="primary">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Convidar Membros
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 text-center rounded-md">
                <p className="text-sm text-gray-500">
                  Esta funcionalidade estará disponível em breve.
                </p>
                <Button className="mt-4" variant="primary">
                  Configurar Equipe
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 