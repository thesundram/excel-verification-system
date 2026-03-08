'use client'

import { useState } from 'react'
import { useVerification } from '@/lib/verification-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Download, RotateCcw, CheckCircle, FileText, Activity, AlertTriangle, Clock, XCircle, ChevronRight, Copy, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Dashboard() {
  const { uploadedData, getVerificationStats, resetAllData, recentHistory } = useVerification()
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const stats = getVerificationStats()

  const handleExport = () => {
    // Prepare data for export
    const baseHeaders = uploadedData.length > 0 ? Object.keys(uploadedData[0]).filter((k) => k !== 'id' && k !== 'verificationType') : []
    const headers = [...baseHeaders, 'Verification Type']

    const csvContent = [
      headers.join(','),
      ...uploadedData.map((row) =>
        headers
          .map((header) => {
            let value = ''
            if (header === 'Verification Type') {
              if (row.verified) {
                value = row.verificationType === 'manual' ? 'Manual' : 'QR Scanner'
              } else {
                value = 'Unverified'
              }
            } else {
              value = String((row as any)[header] || '')
            }
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
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Project Overview</h2>
          <p className="text-[10px] sm:text-sm font-bold text-muted-foreground mt-1 uppercase tracking-[0.2em]">
            {new Date().toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button onClick={handleExport} variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm border-border shadow-sm hover:shadow-md transition-shadow flex-1 sm:flex-none" title="Export Verification Data as CSV">
            <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export CSV
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive shadow-sm transition-all hover:text-destructive flex-1 sm:flex-none" title="Reset All Data and History">
            <RotateCcw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Hero Completion Bar */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <Card className="p-5 sm:p-8 bg-card/90 backdrop-blur-xl shadow-lg border-primary/20 relative overflow-hidden ring-1 ring-border/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 relative z-10 gap-6">
            <div>
              <h3 className="text-[10px] sm:text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                Completion Status
              </h3>
              <div className="flex items-baseline">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 tracking-tighter drop-shadow-sm">{verificationPercentage}</span>
                <span className="text-xl sm:text-2xl font-bold text-primary ml-1 drop-shadow-sm">%</span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {stats.verified} <span className="text-lg sm:text-xl text-muted-foreground font-medium">/ {stats.total}</span>
              </p>
              <p className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Items Authenticated</p>
            </div>
          </div>

          <div className="h-3 sm:h-4 w-full bg-secondary/50 rounded-full overflow-hidden relative z-10 ring-1 ring-inset ring-black/10 dark:ring-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out rounded-full relative"
              style={{ width: `${verificationPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </Card>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Rows Card */}
        <Card className="flex flex-col items-center text-center p-5 sm:p-6 shadow-sm border-border/50 bg-card/60 backdrop-blur-md transition-all hover:shadow-lg hover:border-blue-500/30 hover:-translate-y-1 group">
          <div className="rounded-xl sm:rounded-2xl bg-blue-500/10 p-3 sm:p-4 mb-3 sm:mb-4 group-hover:bg-blue-500/20 transition-colors">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground mb-1 tracking-tight">{stats.total}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Items</p>
        </Card>

        {/* Verified Rows Card */}
        <Card className="flex flex-col items-center text-center p-5 sm:p-6 shadow-sm border-border/50 bg-card/60 backdrop-blur-md transition-all hover:shadow-lg hover:border-emerald-500/30 hover:-translate-y-1 group">
          <div className="rounded-xl sm:rounded-2xl bg-emerald-500/10 p-3 sm:p-4 mb-3 sm:mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground mb-1 tracking-tight">{stats.verified}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Verified</p>
        </Card>

        {/* Unverified Rows Card */}
        <Card className="flex flex-col items-center text-center p-5 sm:p-6 shadow-sm border-border/50 bg-card/60 backdrop-blur-md transition-all hover:shadow-lg hover:border-amber-500/30 hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
          <div className="rounded-xl sm:rounded-2xl bg-amber-500/10 p-3 sm:p-4 mb-3 sm:mb-4 group-hover:bg-amber-500/20 transition-colors">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground mb-1 tracking-tight">{stats.unverified}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending</p>
        </Card>
      </div>

      {/* Completion Message */}
      {stats.unverified === 0 && stats.total > 0 && (
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm p-5 sm:p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-inner">
          <CheckCircle className="mx-auto mb-2 sm:mb-3 h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 drop-shadow-md" />
          <h4 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">All Items Verified!</h4>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80">
            You have successfully verified all <span className="font-black">{stats.total}</span> items in your batch.
          </p>
        </Card>
      )}

      {/* Recent Activity List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          <span>Recent Activity</span>
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-black text-primary">
            {recentHistory.length}
          </span>
        </h3>

        {recentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border/60 w-full transition-colors hover:bg-card/60 hover:border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 ring-4 ring-background">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No recent activity</p>
            <p className="text-sm font-medium text-muted-foreground mt-2 text-center max-w-sm">
              Scan items using the camera to see your verification history appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 w-full">
            {recentHistory.map((entry: any, index: number) => (
              <Card
                key={index}
                onClick={() => setSelectedEntry(entry)}
                className="flex flex-row gap-0 w-full items-center justify-between py-2 px-3 shadow-sm border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/40 hover:bg-card group cursor-pointer active:scale-[0.99] overflow-hidden relative"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${entry.status === 'success' ? 'bg-emerald-500' :
                  entry.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />

                {/* Left Status Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-1.5 transition-transform group-hover:scale-110 ${entry.status === 'success' ? 'bg-emerald-500/15' :
                  entry.status === 'warning' ? 'bg-amber-500/15' : 'bg-red-500/15'
                  }`}>
                  {entry.status === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
                    entry.status === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> :
                      <XCircle className="h-5 w-5 text-red-500" />}
                </div>

                {/* Center Content Text */}
                <div className="flex-1 min-w-0 px-2 flex items-center justify-center gap-4 text-center">
                  <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                    <span className="uppercase font-bold tracking-widest text-[9px] text-muted-foreground mt-0.5">Batch No:</span>
                    <p className={`text-sm font-bold truncate max-w-[120px] sm:max-w-[180px] ${entry.batchNo === 'Unknown' ? 'text-destructive/80 italic' : 'text-foreground'}`}>
                      {entry.batchNo === 'Unknown' ? 'Unknown' : entry.batchNo}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 border-l border-border/60 pl-4 opacity-80 shrink-0">
                    <span className="uppercase font-bold tracking-widest text-[9px] text-muted-foreground mt-0.5">S.No:</span>
                    <span className={`text-xs font-semibold truncate max-w-[80px] sm:max-w-[150px] ${entry.sno === 'Unknown' ? 'text-destructive/80 italic' : 'text-foreground'}`}>
                      {entry.sno === 'Unknown' ? 'Unidentified' : entry.sno}
                    </span>
                  </div>
                </div>

                {/* Right Area: Verification Type, Time & View Icon */}
                <div className="flex items-center gap-3 shrink-0 pr-1">
                  <div className="hidden sm:flex items-center gap-2 border-l border-border/60 pl-4 opacity-100 shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${entry.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' :
                      entry.status === 'warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
                      }`}>
                      {entry.type === 'manual' ? 'Manual Verify' : 'QR Verify'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-foreground dark:text-foreground whitespace-nowrap">
                    {getRelativeTime(entry.timestamp)}
                  </span>
                  <div className="w-8 flex flex-col items-center justify-center shrink-0 border-l border-border/60 pl-3">
                    <Eye className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                    <span className="text-[9px] font-bold text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all uppercase tracking-widest hidden sm:block">View</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry?.status === 'success' ? <CheckCircle className="text-emerald-500 h-5 w-5" /> :
                selectedEntry?.status === 'warning' ? <AlertTriangle className="text-amber-500 h-5 w-5" /> :
                  <XCircle className="text-red-500 h-5 w-5" />}
              Scan Details
            </DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Batch Number</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEntry.batchNo}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Serial Number</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEntry.sno}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Additional Data</p>
                <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                  {Object.entries(selectedEntry.scanData || {})
                    .filter(([k]) => !['rawValue', 'Batch No', 'S.NO', 'Container No', 'timestamp', 'Batch no', 'Batch Number', 'batchNo', 'containerNo', 'sno'].includes(k))
                    .map(([key, val], idx) => (
                      <div key={key} className={`flex flex-col sm:flex-row sm:justify-between p-3 text-sm ${idx !== 0 ? 'border-t border-border' : ''}`}>
                        <span className="text-muted-foreground font-medium capitalize mb-1 sm:mb-0 pr-4">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-foreground text-left sm:text-right break-words">{String(val)}</span>
                      </div>
                    ))}
                  {Object.keys(selectedEntry.scanData || {}).filter(([k]) => !['rawValue', 'Batch No', 'S.NO', 'Container No', 'timestamp', 'Batch no', 'Batch Number', 'batchNo', 'containerNo', 'sno'].includes(k)).length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground italic">No additional extracted fields.</div>
                  )}
                </div>
              </div>

              {selectedEntry.scanData?.rawValue && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Raw QR Data</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2 text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEntry.scanData.rawValue)
                        toast.success('Raw data copied to clipboard')
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-muted/80 p-3 rounded-lg border border-border max-h-40 overflow-y-auto">
                    <p className="text-xs font-mono text-muted-foreground break-all whitespace-pre-wrap">
                      {selectedEntry.scanData.rawValue}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
