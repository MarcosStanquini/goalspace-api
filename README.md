# 🎯 GoalSpace API

> Sistema completo de gerenciamento de metas pessoais com notificações automatizadas via WhatsApp

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.0+-000000?logo=fastify&logoColor=white)](https://www.fastify.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

## 📋 Sobre o Projeto

O **GoalSpace API** é uma solução robusta para gerenciamento de metas pessoais, desenvolvida com Node.js e TypeScript. O sistema oferece funcionalidades completas de CRUD para metas e subtarefas, além de um diferencial único: **sistema de notificações automatizadas via WhatsApp** para lembrar e motivar usuários a alcançarem seus objetivos.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação JWT** com roles (admin/user)
- 🎯 **Gestão Completa de Metas** (CRUD + filtros)
- ✅ **Sistema de Subtarefas** vinculadas às metas
- 📱 **Notificações WhatsApp** automatizadas
- 📊 **Relatórios em PDF** das metas do usuário
- 🔍 **Busca e Filtros** das metas
- 📖 **Documentação Swagger** integrada

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|------------|
| **Runtime** | Node.js 18+ |
| **Linguagem** | TypeScript |
| **Framework** | Fastify |
| **Banco de Dados** | PostgreSQL |
| **ORM** | Prisma |
| **Autenticação** | JWT |
| **Validação** | Zod |
| **Documentação** | Swagger/OpenAPI |
| **Containerização** | Docker & Docker Compose |
| **Notificações** | Evolution API (WhatsApp) |

## 📁 Estrutura do Projeto

```
src/
├── app.ts                 # Configuração principal do Fastify
├── server.ts              # Inicialização do servidor
├── env/                   # Validação de variáveis de ambiente
├── @types/                # Tipagem do payload do JWT (request.user)
├── http/
│   ├── middlewares/       # Middlewares de autenticação
│   └── schemas.ts         # Schemas compartilhados (erros, params)
├── jobs/                  # Jobs de notificação automatizada
├── lib/                   # Utilitários e configurações
└── modules/
    ├── auth/              # Autenticação e autorização
    ├── goals/             # Gestão de metas
    ├── subtasks/          # Gestão de subtarefas
    ├── instance/          # Conexão WhatsApp (Evolution API)
    ├── notification/      # Configurações e mensagens de notificação
    └── users/             # Gestão de usuários
```

Cada módulo segue a mesma organização:

```
modules/<modulo>/
├── route.ts / routes.ts   # Rotas + schemas do Swagger
├── schemas.ts             # Formato das respostas (o Fastify remove campos não declarados!)
├── controllers/           # Valida a request (Zod) e mapeia erros -> status HTTP
├── use-cases/             # Regras de negócio (não conhecem Fastify nem Prisma)
│   ├── errors/
│   ├── factories/         # Monta o use case com as implementações concretas
│   └── *.spec.ts          # Testes unitários com repositórios em memória
├── repositories/          # Interface + prisma/ + in-memory/
└── providers/             # (instance) Interface do WhatsApp + evolution/ + in-memory/
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/MarcosStanquini/goalspace-api.git
cd goalspace-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env-example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=dev
JWT_SECRET=seu_jwt_secret_aqui
POSTGRESQL_USER=docker
POSTGRESQL_PASSWORD=docker
POSTGRESQL_DATABASE=apimetaflow
DATABASE_URL=postgresql://docker:docker@localhost:5432/apimetaflow?schema=public
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_evolution_api
CORS_ORIGIN=http://localhost:5173
PORT=3333
```

### 4. Execute o docker

```bash
docker-compose up -d 
```

### 5. Execute as migrations

```bash
npx prisma migrate dev
```

### 6. Inicie o servidor

```bash
# Desenvolvimento
npm run dev
```

## 📖 Documentação da API

A documentação completa da API está disponível via Swagger:

- **Local**: http://localhost:3333/docs
- **Swagger JSON**: http://localhost:3333/docs/json


## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. Todas as rotas (exceto registro e login) requerem o header:

```http
Authorization: Bearer <seu_jwt_token>
```

### Roles de Usuário

- **user**: Acesso às próprias metas e subtarefas
- **admin**: Acesso completo ao sistema

## 📱 Sistema de Notificações

O GoalSpace integra com a **Evolution API** para enviar notificações via WhatsApp:

- ⏰ **Lembretes**: 1h e 24h antes do deadline
- 📊 **Relatórios semanais** de progresso
- 🎉 **Confirmações** de conclusão de metas

### 🔧 Fluxo de Ativação WhatsApp

Para ativar as notificações WhatsApp, siga este fluxo:

#### 1. Configure a Global API Key (primeira vez)
- Acesse: `http://localhost:8080/manager`
- Configure/obtenha a **Global API Key**
- Adicione esta chave no arquivo `.env` como `EVOLUTION_API_KEY`

#### 2. Conecte sua instância WhatsApp
- Faça uma requisição `POST /instance/connect` (com JWT token) — a instância é criada automaticamente na primeira vez
- O campo `qrCode` vem como data URL base64 (pode ser usado direto em `<img src>`); vem `null` se já estiver conectado
- Escaneie o QR Code com seu WhatsApp
- Faça polling em `GET /instance/status` até `connected: true` — nesse momento o número é salvo para as notificações
- Opcional: `POST /message/sendMessage` com `{ "message": "teste" }` envia uma mensagem para o seu próprio WhatsApp
- `DELETE /instance/logout` desconecta

#### 3. Configure suas preferências de notificação
- Faça uma requisição `PATCH /notificationSettings` para personalizar quais notificações deseja receber:
  - Lembretes de prazo (1h e 24h antes)
  - Relatórios semanais de progresso
  - Confirmações de conclusão de metas
  - Alertas de metas vencidas

```bash
# Exemplo de configuração
curl -X PATCH "http://localhost:3333/notificationSettings" \
  -H "Authorization: Bearer seu_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "remindBefore24h": true,
    "remindBefore1h": true,
    "onGoalCompleted": true,
    "weeklyReport": true,
    "achievementAlert": true
  }'
```

> As configurações atuais podem ser lidas com `GET /notificationSettings` (tudo `false` se nunca foram salvas).
> Hoje os jobs usam `remindBefore24h`, `remindBefore1h` e `achievementAlert`; `onGoalCompleted` e `weeklyReport` são salvos mas ainda não disparam mensagens.

## 🗺️ Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/users` | Cadastro (retorna o perfil) |
| POST | `/sessions` | Login (retorna `{ token }`) |
| GET | `/users/me` | Perfil do usuário logado |
| PATCH | `/users` | Atualiza nome/e-mail (409 se e-mail já existe) |
| PATCH | `/users/password` | Troca a senha (204) |
| GET | `/users/export` | Relatório PDF |
| GET | `/users` | Lista usuários (admin) |
| POST | `/goals` | Cria meta (retorna a meta criada) |
| GET | `/goals` | Lista metas (`goal_status`, `title_search`) — `[]` quando não há metas |
| GET | `/goals/summary` | Dashboard: contagem por status, subtarefas e % de conclusão |
| GET | `/goals/:id` | Detalhes da meta com subtarefas |
| PATCH | `/goals/:id` | Atualiza meta (título, descrição, prazo, concluída) |
| DELETE | `/goals/:id` | Exclui meta e subtarefas (204) |
| POST | `/goals/:goal_id/subtasks` | Cria subtarefa |
| PATCH | `/subtasks/:id` | Atualiza subtarefa (descrição / concluída) |
| DELETE | `/subtasks/:id` | Exclui subtarefa (204) |
| GET / PATCH | `/notificationSettings` | Lê / salva preferências de notificação |
| POST | `/instance/connect` | Gera o QR Code do WhatsApp |
| GET | `/instance/status` | Estado da conexão WhatsApp |
| DELETE | `/instance/logout` | Desconecta o WhatsApp |
| POST | `/message/sendMessage` | Mensagem de teste para o próprio WhatsApp |

**Convenções para o front:**
- Datas (`deadline`) em ISO 8601 **com fuso**: `2025-12-31T23:59:00-03:00` ou `...Z`
- Erros sempre no formato `{ "message": string }` (validação: `{ message, issues }`, status 400)
- Recursos de outro usuário respondem 404
- CORS liberado para as origens de `CORS_ORIGIN`

## 📊 Funcionalidades Avançadas
### Filtros e Busca

```http
GET /goals?goal_status=active&title_search=exercicio
```

### Status Automático de Metas

- **active**: Meta dentro do prazo
- **expired**: Meta vencida
- **completed**: Meta concluída

### Relatórios PDF

```http
GET /users/export
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Testes (unitários + e2e com repositórios em memória, sem precisar de banco)
npm test

# Checagem de tipos
npm run typecheck

# Linting
npm run lint

# Build de produção
npm run build && npm start
```

### Estrutura de Banco

O projeto utiliza Prisma ORM com PostgreSQL. Principais entidades:

- **Users**: Usuários do sistema
- **Goals**: Metas dos usuários
- **Subtasks**: Subtarefas das metas
- **NotificationsSettings**: Configurações das notificações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request


### 🚀 Próximas Versões

- [ ] Paginação na listagem de metas
- [ ] Disparo das notificações `onGoalCompleted` e `weeklyReport`
- [ ] Sistema de categorias/tags para metas
- [ ] Gamificação (pontos, badges, níveis)
- [ ] Metas colaborativas
- [ ] Integração com calendários
- [ ] IA para sugestões de metas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Marcos Stanquini** - *Desenvolvedor Full Stack*

- LinkedIn: [Clique aqui!](https://www.linkedin.com/in/marcos-stanquini/)


---

⭐ **Se este projeto te ajudou, deixe uma estrela!**
