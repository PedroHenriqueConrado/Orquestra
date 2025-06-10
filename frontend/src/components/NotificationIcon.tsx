import React, { useState, useEffect, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import notificationService from '../services/notification.service';
import type { Notification } from '../services/notification.service';
import { useAuth } from '../contexts/AuthContext';

const NotificationIcon: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar contagem de notificações não lidas
  const fetchUnreadCount = async () => {
    // Não tentar buscar se não estiver logado
    if (!isLoggedIn) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
      // Não atualizar o estado em caso de erro para manter o valor anterior
    }
  };

  // Buscar notificações
  const fetchNotifications = async () => {
    // Não tentar buscar se não estiver logado
    if (!isLoggedIn) {
      setLoading(false);
      setError("Você precisa estar logado para ver notificações.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getUserNotifications(1, 5);
      setNotifications(response.notifications);
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
      // Atualizar a contagem de não lidas
      fetchUnreadCount();
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
      // Zerar a contagem
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Efeito para buscar a contagem inicial e configurar atualização periódica
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      // Configura uma atualização a cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button 
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full relative"
            onClick={() => !open && fetchNotifications()}
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Popover.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <div className="border-b border-gray-200">
                  <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                    {unreadCount > 0 && (
                      <button
                        className="px-2 py-1 text-xs border-0 text-white bg-black hover:bg-yellow-300 hover:text-black rounded-md transition-all duration-200"
                        onClick={markAllAsRead}
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Carregando notificações...
                    </div>
                  ) : error ? (
                    <div className="px-4 py-6 text-center text-sm text-red-500">
                      {error}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Nenhuma notificação encontrada
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between">
                          <div className="flex-1 mr-2">
                            <p className="text-sm text-gray-800">{notification.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notificationService.formatNotificationTime(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <button
                              className="px-2 py-1 text-xs border-0 text-white bg-black hover:bg-white hover:text-black rounded-md transition-all duration-200"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="px-4 py-2">
                    <Link
                      to="/notifications"
                      className="text-sm text-primary hover:text-primary-dark block text-center"
                    >
                      Ver todas as notificações
                    </Link>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default NotificationIcon;