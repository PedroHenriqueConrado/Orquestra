/**
 * Utilitário para logs padronizados na aplicação
 */

const config = require('../config');

// Cores para logs no terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Formata um objeto para exibição no log
 * @param {any} data Dados a serem formatados
 * @returns {string} Representação formatada dos dados
 */
const formatData = (data) => {
  if (typeof data === 'undefined') return '';
  
  try {
    if (typeof data === 'object' && data !== null) {
      return `\n${JSON.stringify(data, null, 2)}`;
    }
    return String(data);
  } catch (error) {
    return '[Erro ao formatar dados]';
  }
};

/**
 * Logger para uso na aplicação
 */
const logger = {
  /**
   * Log informativo
   * @param {string} message Mensagem do log
   * @param {any} data Dados adicionais (opcional)
   */
  info: (message, data) => {
    if (config.app.env === 'test') return;
    
    const timestamp = new Date().toISOString();
    console.log(`${colors.blue}[INFO]${colors.reset} ${timestamp} - ${message}${formatData(data)}`);
  },
  
  /**
   * Log de sucesso
   * @param {string} message Mensagem do log
   * @param {any} data Dados adicionais (opcional)
   */
  success: (message, data) => {
    if (config.app.env === 'test') return;
    
    const timestamp = new Date().toISOString();
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${timestamp} - ${message}${formatData(data)}`);
  },
  
  /**
   * Log de aviso
   * @param {string} message Mensagem do log
   * @param {any} data Dados adicionais (opcional)
   */
  warn: (message, data) => {
    if (config.app.env === 'test') return;
    
    const timestamp = new Date().toISOString();
    console.log(`${colors.yellow}[WARN]${colors.reset} ${timestamp} - ${message}${formatData(data)}`);
  },
  
  /**
   * Log de erro
   * @param {string} message Mensagem do log
   * @param {Error|any} error Erro ou dados adicionais
   */
  error: (message, error) => {
    if (config.app.env === 'test') return;
    
    const timestamp = new Date().toISOString();
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp} - ${message}`);
    
    if (error instanceof Error) {
      console.error(`${colors.red}Stack:${colors.reset} ${error.stack || error.message}`);
    } else if (error) {
      console.error(formatData(error));
    }
  },
  
  /**
   * Log de depuração (só aparece em ambiente de desenvolvimento)
   * @param {string} message Mensagem do log
   * @param {any} data Dados adicionais (opcional)
   */
  debug: (message, data) => {
    if (config.app.env !== 'development') return;
    
    const timestamp = new Date().toISOString();
    console.log(`${colors.magenta}[DEBUG]${colors.reset} ${timestamp} - ${message}${formatData(data)}`);
  },
  
  /**
   * Log de requisição HTTP
   * @param {Object} req Objeto de requisição Express
   * @param {string} context Contexto da requisição
   */
  request: (req, context = '') => {
    if (config.app.env !== 'development') return;
    
    const timestamp = new Date().toISOString();
    const reqData = {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'authorization': req.headers['authorization'] ? '[PRESENTE]' : '[AUSENTE]'
      }
    };
    
    console.log(`${colors.cyan}[REQUEST]${colors.reset} ${timestamp} - ${context}${formatData(reqData)}`);
  }
};

module.exports = logger; 