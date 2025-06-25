# EXEMPLOS DE CÓDIGO PARA DEMONSTRAÇÃO - ORQUESTRA

## 🎯 CÓDIGOS SELECIONADOS PARA APRESENTAÇÃO

### **1. ARQUITETURA BACKEND - ESTRUTURA MVC**

#### **Controller (Exemplo: Task Controller)**
```javascript
// backend/src/controllers/task.controller.js
const taskService = require('../services/task.service');
const logger = require('../utils/logger');

class TaskController {
  async createTask(req, res) {
    try {
      const { projectId } = req.params;
      const taskData = { ...req.body, project_id: parseInt(projectId) };
      
      const task = await taskService.createTask(taskData);
      
      logger.info(`Tarefa criada: ${task.id} no projeto ${projectId}`);
      res.status(201).json({
        success: true,
        data: task,
        message: 'Tarefa criada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar tarefa:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

**PONTOS A DESTACAR:**
- Separação clara de responsabilidades
- Tratamento de erros centralizado
- Logging para monitoramento
- Respostas padronizadas

#### **Service Layer (Exemplo: Task Service)**
```javascript
// backend/src/services/task.service.js
const prisma = require('../prismaClient');

class TaskService {
  async createTask(taskData) {
    // Validação de dados
    if (!taskData.title || !taskData.project_id) {
      throw new Error('Título e projeto são obrigatórios');
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: taskData.project_id }
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    // Criar tarefa com transação
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        project_id: taskData.project_id,
        assigned_to: taskData.assigned_to,
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours
      },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    return task;
  }
}
```

**PONTOS A DESTACAR:**
- Lógica de negócio isolada
- Validações robustas
- Uso do Prisma ORM
- Relacionamentos incluídos

### **2. AUTENTICAÇÃO E SEGURANÇA**

#### **Middleware de Autenticação**
```javascript
// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

**PONTOS A DESTACAR:**
- Verificação de token JWT
- Busca de usuário no banco
- Segurança em múltiplas camadas
- Tratamento de erros

#### **Sistema de Roles**
```javascript
// backend/src/middlewares/roleAuth.middleware.js
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Acesso negado. Permissão insuficiente.' 
      });
    }
    
    next();
  };
};

// Uso nas rotas
router.post('/projects', 
  authMiddleware, 
  roleAuth(['admin', 'project_manager']), 
  projectController.createProject
);
```

**PONTOS A DESTACAR:**
- Middleware reutilizável
- Controle granular de permissões
- Flexibilidade na definição de roles

### **3. FRONTEND - ARQUITETURA REACT**

#### **Custom Hook para API**
```typescript
// frontend/src/hooks/useAxiosWithAuth.ts
import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useAxiosWithAuth = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    // Interceptor para adicionar token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout]);

  return axios;
};
```

**PONTOS A DESTACAR:**
- Reutilização de código
- Interceptadores automáticos
- Tratamento de autenticação
- Cleanup adequado

#### **Context API para Estado Global**
```typescript
// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar token salvo
    const savedToken = localStorage.getItem('orquestra_token');
    if (savedToken) {
      setToken(savedToken);
      // Validar token com backend
      validateToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('orquestra_token', newToken);
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('orquestra_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**PONTOS A DESTACAR:**
- Gerenciamento de estado global
- Persistência de dados
- Tipagem TypeScript
- Padrão Provider

### **4. MODELO DE DADOS - PRISMA SCHEMA**

#### **Schema Principal**
```prisma
// backend/prisma/schema.prisma
model User {
  id               Int               @id @default(autoincrement())
  name             String            @db.VarChar(100)
  email            String            @unique @db.VarChar(150)
  password_hash    String            @db.VarChar(255)
  role             Role              @default(developer)
  created_at       DateTime          @default(now())
  updated_at       DateTime          @default(now()) @updatedAt
  
  // Relacionamentos
  projects         ProjectMember[]
  tasks            Task[]            @relation("AssignedTasks")
  chatMessages     ChatMessage[]
  notifications    Notification[]
  
  @@map("users")
}

model Project {
  id           Int             @id @default(autoincrement())
  name         String          @db.VarChar(150)
  description  String?         @db.Text
  created_at   DateTime        @default(now())
  updated_at   DateTime        @default(now()) @updatedAt
  
  // Relacionamentos
  members      ProjectMember[]
  tasks        Task[]
  documents    Document[]
  chatMessages ChatMessage[]
  
  @@map("projects")
}

