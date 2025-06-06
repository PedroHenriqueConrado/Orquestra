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
      <div className="bg-red-50 p-4 rounded-md text-red-500 text-center">
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
    <div className="bg-white shadow rounded-lg flex flex-col overflow-hidden" style={{ height: '500px' }}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Chat do Projeto</h2>
      </div>
      
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
              const isCurrentUser = user?.id === message.user_id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group relative`}
                >
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-xs mb-1">
                        {message.user.name}
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
                            <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button 
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-lighter' : 'text-gray-500'}`}>
                      {chatService.formatMessageTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-gray-500">
            <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Nenhuma mensagem. Comece a conversa!</p>
          </div>
        )}
      </div>
      
      {/* Formulário para enviar mensagem */}
      <div className="border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
  );
};

export default ProjectChat; 