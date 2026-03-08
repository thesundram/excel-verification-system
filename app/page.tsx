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
    <div className="min-h-screen bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1">
        <Header>
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 items-center bg-secondary/30 backdrop-blur-xl rounded-xl p-1 border border-white/5 shadow-inner">
            <TabsTrigger 
              value="upload" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold h-full rounded-lg sm:rounded-xl transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 hover:text-foreground text-muted-foreground"
            >
              <FileUp className="h-4 w-4" />
              <span className="uppercase tracking-wider">Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold h-full rounded-lg sm:rounded-xl transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 hover:text-foreground text-muted-foreground"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="uppercase tracking-wider">Verify</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold h-full rounded-lg sm:rounded-xl transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 hover:text-foreground text-muted-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="uppercase tracking-wider">Dashboard</span>
            </TabsTrigger>
          </TabsList>
        </Header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
          <div className="w-full">
            <TabsContent value="upload" className="animate-in fade-in-50 duration-300 m-0">
              <Upload />
            </TabsContent>

            <TabsContent value="verification" className="animate-in fade-in-50 duration-300 m-0">
              <Verification />
            </TabsContent>

            <TabsContent value="dashboard" className="animate-in fade-in-50 duration-300 m-0">
              <Dashboard />
            </TabsContent>
          </div>
        </main>
      </Tabs>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-4">
        <Footer />
      </div>
    </div>
  )
}
