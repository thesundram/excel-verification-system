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
import { Upload, CheckCircle, AlertCircle, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UploadTab() {
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

      <div className="max-w-2xl">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Upload Excel File</h2>
        <p className="text-muted-foreground">Upload your Excel file to begin the verification process</p>
      </div>

      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 sm:p-12 transition-colors hover:border-primary hover:bg-secondary"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <Upload className="mb-4 h-12 w-12 text-primary" />
        <div className="mb-4 text-center">
          <p className="mb-2 text-lg font-semibold text-foreground">Drag and drop your Excel file here</p>
          <p className="text-sm text-muted-foreground">or</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          size="lg"
          className="mb-4"
        >
          {isLoading ? 'Processing...' : 'Select File'}
        </Button>
        <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls</p>
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
                          {String(row[col] || '-')}
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
                      const val = String(row[col] || '-')
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
