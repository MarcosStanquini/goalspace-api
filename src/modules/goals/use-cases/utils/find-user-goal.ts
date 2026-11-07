import { GoalsRepository } from '../../repositories/goals-repository'
import { GoalNotFound } from '../errors/goal-not-found'

// Busca a meta garantindo que ela pertence ao usuário.
// Retorna "não encontrada" também quando é de outro usuário, para não vazar a existência do id.
export async function findUserGoal(
  goalsRepository: GoalsRepository,
  goal_id: string,
  user_id: string,
) {
  const goal = await goalsRepository.findById(goal_id)

  if (!goal || goal.user_id !== user_id) {
    throw new GoalNotFound()
  }

  return goal
}
