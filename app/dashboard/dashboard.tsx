'use client'

import { useState } from 'react'
import { useVerification } from '@/lib/verification-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Download, RotateCcw, CheckCircle, FileText, Activity, AlertTriangle, Clock, XCircle, ChevronRight, Copy, Eye, Search } from 'lucide-react'
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
  const [activitySearch, setActivitySearch] = useState('')
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
        <Card className="relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-8 shadow-sm border border-primary/20 bg-card/60 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:border-blue-500/50 hover:-translate-y-1 group">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 rounded-2xl bg-blue-500/10 p-4 mb-4 group-hover:bg-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-1 ring-blue-500/20 group-hover:ring-blue-500">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <p className="relative z-10 text-4xl sm:text-5xl font-black text-foreground mb-1 tracking-tighter drop-shadow-sm">{stats.total}</p>
          <p className="relative z-10 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">Total Items</p>
        </Card>

        {/* Verified Rows Card */}
        <Card className="relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-8 shadow-sm border border-primary/20 bg-card/60 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:border-emerald-500/50 hover:-translate-y-1 group">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 rounded-2xl bg-emerald-500/10 p-4 mb-4 group-hover:bg-emerald-500 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 group-hover:text-white transition-colors" />
          </div>
          <p className="relative z-10 text-4xl sm:text-5xl font-black text-foreground mb-1 tracking-tighter drop-shadow-sm">{stats.verified}</p>
          <p className="relative z-10 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-emerald-500 transition-colors">Verified</p>
        </Card>

        {/* Unverified Rows Card */}
        <Card className="relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-8 shadow-sm border border-primary/20 bg-card/60 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:border-amber-500/50 hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 rounded-2xl bg-amber-500/10 p-4 mb-4 group-hover:bg-amber-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-1 ring-amber-500/20 group-hover:ring-amber-500">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 group-hover:text-white transition-colors" />
          </div>
          <p className="relative z-10 text-4xl sm:text-5xl font-black text-foreground mb-1 tracking-tighter drop-shadow-sm">{stats.unverified}</p>
          <p className="relative z-10 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-amber-500 transition-colors">Pending</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <span>Recent Activity</span>
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-black text-primary">
              {recentHistory.length}
            </span>
          </h3>
          {/* Activity Search */}
          {recentHistory.length > 0 && (
            <div className="relative w-full sm:max-w-xs shrink-0 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary opacity-50" />
              <input
                type="text"
                placeholder="Search history..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="pl-8 sm:pl-9 h-9 sm:h-10 w-full rounded-xl border border-primary/20 bg-background/60 backdrop-blur-md px-3 py-1 text-xs sm:text-sm font-medium shadow-inner transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/70"
              />
            </div>
          )}
        </div>

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
          <div className="relative rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 p-2 sm:p-3">
             <div className="overflow-auto max-h-[400px] sm:max-h-[500px] scrollbar-thin scrollbar-thumb-primary/60 hover:scrollbar-thumb-primary scrollbar-track-primary/5 pr-1 sm:pr-2">
               <div className="grid grid-cols-1 gap-3 w-full pb-1">
                 {recentHistory.filter((entry: any) => {
                    const searchLower = activitySearch.toLowerCase();
                    return entry.batchNo.toLowerCase().includes(searchLower) || 
                           entry.sno.toLowerCase().includes(searchLower) || 
                           (entry.type === 'manual' ? 'manual' : 'qr scan').includes(searchLower);
                 }).length > 0 ? (
                     recentHistory.filter((entry: any) => {
                        const searchLower = activitySearch.toLowerCase();
                        return entry.batchNo.toLowerCase().includes(searchLower) || 
                               entry.sno.toLowerCase().includes(searchLower) || 
                               (entry.type === 'manual' ? 'manual' : 'qr scan').includes(searchLower);
                     }).map((entry: any, index: number) => (
                      <Card
                        key={index}
                        onClick={() => setSelectedEntry(entry)}
                        className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center justify-between p-3 sm:px-4 sm:py-3 shadow-md border-primary/10 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:bg-card/90 group cursor-pointer active:scale-[0.99] overflow-hidden relative"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors group-hover:w-2 ${entry.status === 'success' ? 'bg-emerald-500' :
                          entry.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
        
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            {/* Left Status Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-1.5 sm:ml-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm ${entry.status === 'success' ? 'bg-emerald-500/15' :
                            entry.status === 'warning' ? 'bg-amber-500/15' : 'bg-red-500/15'
                            }`}>
                            {entry.status === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
                                entry.status === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> :
                                <XCircle className="h-5 w-5 text-red-500" />}
                            </div>
        
                            {/* Center Content Text */}
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                            <div className="flex flex-col">
                                <span className="uppercase font-black tracking-widest text-[9px] text-muted-foreground group-hover:text-primary transition-colors">Batch No</span>
                                <p className={`text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-[180px] ${entry.batchNo === 'Unknown' ? 'text-destructive/80 italic' : 'text-foreground'}`}>
                                {entry.batchNo === 'Unknown' ? 'Unknown' : entry.batchNo}
                                </p>
                            </div>
        
                            <div className="flex flex-col sm:border-l sm:border-border/60 sm:pl-6">
                                <span className="uppercase font-black tracking-widest text-[9px] text-muted-foreground group-hover:text-primary transition-colors">S.No</span>
                                <span className={`text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-[150px] ${entry.sno === 'Unknown' ? 'text-destructive/80 italic' : 'text-foreground'}`}>
                                {entry.sno === 'Unknown' ? 'Unidentified' : entry.sno}
                                </span>
                            </div>
                            </div>
                        </div>
        
                        {/* Right Area: Verification Type, Time & View Icon */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0 shrink-0">
                          <div className="flex items-center gap-2 sm:border-l sm:border-border/60 sm:pl-4">
                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border shadow-sm transition-colors ${entry.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500/20' :
                              entry.status === 'warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500/20' :
                                'bg-red-500/10 text-red-600 border-red-500/20 group-hover:bg-red-500/20'
                              }`}>
                              {entry.type === 'manual' ? 'Manual' : 'QR Scan'}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">
                            {getRelativeTime(entry.timestamp)}
                          </span>
                          <div className="w-8 flex flex-col items-center justify-center shrink-0 sm:border-l sm:border-border/60 sm:pl-4">
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all duration-300" />
                          </div>
                        </div>
                      </Card>
                    ))
                 ) : (
                     <div className="text-center py-10 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto opacity-20 mb-3" />
                        <p className="font-bold">No matching activity found</p>
                        <p className="text-xs uppercase tracking-widest opacity-50 mt-1">Try another search term</p>
                     </div>
                 )}
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-md border-border bg-card max-h-[85vh] overflow-y-auto">
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
