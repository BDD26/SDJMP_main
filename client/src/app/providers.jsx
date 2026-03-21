import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { queryClient } from '@/shared/api/query-client'

export function AppProviders({ children }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="skillmatch-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
