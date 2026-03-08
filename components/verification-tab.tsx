'use client'

import { useState, useCallback, useMemo } from 'react'
import { useVerification } from '@/lib/verification-context'
import { QRScanner } from '@/components/qr-scanner'
import { QRFormatGuide } from '@/components/qr-format-guide'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle, Search } from 'lucide-react'
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
  const { uploadedData, markRowAsVerified, lastScannedQR, setLastScannedQR, getRowByBatchAndSNO, addToHistory } = useVerification()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCount, setScannedCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const isSummaryRow = (row: Record<string, any>) => {
    return Object.values(row).some(val => {
      const str = String(val).toLowerCase().trim()
      return str === 'total' || str.includes('(kg)')
    })
  }

  const mainData = useMemo(() => uploadedData.filter(row => !isSummaryRow(row)), [uploadedData])
  const summaryRows = useMemo(() => uploadedData.filter(row => isSummaryRow(row)).map(r => ({
    ...r,
    isTotal: Object.values(r).some(v => String(v).toLowerCase().trim() === 'total')
  })), [uploadedData])

  const filteredData = useMemo(() => mainData.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }), [mainData, searchTerm])

  const columns = uploadedData.length > 0 ? Object.keys(uploadedData[0]).filter((k) => k !== 'id' && k !== 'verified') : []


  const playSuccessSound = () => {
    try {
      const audio = new Audio('/success.mp3') // Assume exist or fallback to generic beep
      audio.play().catch(() => {})
    } catch (e) {}
  }

  const playErrorSound = () => {
    try {
      const audio = new Audio('/error.mp3')
      audio.play().catch(() => {})
    } catch (e) {}
  }

  const handleQRScan = useCallback(
    (qrValue: string) => {
      // Parse QR value to extract Batch No and Container No
      const parsedQR = parseQRValue(qrValue)

      if (!parsedQR) {
        playErrorSound()
        toast.error('Invalid QR format. Expected format: BATCH-CONTAINER or JSON with batch/container fields.')
        addToHistory({ batchNo: 'Unknown', sno: 'Unknown', timestamp: Date.now(), status: 'error', scanData: { rawValue: qrValue } })
        return
      }

      // Validate parsed QR data
      const validation = validateParsedQR(parsedQR)
      if (!validation.valid) {
        playErrorSound()
        toast.error(validation.error || 'Invalid QR data')
        addToHistory({ batchNo: parsedQR.batchNo || 'Unknown', sno: 'Unknown', timestamp: Date.now(), status: 'error', scanData: { ...parsedQR, rawValue: qrValue } })
        return
      }

      const batchNo = parsedQR.batchNo
      const containerNo = parsedQR.containerNo
      
      // Better extraction logic to match VeriScan Pro
      let sno = String(parsedQR['S No'] || parsedQR['S.NO'] || parsedQR['sno'] || '')
      if (!sno) {
        sno = extractSNOFromContainer(containerNo)
      }

      // Prepare data for display
      const scannedData = {
        'Batch No': batchNo,
        'S.NO': sno,
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
        if (matchingRow.verified) {
            playErrorSound()
            toast.warning(`Already Verified: Row ${matchingRow['S.NO']} was already scanned.`)
            addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'warning', scanData: { ...parsedQR, rawValue: qrValue } })
        } else {
            markRowAsVerified(matchingRow.id, {
            'Batch No': batchNo,
            'S.NO': sno,
            'Container No': containerNo,
            ...parsedQR,
            timestamp: Date.now(),
            })
            setScannedCount((prev) => prev + 1)
            playSuccessSound()
            toast.success(`Successfully matched! Row ${matchingRow['S.NO']} verified.`)
            addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'success', scanData: { ...parsedQR, rawValue: qrValue } })
        }
      } else {
        // Check if at least Batch No exists in the uploaded data
        // @ts-ignore
        const batchExists = uploadedData.some(row => row['Batch no']?.toString().replace(/\s/g, '').toLowerCase() === batchNo.replace(/\s/g, '').toLowerCase())

        playErrorSound()
        if (batchExists) {
          toast.warning(`Partial Match: Batch found (${batchNo}) but S.NO (${sno}) does not match any unverified row.`)
          addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'warning', scanData: { ...parsedQR, rawValue: qrValue } })
        } else {
          toast.error(`Not Found: No matching row found for Batch: ${batchNo}`)
          addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'error', scanData: { ...parsedQR, rawValue: qrValue } })
        }
      }
    },
    [getRowByBatchAndSNO, markRowAsVerified, setLastScannedQR, uploadedData, addToHistory]
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Uploaded Data</h3>
              <p className="text-sm text-muted-foreground">
                {verifiedRowIds.size} of {uploadedData.length} rows verified
              </p>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search data..."
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
                    <TableRow
                      key={row.id}
                      className={`transition-colors ${row.verified
                        ? 'bg-success/20 hover:bg-success/30'
                        : 'hover:bg-muted/50'
                        }`}
                    >
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
