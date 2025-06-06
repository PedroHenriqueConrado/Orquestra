# Orquestra

Sistema de gerenciamento de projetos e tarefas desenvolvido para facilitar a colaboração em equipe.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Backend**: API REST desenvolvida com Node.js, Express e Prisma ORM
- **Frontend**: Interface de usuário desenvolvida com React e TypeScript

## Requisitos

- Node.js 14.x ou superior
- NPM 6.x ou superior
- MySQL 8.x

## Guia Completo de Instalação e Configuração

### 1. Preparação do Ambiente

Antes de começar, certifique-se de ter instalado:

- [Node.js e NPM](https://nodejs.org/pt-br/download/)
- [MySQL](https://dev.mysql.com/downloads/mysql/) ou [Docker](https://www.docker.com/products/docker-desktop/)

### 2. Clonando o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/orquestra.git

# Entre na pasta do projeto
cd orquestra
```

### 3. Configuração do Banco de Dados

#### Opção 1: MySQL Local

1. Instale o MySQL Server na sua máquina
2. Crie um banco de dados para o projeto:

```sql
CREATE DATABASE orquestra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'orquestra_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON orquestra.* TO 'orquestra_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Opção 2: MySQL com Docker

```bash
# Inicie um container MySQL
docker run --name orquestra-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=orquestra \
  -d mysql:8
```

### 4. Configuração do Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install
```

#### Arquivos de Configuração do Ambiente

Para facilitar a configuração, crie um arquivo `.env.example` na pasta `backend` com o seguinte conteúdo:

```
# Configuração do Banco de Dados
DATABASE_URL="mysql://root:admin123@localhost:3306/orquestra"

# Configuração do JWT
JWT_SECRET="sua_chave_secreta_para_tokens"
JWT_EXPIRES_IN="1d"

# Configuração do Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Uploads
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760 # 10MB
```

Em seguida, copie este arquivo para criar seu próprio `.env`:

```bash
cp .env.example .env
```

Ajuste as configurações do banco de dados conforme suas credenciais locais.

```bash
# Execute as migrações do banco de dados
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# Opcional: Popule o banco com dados iniciais
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3000`.

### 5. Configuração do Frontend

```bash
# Entre na pasta do frontend
cd ../frontend

# Instale as dependências
npm install
```

#### Arquivos de Configuração do Ambiente Frontend

Crie um arquivo `.env.example` na pasta `frontend` com o seguinte conteúdo:

```
# URL da API backend
VITE_API_URL=http://localhost:3000

# Outras configurações
VITE_APP_TITLE=Orquestra
VITE_APP_DESCRIPTION=Sistema de gerenciamento de projetos e tarefas
```

Em seguida, copie este arquivo para criar seu próprio `.env.local`:

```bash
cp .env.example .env.local
```

Ajuste as configurações conforme necessário para seu ambiente local.

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`.

### 6. Acessando a Aplicação

Após iniciar ambos os servidores (backend e frontend), você pode acessar a aplicação em:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API Backend: [http://localhost:3000](http://localhost:3000)

### 7. Usuário Padrão (se houver)

Se o banco de dados foi populado com dados iniciais:

- Email: admin@example.com
- Senha: admin123

## Possíveis Problemas e Soluções

### Erro de conexão com o banco de dados

Verifique se:
- O serviço MySQL está rodando
- As credenciais no arquivo .env estão corretas
- O banco de dados foi criado

```bash
# Para verificar a conexão com o banco via Prisma
cd backend
npx prisma db pull
```

### Erro CORS no frontend

Se o frontend não conseguir se comunicar com o backend, verifique se:
- Ambos os servidores estão rodando
- A URL da API no .env.local do frontend está correta
- O backend está configurado para aceitar requisições do frontend

### Portas em uso

Se alguma porta já estiver em uso, você pode mudar no arquivo .env (backend) ou package.json (frontend).

## Desenvolvimento

### Estrutura de Pastas

```
orquestra/
├── backend/               # API Node.js
│   ├── prisma/            # Configuração e migrações do Prisma
│   ├── src/               # Código fonte do backend
│   │   ├── config/        # Configurações da aplicação
│   │   ├── controllers/   # Controladores da API
│   │   ├── middlewares/   # Middlewares Express
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Serviços de negócio
│   │   ├── utils/         # Utilitários
│   │   ├── app.js         # Configuração do Express
│   │   └── index.js       # Ponto de entrada
│   └── package.json       # Dependências do backend
│
└── frontend/              # Aplicação React
    ├── public/            # Arquivos estáticos
    ├── src/               # Código fonte do frontend
    │   ├── assets/        # Imagens e recursos
    │   ├── components/    # Componentes React
    │   ├── contexts/      # Contextos React
    │   ├── hooks/         # Hooks personalizados
    │   ├── pages/         # Páginas da aplicação
    │   ├── services/      # Serviços de API
    │   ├── types/         # Tipos TypeScript
    │   ├── utils/         # Funções utilitárias
    │   ├── App.tsx        # Componente principal
    │   └── main.tsx       # Ponto de entrada
    └── package.json       # Dependências do frontend
```

### Fluxo de Trabalho Git

Para contribuir com o projeto, siga estes passos:

1. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
2. Faça seus commits: `git commit -m "Descrição das alterações"`
3. Envie para o repositório: `git push origin feature/nome-da-feature`
4. Abra um Pull Request para a branch principal

## Funcionalidades

- Autenticação e autorização de usuários
- Gerenciamento de projetos
- Acompanhamento de tarefas
- Comunicação via chat (direto e de projeto)
- Notificações
- Documentação de projetos

## Colaboração entre Desenvolvedores

### Ambientes Independentes

Cada desenvolvedor deve configurar seu próprio ambiente local seguindo os passos deste guia. O projeto foi projetado para permitir que múltiplos desenvolvedores trabalhem simultaneamente sem interferências.

### Bancos de Dados

Existem algumas abordagens para trabalhar com o banco de dados em equipe:

1. **Bancos individuais**: Cada desenvolvedor configura seu próprio banco de dados local
2. **Banco compartilhado**: A equipe utiliza um banco de dados remoto compartilhado para desenvolvimento
3. **Docker Compose**: Configure todo o ambiente com Docker para garantir uniformidade entre desenvolvedores

Para projetos maiores, recomendamos:

```bash
# Exemplo de docker-compose.yml na raiz do projeto
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=admin123
      - MYSQL_DATABASE=orquestra
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Práticas Recomendadas

1. **Sempre sincronize antes de começar**: Execute `git pull` antes de iniciar o trabalho
2. **Branches para features**: Trabalhe em branches separados para cada funcionalidade
3. **Commits pequenos e frequentes**: Faça commits menores e mais frequentes para facilitar a integração
4. **Comunicação constante**: Informe a equipe sobre alterações em modelos de dados ou APIs
5. **Padrões de código**: Siga os padrões de código estabelecidos (ESLint/Prettier já configurados)
6. **Documentação**: Atualize a documentação ao adicionar novas funcionalidades ou alterar comportamentos existentes

### Resolução de Conflitos

Se ocorrerem conflitos de merge:

1. Comunique-se com o desenvolvedor responsável pelo código conflitante
2. Resolva os conflitos localmente usando ferramentas como VSCode ou IntelliJ
3. Teste a aplicação após resolver conflitos para garantir que tudo funciona como esperado
4. Faça um commit com mensagem descritiva indicando a resolução de conflitos

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Prisma ORM
- MySQL
- JWT para autenticação

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- Axios

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes. 