import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from '@/app/query-client'
import { router } from '@/app/router'
import '@/app/styles.css'
import { setUnauthorizedHandler, tokenStorage } from '@/shared/api/client'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

setUnauthorizedHandler(() => {
  tokenStorage.clear()
  queryClient.clear()
  router.navigate({ to: '/login' })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
