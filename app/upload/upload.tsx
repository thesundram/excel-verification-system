'use client'

import React from "react"

import { useRef, useState } from 'react'
import { useVerification } from '@/lib/verification-context'
import { parseExcelFile, validateExcelFile } from '@/lib/excel-parser'
import { SetupGuide } from '@/components/setup-guide'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Upload as UploadIcon, CheckCircle, AlertCircle, Search, ArrowRight, Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function Upload() {
  const { setUploadedData, uploadedData } = useVerification()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    if (!validateExcelFile(file)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)')
      return
    }

    setIsLoading(true)
    try {
      const data = await parseExcelFile(file)
      if (data.length === 0) {
        toast.error('Excel file is empty. Please upload a file with data.')
        return
      }
      setUploadedData(data)
      toast.success(`Successfully uploaded ${data.length} rows. You can now proceed to the Verification tab.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse Excel file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFileSelect(file || null)
  }

  const isSummaryRow = (row: Record<string, any>) => {
    return Object.values(row).some(val => {
      const str = String(val).toLowerCase().trim()
      return str === 'total' || str.includes('(kg)')
    })
  }

  const mainData = uploadedData.filter(row => !isSummaryRow(row))
  const summaryRows = uploadedData.filter(row => isSummaryRow(row)).map(r => ({
    ...r,
    isTotal: Object.values(r).some(v => String(v).toLowerCase().trim() === 'total')
  }))

  const filteredData = mainData.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredSummaryRows = summaryRows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = uploadedData.length > 0 ? Object.keys(uploadedData[0]).filter((k) => k !== 'id' && k !== 'verified') : []

  return (
    <div className="space-y-8">
      {uploadedData.length === 0 && (
        <div>
          <SetupGuide />
        </div>
      )}
      <div className="w-full mb-2">
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent drop-shadow-sm">Upload Dataset</h2>
        <p className="text-lg font-medium text-muted-foreground/90">Drop your Excel file here to initialize the verification workflow.</p>
      </div>

      <div className="relative group w-full">
        {/* Animated Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500" />
        
        <div
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-card/60 backdrop-blur-xl p-6 sm:p-10 md:p-20 transition-all duration-500 hover:bg-primary/[0.02] hover:border-primary w-full shadow-2xl overflow-hidden shadow-primary/5"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Internal Glow Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
            disabled={isLoading}
          />

          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />
            <div className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl ring-1 ring-white/20 shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <UploadIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="mb-6 sm:mb-8 text-center space-y-1 sm:space-y-2 relative z-10">
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">Deploy Data Source</p>
            <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80">Drag components or browse local drive</p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="lg"
            className="relative h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-black rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_-5px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95 group/btn w-full sm:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <Activity className="h-4 w-4 animate-spin" />
                Parsing Matrix...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Begin Upload <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </span>
            )}
          </Button>
          
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-6 opacity-40">
            <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase">Type: .XLSX / .XLS</span>
            <div className="hidden sm:block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase text-center w-full sm:w-auto">Max Recommended: 50MB</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Parsing Excel file...</p>
          </div>
          <Progress value={60} className="h-2" />
        </div>
      )}

      {uploadedData.length > 0 && (
        <div className="space-y-4 lg:col-span-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-2xl border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
             
             <div className="relative z-10 space-y-1">
              <h3 className="text-base sm:text-xl font-black text-foreground flex items-center gap-2">
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Data Preview</span>
              </h3>
              <p className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest block opacity-80">
                <span className="text-primary">{uploadedData.length}</span> rows initialized
              </p>
            </div>
            
            <div className="relative w-full sm:max-w-xs z-10 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary opacity-50" />
              <Input
                type="text"
                placeholder="Search dataset..."
                className="pl-8 sm:pl-9 h-9 sm:h-10 bg-background/60 backdrop-blur-md focus:ring-primary focus:border-primary border-primary/20 rounded-xl shadow-inner font-medium text-xs sm:text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 group">
             <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl blur-lg pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500" />
             
            <div className="relative overflow-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-primary/60 hover:scrollbar-thumb-primary scrollbar-track-primary/5">
              <Table className="relative w-full whitespace-nowrap">
                <TableHeader className="sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-b border-primary/20">
                    <TableHead className="font-black w-16 sticky left-0 bg-secondary/80 backdrop-blur-md z-30 text-primary uppercase tracking-widest text-[10px]">#</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col} className="font-bold text-xs uppercase tracking-wider text-muted-foreground bg-secondary/80 backdrop-blur-md">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, idx) => (
                      <TableRow key={row.id} className="hover:bg-primary/5 transition-colors border-b border-white/5 group/row">
                        <TableCell className="font-bold text-muted-foreground sticky left-0 bg-card/90 backdrop-blur-md shadow-[1px_0_0_0_rgba(255,255,255,0.05)] text-xs group-hover/row:text-primary transition-colors">
                          {idx + 1}
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={`${row.id}-${col}`} className="text-sm font-medium group-hover/row:text-foreground/90 transition-colors">
                            {String((row as any)[col] || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-32 sm:h-40 text-center text-muted-foreground relative overflow-hidden">
                        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 z-10 relative px-4">
                           <Search className="h-6 w-6 sm:h-8 sm:w-8 opacity-20" />
                           <div>
                             <p className="font-black text-sm sm:text-lg">No matches found</p>
                             <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-50 mt-0.5 sm:mt-1">Adjust search parameters</p>
                           </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredSummaryRows.map((row) => (
                    <TableRow key={row.id} className="bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 transition-colors border-t border-primary/30 relative">
                      <TableCell className="font-black text-primary sticky left-0 bg-card/60 backdrop-blur-md shadow-[1px_0_0_0_rgba(var(--primary),0.2)] text-[10px] uppercase tracking-widest">
                        {row.isTotal ? 'Net' : 'Sum'}
                      </TableCell>
                      {columns.map((col) => {
                        const val = String((row as any)[col] || '-')
                        const isBold = val.toLowerCase() === 'total' || val.toLowerCase().includes('(kg)')
                        return (
                          <TableCell key={`${row.id}-${col}`} className={`text-sm ${isBold ? 'font-black text-primary drop-shadow-sm' : 'font-bold text-foreground/80'}`}>
                            {val}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
