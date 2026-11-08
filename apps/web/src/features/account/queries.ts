import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '@/shared/api/client'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
}

export const profileQuery = () =>
  queryOptions({
    queryKey: ['profile'],
    queryFn: () => api.get<UserProfile>('/users/me'),
  })

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      api.patch<UserProfile>('/users', data),
    onSuccess: (profile) =>
      queryClient.setQueryData(profileQuery().queryKey, profile),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.patch<void>('/users/password', data),
  })
}

export async function downloadReport() {
  const blob = await api.blob('/users/export')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'relatorio-metas.pdf'
  link.click()
  URL.revokeObjectURL(url)
}
