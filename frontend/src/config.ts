// Configurações da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurações da aplicação
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Orquestra';
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Sistema de gerenciamento de projetos e tarefas';

// Configurações de autenticação
export const TOKEN_KEY = 'orquestra_token';
export const USER_KEY = 'orquestra_user';

// Configurações de upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Configurações de paginação
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Configurações de cache
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configurações de notificação
export const NOTIFICATION_DURATION = 5000; // 5 segundos

// Configurações de tema
export const DEFAULT_THEME = 'light';
export const THEME_KEY = 'orquestra_theme';

// Configurações de idioma
export const DEFAULT_LANGUAGE = 'pt-BR';
export const LANGUAGE_KEY = 'orquestra_language'; 