# Orquestra

Sistema de gerenciamento de projetos e tarefas desenvolvido para facilitar a colaboração em equipe.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Backend**: API REST desenvolvida com Node.js, Express e Prisma ORM
- **Frontend**: Interface de usuário desenvolvida com React

## Requisitos

- Node.js 14.x ou superior
- NPM 6.x ou superior
- PostgreSQL (ou outro banco de dados compatível com Prisma)

## Instalação e Execução

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Funcionalidades

- Autenticação e autorização de usuários
- Gerenciamento de projetos
- Acompanhamento de tarefas
- Comunicação via chat
- Notificações
- Documentação de projetos

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes. 