import { api } from '@/shared/api/client'
import type {
  Goal,
  GoalDetails,
  GoalInput,
  GoalListItem,
  GoalsSummary,
  GoalUpdateInput,
  Subtask,
} from './types'

export const goalsApi = {
  list: () => api.get<GoalListItem[]>('/goals'),
  summary: () => api.get<GoalsSummary>('/goals/summary'),
  details: (id: string) => api.get<GoalDetails>(`/goals/${id}`),
  create: (data: GoalInput) => api.post<Goal>('/goals', data),
  update: (id: string, data: GoalUpdateInput) =>
    api.patch<Goal>(`/goals/${id}`, data),
  remove: (id: string) => api.delete(`/goals/${id}`),
  createSubtask: (goalId: string, description: string) =>
    api.post<Subtask>(`/goals/${goalId}/subtasks`, { description }),
  toggleSubtask: (id: string, isCompleted: boolean) =>
    api.patch<Subtask>(`/subtasks/${id}`, { isCompleted }),
  removeSubtask: (id: string) => api.delete(`/subtasks/${id}`),
}
