import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cria uma instância do axios com configurações personalizadas
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos de timeout
});

// Função para obter o token diretamente do localStorage, evitando ciclo de dependência
const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('token');
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Obtém o token diretamente do localStorage
    const token = getTokenFromStorage();
    
    if (token) {
      // Adiciona o token ao cabeçalho Authorization
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token adicionado ao cabeçalho:', `Bearer ${token.substring(0, 15)}...`);
    } else {
      console.warn('Nenhum token encontrado no localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    // Log para debug
    console.log(`Resposta recebida de ${response.config.url}: status ${response.status}`);
    return response;
  },
  (error) => {
    // Se for erro de autenticação, apenas notifica
    if (error.response && error.response.status === 401) {
      console.error('Erro de autenticação detectado (401):', error.config.url);
      
      // Não faz logout automático, apenas retorna o erro para tratamento pela aplicação
      return Promise.reject(new Error('Sessão expirada. Por favor, tente novamente ou faça login novamente.'));
    }
    
    // Para outros erros, rejeita a promessa com informações detalhadas
    const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
    console.error(`Erro ${error.response?.status || 'network'}: ${errorMessage}`);
    
    return Promise.reject(error);
  }
);

export default api; 