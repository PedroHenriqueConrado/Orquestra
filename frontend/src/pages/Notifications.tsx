import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService, { type Notification } from '../services/notification.service';

// Componente de paginação interno, para não depender de um componente externo
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Botão para a primeira página
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-1">
            ...
          </span>
        );
      }
    }
    
    // Páginas intermediárias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-primary text-white'
              : 'border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Botão para a última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-1">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-300' 
            : 'text-white border-2 border-black bg-black hover:bg-yellow-100 hover:text-black'
        }`}
      >
        Anterior
      </button>
      
      <div className="flex space-x-2">
        {renderPageNumbers()}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-300' 
            : 'text-white border-2 border-black bg-black hover:bg-yellow-100 hover:text-black'
        }`}
      >
        Próxima
      </button>
    </div>
  );
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 10;

  // Atualizar o título da página
  useEffect(() => {
    document.title = 'Notificações | Orquestra';
  }, []);

  // Buscar notificações
  const fetchNotifications = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getUserNotifications(page, pageSize);
      setNotifications(response.notifications);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
      setCurrentPage(page);
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar notificações');
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar uma notificação como lida
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Atualizar a lista de notificações
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (error) {
      console.error(`Erro ao marcar notificação ${notificationId} como lida:`, error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Atualizar todas as notificações na lista
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Excluir uma notificação
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Remover a notificação da lista
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
      setTotalItems(prev => prev - 1);
    } catch (error) {
      console.error(`Erro ao excluir notificação ${notificationId}:`, error);
    }
  };

  // Carregar as notificações ao montar o componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Função para lidar com mudanças de página
  const handlePageChange = (page: number) => {
    fetchNotifications(page);
  };

  // Função para verificar se há notificações não lidas
  const hasUnreadNotifications = () => {
    return notifications.some(notification => !notification.is_read);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg 
              className="h-6 w-6 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Voltar
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 flex-1 text-center">Notificações</h1>
        <div className="flex-1 flex justify-end">
          {hasUnreadNotifications() && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-white border-2 border-black bg-black hover:bg-yellow-100 hover:text-black rounded-md transition-all duration-200"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-12 rounded-md text-center">
          <p className="text-lg">Você não tem notificações.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          {notifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className={`p-4 flex flex-col sm:flex-row sm:items-start justify-between ${
                index !== notifications.length - 1 ? 'border-b border-gray-200' : ''
              } ${!notification.is_read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex-1">
                <p className="text-gray-800">{notification.content}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {notificationService.formatNotificationTime(notification.created_at)}
                </p>
              </div>
              <div className="flex mt-3 sm:mt-0 space-x-2 sm:ml-4">
                {!notification.is_read && (
                  <button
                    className="px-2 py-1 text-xs text-white border-2 border-black bg-black hover:bg-yellow-100 hover:text-black rounded-md transition-all duration-200"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Marcar como lida
                  </button>
                )}
                <button
                  className="px-2 py-1 text-xs text-white border-2 border-black bg-black hover:bg-yellow-100 hover:text-black rounded-md transition-all duration-200"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Notifications; 