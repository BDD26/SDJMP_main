import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProviders } from '@/app/providers'

export default function App() {
  return (
    <AppProviders>
      <Toaster position="top-right" richColors />
      <Outlet />
      <ScrollRestoration />
    </AppProviders>
  )
}
