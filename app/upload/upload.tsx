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
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-card/60 backdrop-blur-xl p-10 sm:p-20 transition-all duration-500 hover:bg-primary/[0.02] hover:border-primary w-full shadow-2xl overflow-hidden shadow-primary/5"
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

          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />
            <div className="relative p-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl ring-1 ring-white/20 shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <UploadIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="mb-8 text-center space-y-2 relative z-10">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Deploy Data Source</p>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-80">Drag components or browse local drive</p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="lg"
            className="relative h-14 px-10 text-base font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_-5px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95 group/btn"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-spin" />
                Parsing Matrix...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Begin Upload <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </span>
            )}
          </Button>
          
          <div className="mt-8 flex items-center gap-6 opacity-40">
            <span className="text-[10px] font-black tracking-widest uppercase">Type: .XLSX / .XLS</span>
            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="text-[10px] font-black tracking-widest uppercase">Max: 50MB</span>
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
        <div className="space-y-4 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Data Preview</h3>
              <span className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {uploadedData.length} rows
              </span>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search within all data..."
                className="pl-9 bg-background focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="relative w-full overflow-auto max-h-[60vh] rounded-lg border border-border bg-card shadow-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <Table className="relative w-full whitespace-nowrap">
              <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-md z-10 shadow-sm border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold w-16 sticky left-0 bg-muted/95 z-20">Row</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col} className="font-semibold text-xs uppercase tracking-wider">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card shadow-[1px_0_0_0_rgba(0,0,0,0.05)] text-xs">
                        {idx + 1}
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={`${row.id}-${col}`} className="text-sm">
                          {String((row as any)[col] || '-')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground">
                      <p className="font-medium">No results found</p>
                      <p className="text-xs opacity-70 mt-1">Try adjusting your search query.</p>
                    </TableCell>
                  </TableRow>
                )}
                {summaryRows.map((row) => (
                  <TableRow key={row.id} className="bg-primary/5 hover:bg-primary/10 transition-colors border-t-2 border-primary/20">
                    <TableCell className="font-medium text-primary sticky left-0 bg-primary/5 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] text-xs">
                      {row.isTotal ? 'Total' : '*'}
                    </TableCell>
                    {columns.map((col) => {
                      const val = String((row as any)[col] || '-')
                      const isBold = val.toLowerCase() === 'total' || val.toLowerCase().includes('(kg)')
                      return (
                        <TableCell key={`${row.id}-${col}`} className={`text-sm ${isBold ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
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
      )}
    </div>
  )
}
