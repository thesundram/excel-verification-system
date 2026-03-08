'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload } from './upload/upload'
import { Verification } from './verification/verification'
import { Dashboard } from './dashboard/dashboard'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FileUp, CheckCircle, BarChart3 } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

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
              <Upload />
            </TabsContent>

            <TabsContent value="verification" className="animate-in fade-in-50 duration-300">
              <Verification />
            </TabsContent>

            <TabsContent value="dashboard" className="animate-in fade-in-50 duration-300">
              <Dashboard />
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
