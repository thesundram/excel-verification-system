'use client'

import { useVerification } from '@/lib/verification-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Download, RotateCcw, CheckCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardTab() {
  const { uploadedData, getVerificationStats, resetAllData } = useVerification()
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
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      resetAllData()
      toast.success('All data has been reset')
    }
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
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          Summary of your batch verification progress and metrics
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {/* Total Rows Card */}
        <Card className="flex flex-col justify-between p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">Rows in Excel file</p>
          </div>
        </Card>

        {/* Verified Rows Card */}
        <Card className="flex flex-col justify-between border-success/30 bg-success/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Verified</h3>
            <div className="rounded-lg bg-success/20 p-2">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-success">{stats.verified}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.total > 0 ? `${verificationPercentage}% complete` : 'No verifications yet'}
            </p>
          </div>
        </Card>

        {/* Unverified Rows Card */}
        <Card className="flex flex-col justify-between border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
            <div className="rounded-lg bg-destructive/20 p-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-destructive">{stats.unverified}</p>
            <p className="mt-1 text-xs text-muted-foreground">Items to verify</p>
          </div>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Verification Progress</h3>
          <span className="text-2xl font-bold text-primary">{verificationPercentage}%</span>
        </div>
        <Progress value={verificationPercentage} className="h-3" />
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>{stats.verified} verified</span>
          <span>{stats.unverified} remaining</span>
        </div>
      </Card>

      {/* Summary Statistics */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-foreground">Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Total Rows</span>
            <span className="font-semibold text-foreground">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Verified (Green)</span>
            <span className="font-semibold text-success">{stats.verified}</span>
          </div>
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm text-muted-foreground">Not Verified</span>
            <span className="font-semibold text-destructive">{stats.unverified}</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleExport} variant="secondary" className="flex-1" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset All Data
        </Button>
      </div>

      {/* Completion Message */}
      {stats.unverified === 0 && stats.total > 0 && (
        <Card className="border-success/30 bg-success/10 p-6 text-center">
          <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
          <h4 className="text-lg font-semibold text-success">All Items Verified!</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            You have successfully verified all {stats.total} items in your batch.
          </p>
        </Card>
      )}
    </div>
  )
}
