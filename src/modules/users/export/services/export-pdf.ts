import PDFDocument from 'pdfkit'

interface UserServiceRequest {
  name: string
  email: string
}

interface GoalServiceRequest {
  id: string
  title: string
  description: string | null
  deadline: Date
  created_at: Date
  goal_status: 'active' | 'expired' | 'completed'
  subtasks: {
    id: string
    description: string
    isCompleted: boolean
  }[]
}

export class PdfGeneratorService {
  async generate(data: {
    user: UserServiceRequest
    goals: GoalServiceRequest[]
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Buffer[] = []

    doc.font('Helvetica')

    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('end', () => {})

    doc
      .fontSize(22)
      .fillColor('#2E86C1')
      .text('RELATÓRIO DE METAS E SUBTAREFAS', {
        align: 'center',
        underline: true,
      })
    doc.moveDown(2)

    doc
      .fontSize(13)
      .fillColor('black')
      .text(`Usuário: `, { continued: true })
      .font('Helvetica-Bold')
      .text(`${data.user.name}`)
      .font('Helvetica')
      .text(`Email: ${data.user.email}`)
      .text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`)
    doc.moveDown(1.5)

    doc.fontSize(16).fillColor('#117A65').text('METAS:', { underline: true })
    doc.moveDown(0.5)

    data.goals.forEach((goal, idx) => {
      doc
        .fontSize(14)
        .fillColor('#2874A6')
        .font('Helvetica-Bold')
        .text(`Meta ${idx + 1}: ${goal.title}`)
        .fontSize(11)
        .fillColor('black')
        .font('Helvetica')
        .text(`Descrição: ${goal.description ?? 'Sem descrição'}`)
        .text(
          `Criada em: ${new Date(goal.created_at).toLocaleDateString('pt-BR')}`,
        )
        .text(
          `Prazo final: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}`,
        )

      let statusColor = '#229954'
      if (goal.goal_status === 'expired') statusColor = '#CB4335'
      if (goal.goal_status === 'completed') statusColor = '#2874A6'

      doc
        .moveDown(0.2)
        .fontSize(12)
        .fillColor(statusColor)
        .font('Helvetica-Bold')
        .text(`Status: ${goal.goal_status.toUpperCase()}`)
        .font('Helvetica')
        .fillColor('black')

      doc.moveDown(0.5)
      doc
        .fontSize(12)
        .fillColor('#B9770E')
        .font('Helvetica-Bold')
        .text('Subtarefas:')
      doc.moveDown(0.2)

      if (goal.subtasks.length === 0) {
        doc
          .font('Helvetica')
          .fillColor('black')
          .fontSize(11)
          .text('Nenhuma subtarefa cadastrada.')
      } else {
        goal.subtasks.forEach((subtask) => {
          const status = subtask.isCompleted ? '[x]' : '[ ]'
          doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('black')
            .text(`${status} ${subtask.description}`, { indent: 20 })
        })
      }

      doc.moveDown()
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#D5DBDB').stroke()
      doc.moveDown(1)
    })

    doc.end()

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
    })
  }
}
