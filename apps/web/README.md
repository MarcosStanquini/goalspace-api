# GoalSpace Web

Aplicação React da carta orbital de metas. Veja como rodar no [README da raiz](../../README.md).

## Arquitetura

O código é organizado por feature, no estilo do bulletproof-react:

```
src/
├── main.tsx        # Monta os providers
├── routeTree.gen.ts # Gerado pelo TanStack Router, não editar
├── app/            # Composição: query client, router, layouts, estilos globais
├── routes/         # Rotas por arquivo; só conectam URL e features
│                   #   _app/index.tsx = universo em tela cheia; _app/_shell = páginas com cabeçalho
├── features/
│   ├── auth/           # Login e cadastro
│   ├── goals/          # Universo (home), carta orbital, cards, detalhes e subtarefas
│   ├── account/        # Perfil, senha e relatório em PDF
│   ├── notifications/  # Preferências de lembrete
│   └── whatsapp/       # Conexão por QR Code
└── shared/
    ├── api/        # Cliente HTTP e token
    ├── ui/         # Componentes shadcn/ui
    ├── components/ # Componentes de marca e tema
    ├── hooks/
    └── lib/
```

### Regras de dependência

- `routes` e `app` podem importar de `features` e `shared`.
- Uma feature importa só de `shared`, nunca de outra feature. Quando duas precisam se encontrar, a composição fica em `app` ou `routes`.
- De fora, uma feature é usada pelo `index.ts` dela.
- `shared` não importa de `features`, `routes` nem `app`.

### Estado

- **Dados da API:** TanStack Query. As alterações em metas invalidam a chave `['goals']`, então lista, resumo e detalhes andam juntos.
- **Estado de navegação:** na URL (`?goal=<id>&view=list`), para funcionar com voltar e com links diretos.
- **Formulários:** React Hook Form com Zod.
- **Estado local de tela:** `useState`. O projeto não precisa de store global.

## O universo (página principal)

A home é um sistema solar em 3D, em tela cheia (`components/goal-universe.tsx`), feito com three.js via react-three-fiber e drei. A cena fica num pacote separado, carregado sob demanda (`components/solar-system/index.tsx`).

- **Sol** (`solar-system/bodies.tsx`): shader com superfície animada e borda alaranjada; é a única luz da cena, então cada planeta tem lado dia e lado noite.
- **Planetas:** a textura é gerada em canvas a partir do id da meta (`solar-system/textures.ts`): gasoso com faixas e tempestade, rochoso com continentes e crateras, ou gelado com calotas. Têm atmosfera (brilho na borda) e anel de progresso das subtarefas.
- **Movimento:** cada planeta orbita o sol na própria velocidade, mais devagar quanto mais longe (3ª lei de Kepler). A posição usa o relógio absoluto, então é a mesma entre recarregamentos.
- **Câmera:** botão direito + arrastar gira; roda do mouse aproxima; no celular, um dedo gira e dois aproximam. A dock tem "Vista em perspectiva" e "Vista de cima".
- **Interface por cima:** saudação e números no topo, próximos prazos num painel lateral (telas largas) e a dock com nova meta, todas as metas (cards), viagem no tempo, câmeras, legenda e configurações.

A matemática (raio por prazo, velocidade orbital, cores) é pura e testada em `lib/solar.ts`.

| No sistema | Significado |
|------------|-------------|
| Distância do sol | Tempo até o prazo, em escala logarítmica |
| Planeta coral/laranja | Vence em menos de 24 horas |
| Anel coral perto do sol | Metas vencidas |
| Anel do planeta | Subtarefas concluídas |
| Tamanho do planeta | Quantidade de subtarefas |
| Estrela dourada | Meta conquistada |
| Viagem no tempo | Mostra o que terá vencido em até 90 dias |

Respeita `prefers-reduced-motion` (a cena fica parada), e o painel de cards oferece o mesmo conteúdo sem depender do 3D.

> Em desenvolvimento o console mostra "Attempted to synchronously unmount a root" uma vez por rótulo 3D: é o StrictMode montando duas vezes os rótulos do drei. No build de produção não aparece.

## Adicionar componentes shadcn

```bash
npx shadcn@latest add <componente>
```

Confira se o import de `cn` gerado aponta para `@/shared/lib/utils`.
