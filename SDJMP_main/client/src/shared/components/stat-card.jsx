import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({ icon: Icon, label, value, accentClass = 'text-primary' }) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6">
        {Icon ? <Icon className={`mb-4 h-8 w-8 ${accentClass}`} /> : null}
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
