import React, { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import chatService from '../services/chat.service';
import type { ChatMessage } from '../services/chat.service';
import { useAuth } from '../contexts/AuthContext';

interface ProjectChatProps {
  projectId: number;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

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

  const loadMessages = async (page: number = 1) => {
    try {
      if (page > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const result = await chatService.getProjectMessages(projectId, page);
      
      // Para a primeira página, apenas definimos as mensagens
      // Para as demais, concatenamos com as existentes
      if (page === 1) {
        setMessages(result.messages);
      } else {
        // Adiciona novas mensagens ao início (são mais antigas)
        setMessages(prev => [...result.messages, ...prev]);
      }
      
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err);
      if (page === 1) {
        setError(err.message || 'Erro ao carregar mensagens');
      }
    } finally {
      setLoading(false);
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
    
    if (!newMessage.trim() || !user) return;
    
    try {
      setSending(true);
      
      // Envia a mensagem
      const message = await chatService.sendMessage(projectId, newMessage.trim());
      
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

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }
    
    try {
      await chatService.deleteMessage(projectId, messageId);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-500 text-center">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => loadMessages()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface shadow rounded-lg flex flex-col overflow-hidden border border-theme" style={{ height: '500px' }}>
      <div className="px-6 py-4 border-b border-theme bg-gradient-to-r from-primary/10 to-theme-surface">
        <h2 className="text-xl font-semibold text-theme-primary tracking-tight">Chat do Projeto</h2>
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-6 overflow-y-auto space-y-2 bg-theme-surface"
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
          <div className="space-y-2">
            {messages.map((message, idx) => {
              const isCurrentUser = user?.id === message.user_id;
              return (
                <div
                  key={message.id}
                  className={`flex items-end ${isCurrentUser ? 'justify-end' : 'justify-start'} group relative animate-fade-slide`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Avatar para recebidas */}
                  {!isCurrentUser && (
                    <div className="flex-shrink-0 mr-2 mb-0.5">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base shadow border-2 border-white">
                        {message.user.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="relative flex flex-col items-end">
                    {/* Botão de menu fora do balão, alinhado ao topo direito */}
                    {isCurrentUser && (
                      <div className="absolute -top-3 right-0 z-10">
                        <div className="relative message-menu">
                          <button 
                            onClick={() => toggleMenu(message.id)}
                            className="p-1 rounded hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="6" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="18" r="1.5" />
                            </svg>
                          </button>
                          {menuOpen === message.id && (
                            <div className="absolute right-0 mt-2 w-36 rounded-lg shadow-lg bg-theme-surface ring-1 ring-black ring-opacity-5 z-10 border border-theme animate-fade-in">
                              <div className="py-1">
                                <button 
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded"
                                >
                                  Excluir mensagem
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`relative inline-flex items-end max-w-[80%] min-w-[40px] px-4 py-2 shadow-sm transition-all
                        ${isCurrentUser
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-2xl rounded-br-md'
                          : 'bg-white dark:bg-theme text-theme-primary rounded-2xl rounded-bl-md border border-gray-200 dark:border-theme'}
                      `}
                      style={{ paddingRight: isCurrentUser ? '2.5rem' : undefined }}
                    >
                      {/* Cauda SVG arredondada */}
                      {isCurrentUser ? (
                        <svg className="absolute -right-3 bottom-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M0 16 Q16 8 16 0 V16 Z" fill="url(#tailGradient)" />
                          <defs>
                            <linearGradient id="tailGradient" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#facc15" />
                              <stop offset="1" stopColor="#f59e42" />
                            </linearGradient>
                          </defs>
                        </svg>
                      ) : (
                        <svg className="absolute -left-3 bottom-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M16 16 Q0 8 0 0 V16 Z" fill="white" />
                        </svg>
                      )}
                      {/* Nome do usuário (apenas recebidas) */}
                      {!isCurrentUser && (
                        <span className="block text-xs font-semibold text-primary/80 mb-0.5 ml-0.5 absolute -top-5 left-0">
                          {message.user.name}
                        </span>
                      )}
                      <span className="text-[15px] leading-relaxed break-words whitespace-normal flex-1">
                        {message.message}
                      </span>
                      <span className={`text-[11px] ml-2 mb-0.5 self-end whitespace-nowrap ${isCurrentUser ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}> 
                        {chatService.formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* Avatar para enviadas */}
                  {isCurrentUser && (
                    <div className="flex-shrink-0 ml-2 mb-0.5">
                      <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-base shadow border-2 border-white">
                        {message.user.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
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
      <div className="border-t border-theme p-4 bg-theme-surface">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="block w-full border border-theme rounded-xl py-2 px-4 placeholder-theme-secondary bg-theme-surface text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition"
            placeholder="Digite sua mensagem..."
            disabled={sending}
            autoComplete="off"
          />
          <Button 
            type="submit"
            variant="primary"
            className="rounded-xl px-6 font-semibold shadow-md"
            disabled={!newMessage.trim() || sending}
            isLoading={sending}
          >
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProjectChat; 