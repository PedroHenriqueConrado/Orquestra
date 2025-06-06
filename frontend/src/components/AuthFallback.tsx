import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import authService from '../services/auth.service';

interface AuthFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const AuthFallback: React.FC<AuthFallbackProps> = ({ 
  message = 'Sua sessão expirou ou você não está autenticado.', 
  onRetry 
}) => {
  const navigate = useNavigate();
  
  // Tentativa de recuperar a sessão
  useEffect(() => {
    const attemptRecovery = async () => {
      // Verificar se existe token
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        // Se não tiver dados de autenticação, não há o que recuperar
        return;
      }
      
      // Aqui poderia implementar lógica para refresh do token se o backend suportar
      // Por enquanto apenas loga a tentativa
      console.log('Tentando recuperar sessão...');
    };
    
    attemptRecovery();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Problema de Autenticação</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col space-y-3">
              {onRetry && (
                <Button variant="primary" onClick={onRetry}>
                  Tentar novamente
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  // Limpar qualquer dado de autenticação existente
                  authService.logout();
                  navigate('/login');
                }}
              >
                Fazer login novamente
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  navigate('/');
                }}
              >
                Voltar para a página inicial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFallback; 