'use client'

import React from "react"

import { useRef, useState } from 'react'
import { useVerification } from '@/lib/verification-context'
import { parseExcelFile, validateExcelFile } from '@/lib/excel-parser'
import { SetupGuide } from '@/components/setup-guide'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    setError(null)
    setSuccess(false)

    if (!validateExcelFile(file)) {
      setError('Please upload a valid Excel file (.xlsx or .xls)')
      return
    }

    setIsLoading(true)
    try {
      const data = await parseExcelFile(file)
      if (data.length === 0) {
        setError('Excel file is empty. Please upload a file with data.')
        return
      }
      setUploadedData(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file')
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
    handleFileSelect(file)
  }

  const previewData = uploadedData.slice(0, 5)
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
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 transition-colors hover:border-primary hover:bg-secondary"
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success-foreground">
            Successfully uploaded {uploadedData.length} rows. You can now proceed to the Verification tab.
          </AlertDescription>
        </Alert>
      )}

      {uploadedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Data Preview</h3>
            <span className="text-sm text-muted-foreground">{uploadedData.length} rows total</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Row</TableHead>
                  {columns.slice(0, 5).map((col) => (
                    <TableHead key={col} className="font-semibold">
                      {col}
                    </TableHead>
                  ))}
                  {columns.length > 5 && <TableHead className="text-xs text-muted-foreground">+ {columns.length - 5} more</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    {columns.slice(0, 5).map((col) => (
                      <TableCell key={`${row.id}-${col}`} className="text-sm">
                        {String(row[col] || '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {uploadedData.length > 5 && (
            <p className="text-xs text-muted-foreground">Showing first 5 rows of {uploadedData.length}</p>
          )}
        </div>
      )}
    </div>
  )
}
