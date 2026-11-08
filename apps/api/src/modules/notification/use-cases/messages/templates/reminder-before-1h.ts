interface Goal {
  title: string
  deadline: Date
}

interface GenerateReminderMessageParams {
  userName: string
  goals: Goal[]
}

export function generateReminder1hMessageForGoals({
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

  return `⚠️ Olá, ${userName}!\n\nVocê tem ${goals.length} metas com prazo para a próxima 1 hora:\n\n${list}\n\nHora de agir! 🚀`
}
