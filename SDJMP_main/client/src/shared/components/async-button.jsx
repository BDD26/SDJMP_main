import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AsyncButton({
  children,
  isLoading = false,
  loadingLabel = 'Saving...',
  ...props
}) {
  return (
    <Button disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? loadingLabel : children}
    </Button>
  )
}
