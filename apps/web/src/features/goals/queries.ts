import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { goalsApi } from './api'
import type { GoalDetails, GoalInput, GoalUpdateInput } from './types'

export const goalsQueries = {
  list: () =>
    queryOptions({ queryKey: ['goals', 'list'], queryFn: goalsApi.list }),
  summary: () =>
    queryOptions({ queryKey: ['goals', 'summary'], queryFn: goalsApi.summary }),
  details: (id: string) =>
    queryOptions({
      queryKey: ['goals', 'details', id],
      queryFn: () => goalsApi.details(id),
    }),
}

const showError = (error: Error) => toast.error(error.message)

// Toda alteração invalida ['goals']: lista, resumo e detalhes andam juntos
function useInvalidateGoals() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['goals'] })
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (data: GoalInput) => goalsApi.create(data),
    onSuccess: invalidate,
    onError: showError,
  })
}

export function useUpdateGoal() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalUpdateInput }) =>
      goalsApi.update(id, data),
    onSuccess: invalidate,
    onError: showError,
  })
}

export function useDeleteGoal() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onSuccess: invalidate,
    onError: showError,
  })
}

export function useCreateSubtask(goalId: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (description: string) =>
      goalsApi.createSubtask(goalId, description),
    onSuccess: invalidate,
    onError: showError,
  })
}

export function useRemoveSubtask() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (id: string) => goalsApi.removeSubtask(id),
    onSuccess: invalidate,
    onError: showError,
  })
}

export function useToggleSubtask(goalId: string) {
  const queryClient = useQueryClient()
  const detailsKey = goalsQueries.details(goalId).queryKey

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      goalsApi.toggleSubtask(id, isCompleted),
    // Marca na hora; desfaz se a API recusar
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: detailsKey })
      const previous = queryClient.getQueryData<GoalDetails>(detailsKey)

      if (previous) {
        queryClient.setQueryData<GoalDetails>(detailsKey, {
          ...previous,
          subtasks: previous.subtasks.map((subtask) =>
            subtask.id === id ? { ...subtask, isCompleted } : subtask,
          ),
        })
      }

      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailsKey, context.previous)
      }
      showError(error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}
