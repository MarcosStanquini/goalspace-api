# GoalSpace

Metas pessoais em uma carta orbital: cada meta é um planeta, e quanto mais perto do prazo, mais perto do centro. Lembretes chegam pelo WhatsApp.

| Pacote | O que é | Stack |
|--------|---------|-------|
| [`apps/api`](apps/api/README.md) | API REST | Fastify, Prisma, PostgreSQL, Evolution API |
| [`apps/web`](apps/web/README.md) | Aplicação web | React, TanStack Router e Query, Tailwind, shadcn/ui, Motion |

O monorepo usa npm workspaces e Turborepo.

## Como rodar

Pré-requisitos: Node.js 22 e Docker.

```bash
npm install
cp apps/api/.env-example apps/api/.env
npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev
```

Edite `JWT_SECRET` e `EVOLUTION_API_KEY` em `apps/api/.env` antes de subir a infraestrutura.

- Web: http://localhost:5173
- API: http://localhost:3333 (Swagger em `/docs`)
- Conta criada pelo seed: `demo@goalspace.dev` / `demo1234`

## Scripts da raiz

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Sobe API e web juntas |
| `npm run dev:api` / `npm run dev:web` | Sobe só uma delas |
| `npm run build` | Gera o build de produção dos dois apps |
| `npm test` | Roda os testes dos dois apps |
| `npm run typecheck` | Checa os tipos dos dois apps |
| `npm run lint` | Roda o ESLint com correção automática |
| `npm run infra:up` / `npm run infra:down` | Sobe ou derruba PostgreSQL e Evolution API |
| `npm run db:migrate` / `npm run db:seed` | Aplica migrations / recria os dados de demonstração |

## Deploy (Render)

O `render.yaml` descreve um Postgres e um único serviço web: a API roda e também serve o front buildado (variável `WEB_DIST`), então tudo fica na mesma origem. As migrations rodam ao iniciar (`start:prod`).

No plano gratuito o serviço dorme após 15 minutos sem uso (a primeira visita demora cerca de 50 s) e o banco expira em 30 dias. A Evolution API (WhatsApp) não sobe nesse plano: o resto funciona normalmente.

## Licença

MIT. Veja [LICENSE.md](LICENSE.md).
