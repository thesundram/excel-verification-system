'use client'

import { useVerification } from '@/lib/verification-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Download, RotateCcw, CheckCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { AlertTriangle, Clock, XCircle, ChevronRight, Activity } from 'lucide-react'

// ... existing code ...

export function DashboardTab() {
  const { uploadedData, getVerificationStats, resetAllData, recentHistory } = useVerification()
  const stats = getVerificationStats()

  const handleExport = () => {
    // Prepare data for export
    const headers = uploadedData.length > 0 ? Object.keys(uploadedData[0]).filter((k) => k !== 'id') : []
    const csvContent = [
      headers.join(','),
      ...uploadedData.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] || '')
            // Escape quotes and wrap in quotes if contains comma or newline
            return value.includes(',') || value.includes('"') || value.includes('\n')
              ? `"${value.replace(/"/g, '""')}"`
              : value
          })
          .join(',')
      ),
    ].join('\n')

    // Download CSV
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute('download', `verification-results-${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Verification results downloaded successfully')
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all uploaded data and history? This cannot be undone.')) {
      resetAllData()
      toast.success('All data has been reset')
    }
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const verificationPercentage = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0

  if (uploadedData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No data to display</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload an Excel file and complete some verifications to see your dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Top Banner / Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {new Date().toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="h-10 border-border">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-10 border-destructive/30 text-destructive hover:bg-destructive/10">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Hero Completion Bar */}
      <Card className="p-6 md:p-8 bg-card shadow-sm border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 relative z-10 gap-4">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Project Completion</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-extrabold text-primary tracking-tight">{verificationPercentage}</span>
              <span className="text-xl font-bold text-muted-foreground ml-1">%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-right text-muted-foreground">
            {stats.verified} / {stats.total} Items Verified
          </p>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden relative z-10">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" 
            style={{ width: `${verificationPercentage}%` }} 
          />
        </div>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Total Rows Card */}
        <Card className="flex flex-col items-center text-center p-6 shadow-sm border-border transition-all hover:shadow-md">
          <div className="rounded-2xl bg-blue-500/10 p-4 mb-4">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mb-1">{stats.total}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Items</p>
        </Card>

        {/* Verified Rows Card */}
        <Card className="flex flex-col items-center text-center p-6 shadow-sm border-border transition-all hover:shadow-md">
          <div className="rounded-2xl bg-emerald-500/10 p-4 mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mb-1">{stats.verified}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified</p>
        </Card>

        {/* Unverified Rows Card */}
        <Card className="flex flex-col items-center text-center p-6 shadow-sm border-border transition-all hover:shadow-md">
          <div className="rounded-2xl bg-amber-500/10 p-4 mb-4">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mb-1">{stats.unverified}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
        </Card>
      </div>

      {/* Completion Message */}
      {stats.unverified === 0 && stats.total > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/10 p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
          <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">All Items Verified!</h4>
          <p className="mt-2 text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80">
            You have successfully verified all {stats.total} items in your batch.
          </p>
        </Card>
      )}

      {/* Recent Activity List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
        
        {recentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border-2 border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-bold text-foreground">No recent activity</p>
            <p className="text-sm font-medium text-muted-foreground mt-2 text-center max-w-sm">
              Scan items using the camera to see your verification history appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((entry: any, index: number) => (
              <Card 
                key={index}
                className="flex items-center p-4 shadow-sm border-border transition-all hover:shadow-md hover:border-border/80 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 ${
                  entry.status === 'success' ? 'bg-emerald-500/15' :
                  entry.status === 'warning' ? 'bg-amber-500/15' : 'bg-red-500/15'
                }`}>
                  {entry.status === 'success' ? <CheckCircle className="h-6 w-6 text-emerald-500" /> :
                   entry.status === 'warning' ? <AlertTriangle className="h-6 w-6 text-amber-500" /> :
                   <XCircle className="h-6 w-6 text-red-500" />}
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-bold text-foreground truncate mr-2">
                      {entry.batchNo || 'Unknown Batch'}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pt-0.5">
                      {getRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      S.No: <span className="font-semibold text-foreground">{entry.sno || 'N/A'}</span>
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      entry.status === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      entry.status === 'warning' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {entry.status === 'success' ? 'Verified' : entry.status}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