model Task {
  id             Int          @id @default(autoincrement())
  project_id     Int
  parent_task_id Int?
  title          String       @db.VarChar(200)
  description    String?      @db.Text
  status         TaskStatus   @default(pending)
  priority       TaskPriority @default(medium)
  assigned_to    Int?
  due_date       DateTime?    @db.Date
  estimated_hours Float?
  actual_hours    Float?
  created_at     DateTime     @default(now())
  updated_at     DateTime     @default(now()) @updatedAt
  
  // Relacionamentos
  assignedUser   User?        @relation("AssignedTasks", fields: [assigned_to], references: [id])
  parentTask     Task?        @relation("SubTasks", fields: [parent_task_id], references: [id])
  subTasks       Task[]       @relation("SubTasks")
  project        Project      @relation(fields: [project_id], references: [id], onDelete: Cascade)
  
  @@index([project_id])
  @@index([assigned_to])
  @@map("tasks")
}
```

**PONTOS A DESTACAR:**
- Relacionamentos bem definidos
- Índices para performance
- Constraints de integridade
- Mapeamento para tabelas

### **5. FUNCIONALIDADES AVANÇADAS**

#### **Upload e Processamento de Arquivos**
```javascript
// backend/src/services/upload.service.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class UploadService {
  async processAndSaveFile(file, projectId) {
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido');
      }

      // Processar imagem se necessário
      let processedBuffer = file.buffer;
      if (file.mimetype.startsWith('image/')) {
        processedBuffer = await sharp(file.buffer)
          .resize(800, 600, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // Gerar nome único
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
      const filePath = path.join(process.env.UPLOAD_DIR, fileName);

      // Salvar arquivo
      await fs.writeFile(filePath, processedBuffer);

      return {
        fileName,
        filePath,
        originalName: file.originalname,
        size: processedBuffer.length,
        mimeType: file.mimetype
      };
    } catch (error) {
      throw new Error(`Erro ao processar arquivo: ${error.message}`);
    }
  }
}
```

**PONTOS A DESTACAR:**
- Validação de tipos MIME
- Processamento de imagens
- Geração de nomes únicos
- Tratamento de erros

#### **Sistema de Notificações**
```javascript
// backend/src/services/notification.service.js
const prisma = require('../prismaClient');

class NotificationService {
  async createNotification(userId, content, type = 'info') {
    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        content,
        type
      }
    });

    // Aqui poderia integrar com WebSockets para notificação em tempo real
    return notification;
  }

  async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: userId
      },
      data: {
        is_read: true
      }
    });
  }

  async getUserNotifications(userId, limit = 20) {
    return await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }
}
```

**PONTOS A DESTACAR:**
- CRUD completo
- Filtros e ordenação
- Preparação para tempo real
- Relacionamentos

### **6. VALIDAÇÃO E TRATAMENTO DE ERROS**

#### **Validação com Zod**
```javascript
// backend/src/schemas/task.schema.js
const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  
  description: z.string()
    .optional()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  
  status: z.enum(['pending', 'in_progress', 'completed'])
    .default('pending'),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  
  assigned_to: z.number()
    .int()
    .positive()
    .optional(),
  
  due_date: z.string()
    .datetime()
    .optional(),
  
  estimated_hours: z.number()
    .positive()
    .optional()
});

module.exports = { createTaskSchema };
```

**PONTOS A DESTACAR:**
- Validação robusta
- Mensagens de erro claras
- Tipos bem definidos
- Valores padrão

#### **Middleware de Tratamento de Erros**
```javascript
// backend/src/middlewares/error.middleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Erro na aplicação:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado'
    });
  }

  // Erro interno
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
};
```

**PONTOS A DESTACAR:**
- Logging centralizado
- Tratamento específico por tipo
- Respostas padronizadas
- Segurança (não expor detalhes internos)

---

## 🎯 COMO USAR ESTES EXEMPLOS NA APRESENTAÇÃO

### **1. INTRODUÇÃO TÉCNICA**
- Comece mostrando a estrutura geral
- Explique o padrão MVC
- Demonstre a separação de responsabilidades

### **2. DESTAQUES DE QUALIDADE**
- Mostre o tratamento de erros
- Demonstre a validação de dados
- Explique as escolhas de segurança

### **3. FUNCIONALIDADES AVANÇADAS**
- Demonstre o upload de arquivos
- Mostre o sistema de notificações
- Explique o versionamento

### **4. ARQUITETURA FRONTEND**
- Mostre os hooks customizados
- Demonstre o Context API
- Explique a tipagem TypeScript

### **5. MODELO DE DADOS**
- Mostre as relações entre entidades
- Explique os índices e performance
- Demonstre a integridade dos dados

---

## 💡 DICAS PARA A DEMONSTRAÇÃO

### **Antes de Mostrar o Código**
- "Vou mostrar como implementamos..."
- "Aqui podemos ver o padrão..."
- "Esta é uma das funcionalidades mais importantes..."

### **Durante a Explicação**
- Aponte para partes específicas
- Explique a lógica por trás
- Conecte com conceitos teóricos

### **Após Mostrar o Código**
- "Como vocês podem ver..."
- "Esta implementação garante..."
- "Isso demonstra nossa preocupação com..."

---

**Lembre-se: O objetivo é mostrar que vocês entendem profundamente o código e fizeram escolhas técnicas conscientes e bem fundamentadas!** 