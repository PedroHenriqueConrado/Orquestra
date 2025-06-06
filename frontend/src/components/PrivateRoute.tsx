import React from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  redirectTo?: string;
  children?: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectTo = '/login', children }) => {
  const { isLoggedIn, loading } = useAuth();

  // Se estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redireciona se não estiver autenticado
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // Renderiza o conteúdo protegido
  // Se children for fornecido, renderiza-o, caso contrário, usa o Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute; 