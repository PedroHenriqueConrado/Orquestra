import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import directChatService from '../services/direct-chat.service';
import userService from '../services/user.service';
import type { UserChat } from '../services/direct-chat.service';
import { useAuth } from '../contexts/AuthContext';

const DirectMessages: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [startingChat, setStartingChat] = useState<boolean>(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await directChatService.getUserChats();
      setChats(data);
    } catch (err: any) {
      console.error('Erro ao buscar chats:', err);
      setError(err.message || 'Erro ao carregar chats');
      
      // Se for erro de autenticação, redireciona para login
      if (err.message && err.message.includes('Sessão expirada')) {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getAllUsers();
      // Filtra o usuário atual da lista
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenNewChatModal = () => {
    setShowNewChatModal(true);
    loadUsers();
  };

  const handleCloseNewChatModal = () => {
    setShowNewChatModal(false);
    setSelectedUserId(null);
  };

  const handleStartChat = async () => {
    if (!selectedUserId) return;
    
    try {
      setStartingChat(true);
      const chat = await directChatService.startChat(selectedUserId);
      handleCloseNewChatModal();
      // Navega para o chat recém-criado
      navigate(`/messages/${chat.id}`);
    } catch (err: any) {
      console.error('Erro ao iniciar chat:', err);
      alert(err.message || 'Erro ao iniciar chat');
    } finally {
      setStartingChat(false);
    }
  };

  // Filtra os chats pelo nome do outro usuário
  const filteredChats = chats.filter(chat => {
    if (!user) return false;
    const otherUser = chat.users.find(u => u.id !== user.id);
    if (!otherUser) return false;
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-theme-primary min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-theme-primary mb-3 sm:mb-0">Mensagens Diretas</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-theme-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-theme rounded-md leading-5 bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:placeholder-theme-secondary focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Buscar conversas..."
              />
            </div>
            <Button 
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleOpenNewChatModal}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nova Conversa
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="bg-theme-surface shadow rounded-lg overflow-hidden border border-theme">
            <ul className="divide-y divide-theme">
              {filteredChats.map((chat) => {
                if (!user) return null;
                const otherUser = chat.users.find(u => u.id !== user.id);
                const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
                
                return (
                  <li key={chat.id} className="hover:bg-theme">
                    <Link 
                      to={`/messages/${chat.id}`}
                      className="block px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-lighter flex items-center justify-center text-white font-medium">
                              {otherUser?.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4 truncate">
                            <p className="text-sm font-medium text-theme-primary">{otherUser?.name}</p>
                            <p className="text-sm text-theme-secondary truncate">
                              {lastMessage ? (
                                <>
                                  <span className="font-medium">{lastMessage.sender.id === user.id ? 'Você: ' : ''}</span>
                                  {lastMessage.message.length > 50 
                                    ? `${lastMessage.message.substring(0, 50)}...` 
                                    : lastMessage.message}
                                </>
                              ) : (
                                <span className="italic">Nenhuma mensagem</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-theme-secondary">
                            {lastMessage ? directChatService.formatMessageTime(lastMessage.created_at) : ''}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-primary text-white">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-theme-surface shadow rounded-lg p-6 text-center border border-theme">
            <div className="mx-auto h-12 w-12 text-theme-secondary">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-theme-primary">Nenhuma conversa encontrada</h3>
            {searchTerm ? (
              <p className="mt-1 text-sm text-theme-secondary">
                Não encontramos conversas com o termo "{searchTerm}".
              </p>
            ) : (
              <p className="mt-1 text-sm text-theme-secondary">
                Comece uma nova conversa com alguém.
              </p>
            )}
            <div className="mt-6">
              <Button 
                variant="primary"
                onClick={handleOpenNewChatModal}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nova Conversa
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modal para iniciar nova conversa */}
      {showNewChatModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseNewChatModal}></div>
          
          <div className="relative bg-theme-surface rounded-lg max-w-md w-full mx-4 sm:mx-auto shadow-xl overflow-hidden z-10 border border-theme">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-theme-primary mb-4">Nova Conversa</h3>
              
              <div className="mb-4">
                <label htmlFor="user-select" className="block text-sm font-medium text-theme-primary mb-1">
                  Selecione um usuário
                </label>
                
                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-theme rounded-md bg-theme-surface">
                    <ul className="divide-y divide-theme">
                      {users.map(u => (
                        <li 
                          key={u.id}
                          className={`p-3 flex items-center cursor-pointer hover:bg-theme ${selectedUserId === u.id ? 'bg-theme' : ''}`}
                          onClick={() => setSelectedUserId(u.id)}
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-theme-secondary flex items-center justify-center text-theme-primary">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-theme-primary">{u.name}</p>
                            <p className="text-xs text-theme-secondary">{u.email}</p>
                          </div>
                          {selectedUserId === u.id && (
                            <svg className="h-5 w-5 text-green-500 ml-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
                    Nenhum usuário encontrado.
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleStartChat}
                  disabled={!selectedUserId || startingChat}
                  isLoading={startingChat}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Iniciar Conversa
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseNewChatModal}
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessages;
