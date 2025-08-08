const dedicationQuotes = [
  '“A perseverança é o trabalho duro que você faz depois de se cansar do trabalho duro que já fez.” – Newt Gingrich',
  '“O sucesso é a soma de pequenos esforços repetidos dia após dia.” – Robert Collier',
  '“A maior glória em viver não está em nunca cair, mas em nos levantar a cada queda.” – Nelson Mandela',
  '“A disciplina é a ponte entre metas e realizações.” – Jim Rohn',
  '“A dedicação é o que transforma talento em realização.” – Unknown',
  '“Não é o mais forte que sobrevive, nem o mais inteligente, mas o que melhor se adapta às mudanças.” – Charles Darwin',
  '“A motivação nos faz começar. O hábito nos faz continuar.” – Jim Ryun',
  '“A diferença entre o possível e o impossível está na determinação de uma pessoa.” – Tommy Lasorda',
  '“O sucesso geralmente vem para quem está ocupado demais para procurar por ele.” – Henry David Thoreau',
  '“A força não provém da capacidade física, e sim de uma vontade indomável.” – Mahatma Gandhi',
]

function getRandomQuote(): string {
  const index = Math.floor(Math.random() * dedicationQuotes.length)
  return dedicationQuotes[index]
}

interface AchievementMessageParams {
  userName: string
  completedCount: number
}

export function generateAchievementMessage({
  userName,
  completedCount,
}: AchievementMessageParams): string {
  const quote = getRandomQuote()

  return `Fala, ${userName}! você ja completou ${completedCount} metas. 👏\n\nLembre-se: \n"${quote}"\n\nContinue assim, firme e focado! 🚀`
}
