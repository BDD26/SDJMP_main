import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRight, Briefcase, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { DEV_CREDENTIALS, isDevAuthEnabled } from '@/features/auth/dev-auth'
import { getDashboardPath } from '@/app/roles'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const showDevCredentials = isDevAuthEnabled()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const pending = useMemo(() => loading || isSubmitting, [loading, isSubmitting])

  const onSubmit = async (values) => {
    const result = await login(values.email, values.password)

    if (!result.success) {
      toast.error(result.error || 'Login failed')
      return
    }

    toast.success('Logged in successfully')
    navigate(getDashboardPath(result.user?.role), { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="ml-2 text-2xl font-bold">SkillMatch</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to continue to your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...register('password')}
                  />
                </div>
                {errors.password ? (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </div>

            {showDevCredentials ? (
              <div className="mt-6 rounded-xl border border-dashed bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Temporary Dev Credentials
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {DEV_CREDENTIALS.map((credential) => (
                    <div key={credential.email} className="rounded-lg bg-background p-3">
                      <p><span className="font-medium">Email:</span> {credential.email}</p>
                      <p><span className="font-medium">Password:</span> {credential.password}</p>
                      <p><span className="font-medium">Role:</span> {credential.user.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
