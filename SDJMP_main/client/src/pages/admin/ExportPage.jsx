import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Clock, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle2,
  Trash2,
  FileText,
  History,
  Info,
  ArrowRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'

const EXPORT_HISTORY = [
  { id: 1, name: 'Active_Jobs_March_2024.csv', type: 'Jobs', date: '2 hours ago', size: '42 KB', status: 'ready' },
  { id: 2, name: 'All_Applicants_Q1.xlsx', type: 'Applicants', date: 'Yesterday', size: '156 KB', status: 'ready' },
  { id: 3, name: 'Employer_Verification_Log.pdf', type: 'Compliance', date: '3 days ago', size: '1.2 MB', status: 'expired' }
]

export default function ExportPage() {
  const [exportType, setExportType] = useState('jobs')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      toast.success(`Export for ${exportType} generated successfully!`)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-4">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1 px-3 border-none capitalize">
          Data & Reports
        </Badge>
        <PageHeader
          title="Data Exports"
          description="Export system data for external analysis, auditing, or backup. Generate custom CSV and PDF reports."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Generate New Report
              </CardTitle>
              <CardDescription>Select the data type and date range for your export.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Data Entity</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobs">Job Postings</SelectItem>
                      <SelectItem value="applicants">Applicant List</SelectItem>
                      <SelectItem value="employers">Employer Accounts</SelectItem>
                      <SelectItem value="assessments">Assessment Results</SelectItem>
                      <SelectItem value="placements">Placement Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File Format</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                      <SelectItem value="xlsx">Excel Workbook (.xlsx)</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="json">JSON Metadata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                   <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 rounded-2xl border border-white/20">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Advanced Filter
                </h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-background cursor-pointer hover:bg-primary/5 transition-colors px-3 py-1">Verified Employers Only</Badge>
                    <Badge variant="outline" className="bg-background cursor-pointer hover:bg-primary/5 transition-colors px-3 py-1">Active Jobs Only</Badge>
                    <Badge variant="outline" className="bg-background cursor-pointer hover:bg-primary/5 transition-colors px-3 py-1">Include Private Notes</Badge>
                    <Badge variant="outline" className="bg-background cursor-pointer hover:bg-primary/10 bg-primary/5 border-primary/20 text-primary px-3 py-1">Internal IDs</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 border-t bg-muted/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4" />
                Estimated file size: ~2.4 MB
              </div>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 font-black text-lg gap-2"
              >
                {isExporting ? <Clock className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {isExporting ? 'Generating...' : 'Start Export'}
              </Button>
            </CardFooter>
          </GlassCard>

          <GlassCard className="overflow-hidden">
             <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Export History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                 {EXPORT_HISTORY.map((item) => (
                   <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                     <div className="flex items-start gap-4">
                       <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                         {item.name.endsWith('.csv') ? <FileSpreadsheet className="h-5 w-5 text-emerald-500" /> : <FileText className="h-5 w-5 text-blue-500" />}
                       </div>
                       <div>
                         <h5 className="font-bold mb-1">{item.name}</h5>
                         <div className="flex items-center gap-4 text-xs text-muted-foreground">
                           <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px]">{item.type}</Badge></span>
                           <span className="flex items-center gap-1 font-medium">{item.size}</span>
                           <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.date}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {item.status === 'ready' ? (
                           <Button variant="ghost" className="rounded-xl h-10 px-4 text-emerald-600 hover:bg-emerald-500/10 gap-2 font-bold">
                             <Download className="h-4 w-4" />
                             Download
                           </Button>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">Expired</Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </GlassCard>
        </div>

        <div className="space-y-6">
           <GlassCard className="overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Audit Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                All exports are logged with the administrator's ID and timestamp to comply with the <b>Data Residency & Security Policy</b>.
              </p>
              <div className="p-4 rounded-xl bg-background/50 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Last Audit</span>
                  <span>12m ago</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                  <ShieldCheck className="h-4 w-4" />
                  System Secure
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 border-t p-6">
               <Button variant="ghost" className="w-full text-xs text-primary gap-1 group">
                 View Audit Logs
                 <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
               </Button>
            </CardFooter>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                API Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Automate your reporting via our webhook or REST API endpoints.</p>
              <code className="text-[10px] block p-3 bg-muted rounded-xl font-mono text-primary overflow-x-auto">
                GET /api/v1/exports/jobs?format=csv
              </code>
              <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold">API Documentation</Button>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      
    </div>
  )
}
