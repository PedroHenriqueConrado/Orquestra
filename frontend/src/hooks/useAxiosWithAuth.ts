import { useEffect } from 'react';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useAxiosWithAuth = (): AxiosInstance => {
  const navigate = useNavigate();

  // Criar uma instância do axios
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    // Adicionar interceptor de requisição para incluir o token de autenticação
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Adicionar interceptor de resposta para tratar erros de autenticação
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          authService.logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Limpar interceptors quando o componente for desmontado
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  return axiosInstance;
};

export default useAxiosWithAuth; 