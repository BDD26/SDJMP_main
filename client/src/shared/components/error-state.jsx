import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data right now.',
  description,
  onRetry,
}) {
  const copy = description || message

  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
        {onRetry ? (
          <Button className="mt-6" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  )
}
