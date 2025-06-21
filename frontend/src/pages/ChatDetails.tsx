import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import directChatService from '../services/direct-chat.service';
import type { UserChat, DirectMessage, ChatMessagesResponse } from '../services/direct-chat.service';
import { useAuth } from '../contexts/AuthContext';

const ChatDetails: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<UserChat | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/messages');
      return;
    }
    
    loadChatDetails();
  }, [chatId]);

  // Rolagem automática para o final da conversa quando novos mensagens são carregadas
  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMore]);

  // Adiciona listener para fechar o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen !== null && !((event.target as HTMLElement).closest('.message-menu'))) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const loadChatDetails = async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Carrega os detalhes do chat
      const chatData = await directChatService.getChatDetails(Number(chatId));
      setChat(chatData);
      
      // Carrega as mensagens
      await loadMessages(1);
    } catch (err: any) {
      console.error('Erro ao carregar detalhes do chat:', err);
      setError(err.message || 'Erro ao carregar detalhes do chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (page: number = 1) => {
    if (!chatId) return;
    
    try {
      if (page > 1) {
        setLoadingMore(true);
      }
      
      const result = await directChatService.getChatMessages(Number(chatId), page);
      
      // Para a primeira página, apenas definimos as mensagens
      // Para as demais, concatenamos com as existentes
      if (page === 1) {
        setMessages(result.messages.reverse()); // Inverte para mostrar as mais antigas primeiro
      } else {
        // Adiciona novas mensagens ao início (são mais antigas)
        setMessages(prev => [...result.messages.reverse(), ...prev]);
      }
      
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err);
      if (page === 1) {
        setError(err.message || 'Erro ao carregar mensagens');
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (pagination && pagination.currentPage < pagination.pages) {
      loadMessages(pagination.currentPage + 1);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatId || !newMessage.trim() || !user) return;
    
    try {
      setSending(true);
      
      // Envia a mensagem
      const message = await directChatService.sendMessage(Number(chatId), newMessage.trim());
      
      // Adiciona a mensagem enviada à lista
      setMessages(prev => [...prev, message]);
      
      // Limpa o campo de mensagem
      setNewMessage('');
      
      // Rolagem para o final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      alert(err.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  // Obter o outro usuário do chat
  const getOtherUser = () => {
    if (!chat || !user) return null;
    return chat.users.find(u => u.id !== user.id);
  };

  const otherUser = getOtherUser();

  const handleDeleteMessage = async (messageId: number) => {
    if (!chatId) return;
    
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }
    
    try {
      await directChatService.deleteMessage(Number(chatId), messageId);
      // Remove a mensagem da lista
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      // Fecha o menu
      setMenuOpen(null);
    } catch (err: any) {
      console.error('Erro ao excluir mensagem:', err);
      alert(err.message || 'Erro ao excluir mensagem');
    }
  };

  const toggleMenu = (messageId: number) => {
    setMenuOpen(menuOpen === messageId ? null : messageId);
  };

  return (
    <div className="bg-theme-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="bg-theme-surface shadow rounded-lg p-6 max-w-md w-full border border-theme">
              <div className="text-red-500 text-center mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-theme-primary mb-2 text-center">Erro</h3>
              <p className="text-theme-secondary mb-4 text-center">{error}</p>
              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/messages')}
                >
                  Voltar para Mensagens
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cabeçalho do chat */}
            <div className="bg-theme-surface shadow rounded-lg mb-4 border border-theme">
              <div className="px-4 py-3 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Link to="/messages" className="mr-3 text-theme-secondary hover:text-theme-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Link>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-lighter flex items-center justify-center text-white font-medium">
                      {otherUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h2 className="text-lg font-medium text-theme-primary">{otherUser?.name}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Área de mensagens */}
            <div 
              className="bg-theme-surface shadow rounded-lg flex-1 flex flex-col overflow-hidden border border-theme"
              style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)' }}
            >
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {/* Botão para carregar mais mensagens */}
                {pagination && pagination.currentPage < pagination.pages && (
                  <div className="flex justify-center mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={loadMoreMessages}
                      isLoading={loadingMore}
                      disabled={loadingMore}
                    >
                      Carregar mensagens anteriores
                    </Button>
                  </div>
                )}
                
                {/* Lista de mensagens */}
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = user?.id === message.sender_id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group relative`}
                        >
                          <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                            isCurrentUser 
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-theme text-theme-primary rounded-bl-none'
                          }`}>
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-xs mb-1">
                                {message.sender.name}
                              </span>
                              
                              {isCurrentUser && (
                                <div className="relative message-menu">
                                  <button 
                                    onClick={() => toggleMenu(message.id)}
                                    className="ml-2 text-gray-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                  
                                  {menuOpen === message.id && (
                                    <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-theme-surface ring-1 ring-black ring-opacity-5 z-10 border border-theme">
                                      <div className="py-1">
                                        <button 
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                          Excluir mensagem
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-sm">
                              {message.message}
                            </div>
                            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-lighter' : 'text-theme-secondary'}`}>
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-theme-secondary">
                    <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Nenhuma mensagem. Comece a conversa!</p>
                  </div>
                )}
              </div>
              
              {/* Formulário para enviar mensagem */}
              <div className="border-t border-theme p-3 bg-theme-surface rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="block w-full border border-theme rounded-md py-2 px-3 placeholder-theme-secondary bg-theme text-theme-primary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Digite sua mensagem..."
                    disabled={sending}
                  />
                  <Button 
                    type="submit"
                    variant="primary"
                    disabled={!newMessage.trim() || sending}
                    isLoading={sending}
                  >
                    Enviar
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatDetails;
