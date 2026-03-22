import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { CardContent } from '@/components/ui/card'

const pendingJobs = [
  {
    id: 1,
    title: 'Senior Developer',
    company: 'TechCorp',
    status: 'pending',
    postedDate: '2 hours ago',
  },
]

export default function AdminJobModeration() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Job Moderation"
        description="Review and moderate job postings"
      />

      <div className="grid gap-4">
        {pendingJobs.map((job) => (
          <GlassCard key={job.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
                <Badge variant="outline">Pending Review</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Posted {job.postedDate}</p>

              <div className="flex gap-2">
                <Button size="sm" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button size="sm" variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
