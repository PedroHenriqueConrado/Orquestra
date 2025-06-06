import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

interface AuthStatusProps {
  message: string;
  onRetry?: () => void;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ message, onRetry }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLoginRedirect = () => {
    // Faz logout primeiro para limpar dados inválidos
    logout();
    // Redireciona para a página de login
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-white shadow rounded-lg p-8 max-w-md mx-auto text-center">
      <div className="text-amber-500 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Sessão Expirada</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex flex-col space-y-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={handleLoginRedirect}>
          Fazer login
        </Button>
      </div>
    </div>
  );
};

export default AuthStatus; 