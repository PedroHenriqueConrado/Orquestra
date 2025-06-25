# Sistema de Busca Global - Configuração

## ✅ Alterações Realizadas

### 1. **Backend - Serviço de Busca**
- ✅ Criado `src/services/search.service.js` - Serviço de busca global
- ✅ Criado `src/controllers/search.controller.js` - Controller para endpoints de busca
- ✅ Criado `src/routes/search.routes.js` - Rotas de busca
- ✅ Integrado rotas no `src/routes/index.js`
- ✅ **Corrigido**: Removido `mode: "insensitive"` das queries Prisma para compatibilidade com MySQL

### 2. **Frontend - Componente de Busca**
- ✅ Criado `src/services/search.service.ts` - Serviço de busca no frontend
- ✅ Criado `src/components/GlobalSearch.tsx` - Componente de busca com autocomplete
- ✅ Integrado no `src/components/Header.tsx` - Busca centralizada no header

### 3. **Scripts de Diagnóstico**
- ✅ Criado `scripts/check-collation.js` - Verifica collation das colunas
- ✅ Adicionado script `npm run check-collation` no package.json

## 🔧 Configuração Necessária

### Passo 1: Verificar Collation do Banco
Execute o comando para verificar se as colunas estão com collation correto:

```bash
cd backend
npm run check-collation
```

### Passo 2: Ajustar Collation (se necessário)
Se o script indicar que algumas colunas precisam de ajuste, execute os comandos SQL no seu banco MySQL:

```sql
-- Ajustar collation da tabela projects
ALTER TABLE projects MODIFY name VARCHAR(150) COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects MODIFY description TEXT COLLATE utf8mb4_unicode_ci;

-- Ajustar collation da tabela tasks
ALTER TABLE tasks MODIFY title VARCHAR(200) COLLATE utf8mb4_unicode_ci;
ALTER TABLE tasks MODIFY description TEXT COLLATE utf8mb4_unicode_ci;

-- Ajustar collation da tabela documents
ALTER TABLE documents MODIFY title VARCHAR(200) COLLATE utf8mb4_unicode_ci;
```

## 🚀 Como Usar

### Endpoints da API
- `GET /api/search/global?query=termo&type=all&limit=20` - Busca global completa
- `GET /api/search/quick?query=termo&limit=5` - Busca rápida para autocomplete

### Funcionalidades do Frontend
- **Busca em tempo real** com debounce de 300ms
- **Autocomplete** para projetos e tarefas
- **Busca global** com resultados categorizados
- **Navegação direta** para projetos, tarefas e documentos
- **Atalhos de teclado**: Enter para busca completa, Esc para fechar

### Localização no Layout
- **Desktop/Tablet**: Campo de busca centralizado no header
- **Mobile**: Não exibido (pode ser adicionado se necessário)

## 🧪 Testando a Funcionalidade

1. **Inicie o backend e frontend**
2. **Faça login** no sistema
3. **Digite no campo de busca** no header
4. **Teste diferentes termos**: nomes de projetos, tarefas, etc.
5. **Clique nos resultados** para navegar diretamente

## 🔍 Funcionalidades da Busca

### Busca Rápida (Autocomplete)
- Busca em projetos e tarefas
- Limite de 5 resultados
- Exibe tipo, título e projeto
- Navegação direta ao clicar

### Busca Global Completa
- Busca em projetos, tarefas e documentos
- Resultados categorizados por tipo
- Informações detalhadas (status, prioridade, etc.)
- Contagem total de resultados

### Filtros Disponíveis
- `type=all` - Todos os tipos (padrão)
- `type=projects` - Apenas projetos
- `type=tasks` - Apenas tarefas
- `type=documents` - Apenas documentos

## 🐛 Solução de Problemas

### Erro: "Unknown argument `mode`"
- **Causa**: Uso de `mode: "insensitive"` no Prisma com MySQL
- **Solução**: ✅ Já corrigido - removido o argumento `mode`

### Busca Sensível a Maiúsculas/Minúsculas
- **Causa**: Collation das colunas não é insensível
- **Solução**: Execute os comandos SQL de ajuste de collation

### Nenhum Resultado Aparecendo
- **Verifique**: Se o usuário tem acesso aos projetos
- **Teste**: Execute `npm run check-collation` para diagnosticar

## 📝 Próximas Melhorias Sugeridas

1. **Atalho de teclado** (Ctrl+K) para abrir busca
2. **Busca mobile** no menu hambúrguer
3. **Filtros avançados** (por status, prioridade, etc.)
4. **Histórico de buscas** recentes
5. **Busca em comentários** de tarefas
6. **Índices de banco** para melhor performance

## 🎯 Status Atual

✅ **Sistema de busca global implementado e funcional**
✅ **Compatibilidade com MySQL corrigida**
✅ **UX consistente com o design do sistema**
✅ **Documentação completa**

O sistema está pronto para uso! 🚀 