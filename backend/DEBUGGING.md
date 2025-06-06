# Guia de Debugging para o Orquestra Backend

Este guia fornece instruções detalhadas para realizar debugging e visualização de logs na aplicação backend do Orquestra.

## 1. Logs no Terminal

O método mais simples para visualizar logs é através do terminal onde o servidor está rodando:

```bash
# Iniciar o servidor em modo de desenvolvimento
npm run dev
```

Os logs serão exibidos no console em tempo real, com formatação colorida e timestamp.

## 2. Níveis de Log Disponíveis

O sistema usa um logger personalizado que fornece os seguintes métodos:

- `logger.info()` - Informações gerais (azul)
- `logger.success()` - Operações bem-sucedidas (verde)
- `logger.warn()` - Avisos (amarelo)
- `logger.error()` - Erros (vermelho)
- `logger.debug()` - Logs de depuração (roxo, apenas em ambiente de desenvolvimento)
- `logger.request()` - Detalhes da requisição (ciano, apenas em ambiente de desenvolvimento)

## 3. Rastreamento de Requisições

Cada requisição recebe um ID único que é:
- Armazenado no objeto `req.id`
- Enviado no cabeçalho de resposta como `X-Request-ID`
- Incluído nos logs de erro

Isso permite rastrear uma requisição específica em toda a cadeia de logs.

## 4. Debug com Node.js Inspector

Para debug mais avançado com breakpoints, use o inspector do Node.js:

```bash
# Debug normal - acesse no Chrome: chrome://inspect
npm run debug

# Debug com pausa na primeira linha
npm run debug:break

# Debug com nodemon (reinicia automaticamente ao alterar arquivos)
npm run dev:debug
```

### Como usar o Node.js Inspector:

1. Execute um dos comandos acima
2. Abra o Chrome e acesse `chrome://inspect`
3. Clique em "Open dedicated DevTools for Node"
4. No painel Sources, adicione breakpoints clicando na linha desejada
5. A execução pausará nos breakpoints, permitindo inspecionar variáveis

## 5. Adicionando Logs de Depuração no Código

Para adicionar logs temporários de depuração:

```javascript
const logger = require('../utils/logger');

// Depuração de função ou método
function minhaFuncao(parametros) {
  logger.debug('Iniciando minhaFuncao', { parametros });
  
  // Lógica da função
  
  logger.debug('Finalizando minhaFuncao', { resultado });
  return resultado;
}

// Depuração de requisição HTTP
router.post('/rota', (req, res) => {
  logger.request(req, 'Minha rota POST');
  
  // Lógica do endpoint
});

// Depuração de erro
try {
  // Código que pode falhar
} catch (error) {
  logger.error('Descrição detalhada do erro', error);
  throw error; // Ou trate adequadamente
}
```

## 6. Visualizando Erros de Banco de Dados

Erros do Prisma são capturados e classificados no middleware de erro. Para visualizar mais detalhes das queries SQL:

1. Adicione no arquivo `.env`:
   ```
   DEBUG_PRISMA=true
   ```

2. Inicie o servidor, e os logs SQL serão exibidos

## 7. Middleware de Logs HTTP

O middleware Morgan já está configurado e exibe informações das requisições HTTP:

- Método (GET, POST, etc.)
- URL
- Status da resposta
- Tempo de resposta
- Tamanho da resposta
- Content-Type da requisição
- Cabeçalho Authorization (presença)

## 8. Verificação de Estado do Servidor

Para verificar o estado atual do servidor:

```bash
# Retorna informações básicas sobre o servidor
curl http://localhost:3001/api/health

# Versão mais detalhada com status de serviços e banco
curl http://localhost:3001/api/health/details
```

## 9. Visualizando Logs de Produção

Em ambiente de produção, os logs são mais concisos e filtrados. Para acessá-los:

1. Conecte-se ao servidor via SSH
2. Visualize os logs com:
   ```bash
   # Últimas 100 linhas de log
   tail -n 100 /var/log/orquestra/app.log
   
   # Acompanhe logs em tempo real
   tail -f /var/log/orquestra/app.log
   
   # Filtrando apenas erros
   grep "ERROR" /var/log/orquestra/app.log
   ```

## 10. Ferramentas de Monitoramento

Considere usar:

- **Postman/Insomnia**: Para testar e debugar APIs manualmente
- **Chrome DevTools**: Para depuração com breakpoints (com Node Inspector)
- **Prisma Studio**: Para visualizar e modificar dados (`npm run prisma:studio`) 