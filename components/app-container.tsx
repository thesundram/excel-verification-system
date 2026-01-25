'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadTab } from '@/components/upload-tab'
import { VerificationTab } from '@/components/verification-tab'
import { DashboardTab } from '@/components/dashboard-tab'
import { Footer } from '@/components/footer'
import { FileUp, CheckCircle, BarChart3 } from 'lucide-react'

export function AppContainer() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">V</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verification System</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload Excel files, scan QR codes, and track batch verification in real-time
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="upload" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Verify</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="upload" className="animate-in fade-in-50 duration-300">
              <UploadTab />
            </TabsContent>

            <TabsContent value="verification" className="animate-in fade-in-50 duration-300">
              <VerificationTab />
            </TabsContent>

            <TabsContent value="dashboard" className="animate-in fade-in-50 duration-300">
              <DashboardTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-4">
        <Footer />
      </div>
    </div>
  )
}
