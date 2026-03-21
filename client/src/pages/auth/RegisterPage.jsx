import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRight, Briefcase, Building2, GraduationCap, Lock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { APP_ROLES, getDashboardPath } from '@/app/roles'
import { toast } from 'sonner'

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
    role: z.enum([APP_ROLES.STUDENT, APP_ROLES.EMPLOYER]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const { register: registerAccount, loading } = useAuth()
  const navigate = useNavigate()

  const initialRole = searchParams.get('role') === APP_ROLES.EMPLOYER
    ? APP_ROLES.EMPLOYER
    : APP_ROLES.STUDENT

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
    },
  })

  const role = watch('role')
  const pending = useMemo(() => loading || isSubmitting, [loading, isSubmitting])

  const onSubmit = async (values) => {
    const result = await registerAccount({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    })

    if (!result.success) {
      toast.error(result.error || 'Registration failed')
      return
    }

    toast.success('Account created successfully')
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
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start with a clean, production-ready SkillMatch profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={role === APP_ROLES.STUDENT ? 'default' : 'outline'}
                    onClick={() => setValue('role', APP_ROLES.STUDENT)}
                    className="gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={role === APP_ROLES.EMPLOYER ? 'default' : 'outline'}
                    onClick={() => setValue('role', APP_ROLES.EMPLOYER)}
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Employer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" className="pl-10" placeholder="Enter your full name" {...register('name')} />
                </div>
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" className="pl-10" placeholder="you@company.com" {...register('email')} />
                </div>
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10" placeholder="Create a strong password" {...register('password')} />
                </div>
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" className="pl-10" placeholder="Confirm your password" {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword ? (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
