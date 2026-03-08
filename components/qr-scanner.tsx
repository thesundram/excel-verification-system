'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertCircle, Camera, X, CheckCircle2, RefreshCw } from 'lucide-react'
import { parseQRValueFull } from '@/lib/qr-parser'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('react-qr-barcode-scanner'), { ssr: false })

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
  setIsScanning: (active: boolean) => void
}

export function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannedValue, setScannedValue] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ReturnType<typeof parseQRValueFull> | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [stopStream, setStopStream] = useState(false)
  const scannedCodesRef = useRef<Set<string>>(new Set())

  // Ensure stream stops when component unmounts or stops scanning
  useEffect(() => {
    if (!isScanning) {
      setStopStream(true)
    } else {
      setStopStream(false)
      setCameraError(null)
    }
    
    return () => {
       setStopStream(true)
    }
  }, [isScanning])

  const handleUpdate = useCallback((err: any, result: any) => {
    if (result) {
      const text = result.getText ? result.getText() : result.text
      if (text && !scannedCodesRef.current.has(text)) {
        console.log('QR Code detected:', text)
        scannedCodesRef.current.add(text)
        setScannedValue(text)
        const parsed = parseQRValueFull(text)
        setParsedData(parsed)
        onScan(text)

        // Allow re-scanning the same code after 3 seconds
        setTimeout(() => {
          if (scannedCodesRef.current) {
            scannedCodesRef.current.delete(text)
          }
        }, 3000)
      }
    } else if (err) {
       // Only handle actual camera errors like permissions, skip NotFound errors
       if (err.name === 'NotAllowedError') {
         setCameraError('Camera access denied. Please allow permissions.')
       }
    }
  }, [onScan])

  const handleManualEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const qrValue = (formData.get('qr-value') as string)?.trim()

    if (qrValue) {
      console.log('Manual QR entry submitted:', qrValue)
      setScannedValue(qrValue)
      const parsed = parseQRValueFull(qrValue)
      setParsedData(parsed)
      onScan(qrValue)
      ;(e.target as HTMLFormElement).reset()
    }
  }

  const handleClearScan = () => {
    setScannedValue(null)
    setParsedData(null)
  }

  const handleResetScanner = () => {
    scannedCodesRef.current.clear()
    handleClearScan()
  }

  const handleCameraSwitch = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
    scannedCodesRef.current.clear()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">QR Code Scanner</h3>
        {isScanning && !cameraError && (
          <Badge variant="secondary" className="bg-success/20 text-success animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )}
      </div>

      {!isScanning ? (
        <Button
          onClick={() => {
            scannedCodesRef.current.clear()
            setIsScanning(true)
          }}
          size="lg"
          className="w-full"
        >
          <Camera className="mr-2 h-4 w-4" />
          Start Scanner
        </Button>
      ) : (
        <Button
          onClick={() => {
            setStopStream(true)
            setTimeout(() => setIsScanning(false), 0)
          }}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Stop Scanner
        </Button>
      )}

      {cameraError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      {isScanning && !cameraError && (
        <div className="relative w-full overflow-hidden rounded-lg border-2 border-primary bg-black flex items-center justify-center min-h-[400px]">
          <BarcodeScanner
            width="100%"
            height="100%"
            facingMode={facingMode}
            onUpdate={handleUpdate}
            stopStream={stopStream}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleCameraSwitch}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <label className="block text-sm font-medium text-foreground">Manual QR Entry</label>
        <p className="text-xs text-muted-foreground mb-3">Paste or type QR code data directly.</p>
        <form onSubmit={handleManualEntry} className="flex gap-2">
          <input
            type="text"
            name="qr-value"
            placeholder="Paste or type QR code value..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="off"
          />
          <Button type="submit" variant="secondary" size="sm">
            Submit
          </Button>
        </form>
      </div>

      {scannedValue && parsedData && (
        <Card className="border-success bg-success/10 p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">QR Code Detected</h4>
                  <Badge variant="outline" className="mt-2">
                    Format: <span className="ml-1 capitalize">{parsedData.format}</span>
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleResetScanner} variant="outline" size="sm" title="Scan next QR code">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button onClick={handleClearScan} variant="ghost" size="sm" title="Clear data">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium text-muted-foreground">Raw Value</p>
              <p className="break-words rounded-md bg-background/50 p-2 font-mono text-xs text-foreground">
                {scannedValue}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">All Parameters</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(parsedData.parameters).map(([key, value]) => (
                  <div key={key} className="rounded-md bg-background/50 p-2">
                    <p className="text-xs font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ').replace(/field_/, '')}
                    </p>
                    <p className="break-words text-sm font-mono text-foreground">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {(parsedData.batchNo || parsedData.containerNo) && (
              <div className="border-t border-success/20 pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Extracted Matching Fields
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {parsedData.batchNo && (
                     <div className="rounded-md bg-primary/10 p-2">
                       <p className="text-xs font-medium text-primary">Batch No</p>
                       <p className="font-mono text-sm font-semibold text-foreground">
                         {parsedData.batchNo}
                       </p>
                     </div>
                  )}
                  {parsedData.containerNo && (
                     <div className="rounded-md bg-accent/10 p-2">
                       <p className="text-xs font-medium text-accent">Container No</p>
                       <p className="font-mono text-sm font-semibold text-foreground">
                         {parsedData.containerNo}
                       </p>
                     </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-success/20 pt-3">
              <p className="text-xs text-muted-foreground">
                Scanned at: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
