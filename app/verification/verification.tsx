'use client'

import { useState, useCallback, useMemo } from 'react'
import { useVerification } from '@/lib/verification-context'
import { QRScanner } from '@/components/qr-scanner'
import { Card } from '@/components/ui/card'
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

export function Verification() {
  const { uploadedData, markRowAsVerified, lastScannedQR, setLastScannedQR, getRowByBatchAndSNO, addToHistory, recentHistory } = useVerification()
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

  const filteredSummaryRows = useMemo(() => summaryRows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }), [summaryRows, searchTerm])

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

  const handleScan = useCallback(
    (qrValue: string, isManual: boolean = false) => {
      if (uploadedData.length === 0) {
        toast.error('No data uploaded. Please upload an Excel file first.')
        return
      }

      // Parse QR value to extract Batch No and Container No
      const parsedQR = parseQRValue(qrValue)

      if (!parsedQR) {
        playErrorSound()
        toast.error('Invalid QR Code Format')
        addToHistory({ batchNo: 'Unknown', sno: 'Unknown', timestamp: Date.now(), status: 'error', scanData: { rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
        return
      }

      // Validate parsed QR data
      const validation = validateParsedQR(parsedQR)
      if (!validation.valid) {
        playErrorSound()
        toast.error(`Invalid QR Data: ${validation.error}`)
        addToHistory({ batchNo: parsedQR.batchNo || 'Unknown', sno: 'Unknown', timestamp: Date.now(), status: 'error', scanData: { ...parsedQR, rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
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
        ...((parsedQR as any).parameters || {}),
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
            toast.warning(`Already Verified: Row ${sno} was already scanned.`)
            addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'warning', scanData: { ...parsedQR, rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
        } else {
            markRowAsVerified(matchingRow.id, {
            'Batch No': batchNo,
            'S.NO': sno,
            'Container No': containerNo,
            ...parsedQR,
            timestamp: Date.now(),
            }, isManual ? 'manual' : 'qr')
            setScannedCount((prev) => prev + 1)
            playSuccessSound()
            toast.success(`Successfully matched! Row ${sno} verified.`)
            addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'success', scanData: { ...parsedQR, rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
        }
      } else {
        // Find if batch exists loosely
        const batchExists = uploadedData.some(row => {
          const rowKeys = Object.keys(row)
          const batchKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === 'batchno' || k.toLowerCase().replace(/[^a-z0-9]/g, '') === 'batchnumber')
          if (!batchKey) return false
          return row[batchKey as keyof typeof row]?.toString().replace(/\s/g, '').toLowerCase() === batchNo.replace(/\s/g, '').toLowerCase()
        })

        playErrorSound()
        if (batchExists) {
          toast.warning(`Partial Match: Batch found (${batchNo}) but S.NO (${sno}) does not match any unverified row.`)
          addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'warning', scanData: { ...parsedQR, rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
        } else {
          toast.error(`Not Found: No matching row found for Batch: ${batchNo}`)
          addToHistory({ batchNo, sno, timestamp: Date.now(), status: 'error', scanData: { ...parsedQR, rawValue: qrValue }, type: isManual ? 'manual' : 'qr' })
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
      <div className="max-w-3xl mb-2">
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent drop-shadow-sm">Verification Workstation</h2>
        <p className="text-lg font-medium text-muted-foreground/90">
          Scan or enter QR codes to match against your active dataset. Authenticated items will be marked automatically.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Scans Completed Card */}
        <Card className="relative overflow-hidden border-primary/20 bg-card/60 backdrop-blur-md p-4 sm:p-6 transition-all hover:shadow-xl hover:border-primary/40 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Scans Completed
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{scannedCount}</span>
              <span className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase">Units</span>
            </div>
          </div>
        </Card>

        {/* Total Dataset Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 group">
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 sm:mb-3">Total Dataset</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter">{uploadedData.length}</span>
              <span className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase">Rows</span>
            </div>
          </div>
        </Card>

        {/* Pending Authentication Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 group sm:col-span-2 lg:col-span-1">
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 sm:mb-3">Pending Authentication</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter">{uploadedData.length - scannedCount}</span>
              <span className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase">Remaining</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Panel: Excel Data Table */}
        <div className="space-y-4 order-2 lg:order-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-2xl border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
             
             <div className="relative z-10 space-y-1">
              <h3 className="text-base sm:text-xl font-black text-foreground flex items-center gap-2">
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Uploaded Data</span>
              </h3>
              <p className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest block opacity-80">
                <span className="text-emerald-500">{verifiedRowIds.size}</span> / {uploadedData.length} verified
              </p>
            </div>
            
            <div className="relative w-full sm:max-w-xs z-10 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary opacity-50" />
              <Input
                type="text"
                placeholder="Search matrix..."
                className="pl-8 sm:pl-9 h-9 sm:h-10 bg-background/60 backdrop-blur-md focus:ring-primary focus:border-primary border-primary/20 rounded-xl shadow-inner font-medium text-xs sm:text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl blur-lg pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500" />
             
            <div className="relative overflow-auto max-h-[50vh] sm:max-h-[60vh] scrollbar-thin scrollbar-thumb-primary/60 hover:scrollbar-thumb-primary scrollbar-track-primary/5">
              <Table className="relative w-full whitespace-nowrap">
                <TableHeader className="sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-b border-primary/20">
                    <TableHead className="font-black w-12 sm:w-16 sticky left-0 bg-secondary/80 backdrop-blur-md z-30 text-primary uppercase tracking-widest text-[10px]">#</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col} className="font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/80 backdrop-blur-md">
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
                        className={`transition-colors border-b border-white/5 group/row ${row.verified
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[inset_4px_0_0_0_rgba(16,185,129,1)]'
                          : 'hover:bg-primary/5'
                          }`}
                      >
                        <TableCell className={`font-bold sticky left-0 text-xs shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-colors ${row.verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-card/90 backdrop-blur-md text-muted-foreground group-hover/row:text-primary'}`}>
                          {idx + 1}
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={`${row.id}-${col}`} className={`text-sm font-medium transition-colors ${row.verified ? 'text-emerald-500/90' : 'group-hover/row:text-foreground/90'}`}>
                            {String(row[col as keyof typeof row] || '-')}
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
                      <TableCell className="font-black text-primary sticky left-0 bg-card/60 backdrop-blur-md shadow-[1px_0_0_0_rgba(var(--primary),0.2)] text-[9px] sm:text-[10px] uppercase tracking-widest">
                        {row.isTotal ? 'Net' : 'Sum'}
                      </TableCell>
                      {columns.map((col) => {
                        const val = String(row[col as keyof typeof row] || '-')
                        const isBold = val.toLowerCase() === 'total' || val.toLowerCase().includes('(kg)')
                        return (
                          <TableCell key={`${row.id}-${col}`} className={`text-[10px] sm:text-xs lg:text-sm ${isBold ? 'font-black text-primary drop-shadow-sm' : 'font-bold text-foreground/80'}`}>
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

        {/* Right Panel: QR Scanner */}
        <div className="space-y-4">
          <QRScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />
        </div>
      </div>

      {lastScannedQR && (
        <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
          <h4 className="mb-4 font-extrabold text-foreground flex items-center justify-between relative z-10">
            <span>Last Scanned Data</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
               {(recentHistory.length > 0 && recentHistory[0].batchNo === lastScannedQR['Batch No'] && recentHistory[0].type === 'manual') ? 'Manual Verify' : 'QR Verify'}
            </span>
          </h4>
          <div className="space-y-2.5 font-mono text-sm relative z-10">
            {Object.entries(lastScannedQR)
              .filter(([key]) => key !== 'timestamp' && key !== 'rawValue' && key !== 'verificationType')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{key}:</span>
                  <span className="font-bold text-foreground text-right">{String(value)}</span>
                </div>
              ))}
            <div className="pt-2 text-xs font-semibold text-muted-foreground mt-2 border-t border-border/50 flex justify-between items-center">
              <span>Scanned at:</span>
              <span className="text-foreground">{new Date(lastScannedQR.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
