import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

// Conta de demonstração para desenvolvimento local: demo@goalspace.dev / demo1234
const DEMO_EMAIL = 'demo@goalspace.dev'
const DEMO_PASSWORD = 'demo1234'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const prisma = new PrismaClient()

const goals = [
  {
    title: 'Entregar o portfólio',
    description: 'Revisar os três projetos principais e publicar o site.',
    offset: 9 * HOUR,
    subtasks: [
      ['Escrever os estudos de caso', true],
      ['Revisar os textos', true],
      ['Publicar o site', false],
    ],
  },
  {
    title: 'Renovar o passaporte',
    offset: 3 * DAY,
    subtasks: [
      ['Pagar a taxa', true],
      ['Agendar na Polícia Federal', false],
    ],
  },
  {
    title: 'Correr 10 km',
    description: 'Treinar três vezes por semana até a prova.',
    offset: 12 * DAY,
    subtasks: [
      ['Comprar tênis', true],
      ['Correr 3 km sem parar', true],
      ['Correr 5 km', true],
      ['Correr 8 km', false],
      ['Prova de 10 km', false],
    ],
  },
  {
    title: 'Ler 12 livros no ano',
    offset: 45 * DAY,
    subtasks: [
      ['Livro 9', true],
      ['Livro 10', true],
      ['Livro 11', false],
      ['Livro 12', false],
    ],
  },
  { title: 'Certificação AWS', offset: 70 * DAY, subtasks: [] },
  {
    title: 'Viagem para o Chile',
    offset: 140 * DAY,
    subtasks: [
      ['Comprar passagens', false],
      ['Reservar hospedagem', false],
    ],
  },
  { title: 'Fechar o orçamento do trimestre', offset: -2 * DAY, subtasks: [] },
  {
    title: 'Aprender a fazer pão',
    offset: -20 * DAY,
    completed: true,
    subtasks: [],
  },
  {
    title: 'Organizar as finanças',
    offset: 10 * DAY,
    completed: true,
    subtasks: [],
  },
  { title: 'Lançar o blog', offset: -60 * DAY, completed: true, subtasks: [] },
  { title: 'Tirar a CNH', offset: -90 * DAY, completed: true, subtasks: [] },
]

async function main() {
  const password_hash = await hash(DEMO_PASSWORD, 6)
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: { name: 'Marina Demo', email: DEMO_EMAIL, password_hash },
    update: {},
  })

  // Recria só as metas da conta de demonstração
  await prisma.subTask.deleteMany({ where: { goal: { user_id: user.id } } })
  await prisma.goal.deleteMany({ where: { user_id: user.id } })

  for (const goal of goals) {
    await prisma.goal.create({
      data: {
        title: goal.title,
        description: goal.description,
        deadline: new Date(Date.now() + goal.offset),
        isCompleted: goal.completed ?? false,
        user_id: user.id,
        SubTasks: {
          create: goal.subtasks.map(([description, isCompleted], index) => ({
            description: description as string,
            isCompleted: isCompleted as boolean,
            // Na mesma transação o now() seria igual para todas
            created_at: new Date(Date.now() + index),
          })),
        },
      },
    })
  }

  console.log(`Seed pronto: ${DEMO_EMAIL} com ${goals.length} metas.`)
}

main().finally(() => prisma.$disconnect())
