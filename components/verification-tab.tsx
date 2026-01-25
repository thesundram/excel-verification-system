'use client'

import { useState, useCallback, useMemo } from 'react'
import { useVerification } from '@/lib/verification-context'
import { QRScanner } from '@/components/qr-scanner'
import { QRFormatGuide } from '@/components/qr-format-guide'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { parseQRValue, extractSNOFromContainer, validateParsedQR } from '@/lib/qr-parser'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function VerificationTab() {
  const { uploadedData, markRowAsVerified, lastScannedQR, setLastScannedQR, getRowByBatchAndSNO } = useVerification()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCount, setScannedCount] = useState(0)

  const handleQRScan = useCallback(
    (qrValue: string) => {
      // Parse QR value to extract Batch No and Container No
      const parsedQR = parseQRValue(qrValue)

      if (!parsedQR) {
        toast.error('Invalid QR format. Expected format: BATCH-CONTAINER or JSON with batch/container fields.')
        return
      }

      // Validate parsed QR data
      const validation = validateParsedQR(parsedQR)
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid QR data')
        return
      }

      const batchNo = parsedQR.batchNo
      const containerNo = parsedQR.containerNo
      const sno = extractSNOFromContainer(containerNo) // First 2 digits? Or extracted from "X of Y"

      // Prepare data for display
      const scannedData = {
        'Batch No': batchNo,
        'Container No': containerNo,
        ...parsedQR.parameters,
        timestamp: Date.now()
      }
      // Remove internal keys
      // @ts-ignore
      delete scannedData.value
      setLastScannedQR(scannedData as any)

      const matchingRow = getRowByBatchAndSNO(batchNo, sno)

      if (matchingRow) {
        markRowAsVerified(matchingRow.id, {
          'Batch No': batchNo,
          'Container No': containerNo,
          timestamp: Date.now(),
        })
        setScannedCount((prev) => prev + 1)
        toast.success(`Successfully matched! Row ${matchingRow['S.NO']} verified.`)
      } else {
        // Check if at least Batch No exists in the uploaded data
        // @ts-ignore
        const batchExists = uploadedData.some(row => row['Batch no']?.toString().replace(/\s/g, '').toLowerCase() === batchNo.replace(/\s/g, '').toLowerCase())

        if (batchExists) {
          toast.warning(`Batch found (${batchNo}) but S.NO (${sno}) does not match any unverified row.`)
        } else {
          toast.error(`No matching row found for Batch: ${batchNo}`)
        }
      }
    },
    [getRowByBatchAndSNO, markRowAsVerified, setLastScannedQR, uploadedData]
  )

  const verifiedRowIds = useMemo(
    () => new Set(uploadedData.filter((r) => r.verified).map((r) => r.id)),
    [uploadedData]
  )

  if (uploadedData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No data uploaded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please upload an Excel file in the Upload tab to begin verification
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Verification</h2>
        <p className="text-muted-foreground">
          Scan QR codes to match against your Excel data. Matched rows will be highlighted green.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
        <div>
          <p className="text-sm text-muted-foreground">Scans Completed</p>
          <p className="text-2xl font-bold text-foreground">{scannedCount}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Rows</p>
          <p className="text-2xl font-bold text-foreground">{uploadedData.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold text-foreground">{uploadedData.length - scannedCount}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Panel: Excel Data Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Uploaded Data</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Row</TableHead>
                  {uploadedData.length > 0 &&
                    Object.keys(uploadedData[0])
                      .filter((k) => k !== 'id' && k !== 'verified')
                      .map((col) => (
                        <TableHead key={col} className="font-semibold">
                          {col}
                        </TableHead>
                      ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedData.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={`transition-colors ${row.verified
                      ? 'bg-success/20 hover:bg-success/30'
                      : 'hover:bg-muted/50'
                      }`}
                  >
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    {Object.keys(row)
                      .filter((k) => k !== 'id' && k !== 'verified')
                      .map((col) => (
                        <TableCell key={`${row.id}-${col}`} className="text-sm">
                          {String(row[col] || '-')}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            {verifiedRowIds.size} of {uploadedData.length} rows verified
          </p>
        </div>

        {/* Right Panel: QR Scanner */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">QR Code Scanner</h3>
          <QRScanner onScan={handleQRScan} isScanning={isScanning} setIsScanning={setIsScanning} />
          <QRFormatGuide />
        </div>
      </div>

      {lastScannedQR && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-3 font-semibold text-foreground">Last Scanned Data</h4>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(lastScannedQR)
              .filter(([key]) => key !== 'timestamp' && key !== 'rawValue')
              .map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-border/50 pb-1 last:border-0">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-semibold text-foreground break-all text-right">{String(value)}</span>
                </div>
              ))}
            <p className="text-xs text-muted-foreground pt-2">
              Scanned at: {new Date(lastScannedQR.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
