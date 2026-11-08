import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Erros 4xx não melhoram com nova tentativa
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && failureCount < 2,
    },
  },
})
