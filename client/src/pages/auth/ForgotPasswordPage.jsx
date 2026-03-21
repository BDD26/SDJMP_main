import { useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRight, Briefcase, CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { requestPasswordReset } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async ({ email }) => {
    const result = await requestPasswordReset(email)

    if (!result.success) {
      toast.error(result.error || 'Failed to send reset link')
      return
    }

    setSubmittedEmail(email)
    toast.success('Password reset link sent')
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
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>We&apos;ll email you a secure link to create a new password</CardDescription>
          </CardHeader>
          <CardContent>
            {submittedEmail ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Check your inbox</h3>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium">{submittedEmail}</span>, a reset link is on the way.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
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
                  {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
