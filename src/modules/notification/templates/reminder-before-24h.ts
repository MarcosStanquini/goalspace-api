interface Goal {
  title: string
  deadline: Date
}

interface GenerateReminderMessageParams {
  userName: string
  goals: Goal[]
}

export function generateReminderMessageForGoals({
  userName,
  goals,
}: GenerateReminderMessageParams): string {
  const list = goals
    .map((goal) => {
      const date = new Date(goal.deadline)
      const formattedDate = date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
      return `• ${goal.title} - ${formattedDate}`
    })
    .join('\n')

  return `Olá, ${userName}!\n\nVocê tem ${goals.length} metas agendadas para as próximas 24 horas:\n\n${list}\n\nVamos com tudo! 💪`
}
