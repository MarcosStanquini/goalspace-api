import { GoalsRepository } from '../repositories/goals-repository'
import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { UserNotExists } from '@/modules/users/use-cases/errors/user-not-exists-error'

interface CreateGoalUseCaseRequest {
  title: string
  description?: string
  deadline: Date
  user_id: string
}

export class CreateGoalUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    title,
    description,
    deadline,
    user_id,
  }: CreateGoalUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user) {
      throw new UserNotExists()
    }

    await this.goalsRepository.create({
      title,
      description,
      deadline,
      user_id,
    })
  }
}
