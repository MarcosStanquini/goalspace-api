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
├── http/
│   └── middlewares/       # Middlewares de autenticação
├── jobs/                  # Jobs de notificação automatizada
├── lib/                   # Utilitários e configurações
└── modules/
    ├── auth/              # Autenticação e autorização
    ├── goals/             # Gestão de metas
    ├── subtasks/          # Gestão de subtarefas
    └── users/             # Gestão de usuários
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/goalspace-api.git
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
EVOLUTION_API_KEY=sua_chave_evolution_api
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

### Configuração Evolution API

1. Configure sua instância da Evolution API
2. Adicione a chave no arquivo `.env`
3. As notificações serão enviadas automaticamente

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

# Linting
npm run lint
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

- [ ] Dashboard com métricas de produtividade
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