import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Building2,
  Mail,
  Globe,
  FileText,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { StatCard } from '@/components/shared/StatCard'

const INITIAL_EMPLOYERS = [
  {
    id: 1,
    name: 'TechFlow Solutions',
    email: 'hr@techflow.io',
    website: 'https://techflow.io',
    status: 'pending',
    registrationDate: '1 day ago',
    documents: ['Certificate of Inc.', 'Tax ID'],
    industry: 'Software Development'
  },
  {
    id: 2,
    name: 'Innovate Corp',
    email: 'careers@innovate.com',
    website: 'https://innovate.com',
    status: 'verified',
    registrationDate: '1 week ago',
    documents: ['Certificate of Inc.'],
    industry: 'Consulting'
  },
  {
    id: 3,
    name: 'Scammy Inc',
    email: 'info@xyz.biz',
    website: 'http://xyz.biz',
    status: 'pending',
    registrationDate: '2 hours ago',
    documents: [],
    industry: 'Marketing'
  }
]

export default function EmployerVerification() {
  const [employers, setEmployers] = useState(INITIAL_EMPLOYERS)

  const handleAction = (id, newStatus) => {
    setEmployers(employers.map(e => e.id === id ? { ...e, status: newStatus } : e))
    if (newStatus === 'verified') toast.success('Employer verified successfully')
    else if (newStatus === 'suspended') toast.error('Employer suspended')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-4">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1 px-3 border-none capitalize">
          Employer Moderation
        </Badge>
        <PageHeader
          title="Verification Queue"
          description="Review and verify employer accounts to maintain a secure and trustworthy marketplace."
        >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="h-12 w-64 pl-10 pr-4 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Search employer..." />
          </div>
          <Button variant="outline" className="h-12 rounded-xl px-4 gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={AlertTriangle} title="Pending Approval" value={employers.filter(e => e.status === 'pending').length} />
        <StatCard icon={ShieldCheck} title="Total Verified" value={employers.filter(e => e.status === 'verified').length} />
        <StatCard icon={ShieldAlert} title="Flagged/Suspended" value={employers.filter(e => e.status === 'suspended').length} trendUp={false} />
      </div>

      <div className="grid gap-6">
        {employers.map((employer) => (
          <GlassCard key={employer.id} className={`hover:shadow-2xl transition-all duration-300 group overflow-hidden relative ${employer.status === 'suspended' ? 'opacity-60 grayscale' : ''}`}>
             <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-2xl font-bold font-heading">{employer.name}</h3>
                          {employer.status === 'verified' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold gap-1 py-0.5 px-2 text-[10px]">
                              <ShieldCheck className="h-3 w-3" /> VERIFIED
                            </Badge>
                          ) : employer.status === 'suspended' ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border-none font-bold gap-1 py-0.5 px-2 text-[10px]">
                              <XCircle className="h-3 w-3" /> SUSPENDED
                            </Badge>
                          ) : (
                             <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold gap-1 py-0.5 px-2 text-[10px]">
                              <AlertTriangle className="h-3 w-3" /> PENDING
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{employer.industry}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <span className="flex items-center gap-1.5 font-bold"><Mail className="h-4 w-4 text-primary" /> {employer.email}</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Globe className="h-4 w-4" /> {employer.website}</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><FileText className="h-4 w-4" /> {employer.documents.length} Docs Provided</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-xl border-2 font-bold gap-2">
                       <FileText className="h-4 w-4" />
                       Review Docs
                    </Button>
                    {employer.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 font-bold gap-2"
                          onClick={() => handleAction(employer.id, 'verified')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="ghost"
                          className="h-12 px-6 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold gap-2"
                          onClick={() => handleAction(employer.id, 'suspended')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {employer.status === 'verified' && (
                      <Button 
                        variant="ghost"
                        className="h-12 px-6 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold gap-2"
                        onClick={() => handleAction(employer.id, 'suspended')}
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Suspend
                      </Button>
                    )}
                    {employer.status === 'suspended' && (
                      <Button 
                        variant="ghost"
                        className="h-12 px-6 rounded-xl text-emerald-500 hover:bg-emerald-500/10 font-bold gap-2"
                        onClick={() => handleAction(employer.id, 'verified')}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Reactivate
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Full Document History</DropdownMenuItem>
                        <DropdownMenuItem>Message Employer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
             </CardContent>
          </GlassCard>
        ))}
      </div>

      
    </div>
  )
}
