interface GoalReminderMessage {
  name: string
  date: Date
  goal_name: string
}

export const goalReminderMessage = (data: GoalReminderMessage): string => {
  const formattedDate = data.date.toLocaleDateString('pt-BR')
  return `Olá ${data.name}, tudo bem? Lembre-se que sua meta "${data.goal_name}" está marcada para o dia ${formattedDate}. Vamos nessa! 💪`
}
