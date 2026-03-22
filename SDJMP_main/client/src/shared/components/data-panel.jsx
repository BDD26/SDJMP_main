import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DataPanel({ title, description, actions = null, children }) {
  return (
    <Card className="border-none shadow-md">
      {title || description || actions ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
          {actions}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
