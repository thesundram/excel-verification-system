'use client'

import React from "react"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertCircle, Camera, X, CheckCircle2 } from 'lucide-react'
import { parseQRValueFull } from '@/lib/qr-parser'

declare global {
  interface Window {
    Html5Qrcode?: any
  }
}

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
  setIsScanning: (active: boolean) => void
}

export function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannedValue, setScannedValue] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ReturnType<typeof parseQRValueFull> | null>(null)
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const scannedCodesRef = useRef<Set<string>>(new Set())

  // Load html5-qrcode library
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.Html5Qrcode) {
      console.log('html5-qrcode library already loaded')
      setLibraryLoaded(true)
      return
    }

    console.log('Loading html5-qrcode library from CDN...')
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js'
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      console.log('html5-qrcode library loaded successfully')
      setLibraryLoaded(true)
    }

    script.onerror = () => {
      console.error('Failed to load html5-qrcode library')
      setCameraError('Failed to load QR scanner library. Please refresh the page.')
      setLibraryLoaded(false)
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Initialize and manage scanner
  useEffect(() => {
    if (!isScanning || !libraryLoaded || !containerRef.current) {
      return
    }

    const initializeScanner = async () => {
      try {
        setIsInitializing(true)
        console.log('Initializing html5-qrcode scanner...')

        if (!window.Html5Qrcode) {
          throw new Error('Html5Qrcode library not available on window object')
        }

        // Stop previous scanner if it exists
        if (scannerRef.current) {
          try {
            const isRunning = scannerRef.current.getState() === 2 // State 2 means SCANNING
            if (isRunning) {
              await scannerRef.current.stop()
              console.log('Previous scanner stopped')
            }
          } catch (err) {
            console.log('Could not stop previous scanner:', err)
          }
          scannerRef.current = null
        }

        const scannerId = 'qr-scanner-container'
        
        // Create new scanner instance with optimized configuration
        const html5QrCode = new window.Html5Qrcode(scannerId, {
          formfactor: 'portrait',
          showTorchButtonIfSupported: true,
          defaultZoom: 1.2,
          aspectRatio: 1.0,
        })

        scannerRef.current = html5QrCode

        // Success callback - when QR code is detected
        const onScanSuccess = (decodedText: string, decodedResult: any) => {
          const trimmedText = decodedText.trim()
          console.log('QR Code detected successfully:', trimmedText)

          // Prevent duplicate rapid scans
          if (trimmedText && !scannedCodesRef.current.has(trimmedText)) {
            scannedCodesRef.current.add(trimmedText)
            console.log('Processing new QR code:', trimmedText)
            
            setScannedValue(trimmedText)
            const parsed = parseQRValueFull(trimmedText)
            setParsedData(parsed)
            onScan(trimmedText)
          }
        }

        // Error callback - silent, just means no QR code in current frame
        const onScanFailure = (error: any) => {
          // Silently ignore - this happens for every frame without a QR code
        }

        // Start the scanner with optimized configuration
        console.log('[tarting scanner...')
        await html5QrCode.start(
          { facingMode: 'environment' }, // Rear camera
          {
            fps: 10, // Reduced FPS for better detection
            qrbox: { width: 300, height: 300 }, // Larger detection box
            aspectRatio: 1.333,
            disableFlip: false,
            videoConstraints: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1440 },
            },
          },
          onScanSuccess,
          onScanFailure
        )

        console.log('QR scanner started successfully')
        setCameraError(null)
        setIsInitializing(false)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error during initialization'
        console.error('Scanner initialization failed:', errorMsg)
        setCameraError(errorMsg)
        setIsInitializing(false)
        setIsScanning(false)
      }
    }

    initializeScanner()

    // Cleanup on unmount or when scanning stops
    return () => {
      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            console.log('Cleaning up scanner...')
            await scannerRef.current.stop()
            console.log('Scanner stopped during cleanup')
          } catch (err) {
            console.log('Error during scanner cleanup:', err)
          }
        }
      }
      cleanup()
    }
  }, [isScanning, libraryLoaded, onScan, setIsScanning])

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
    console.log('Clearing scanned data')
    setScannedValue(null)
    setParsedData(null)
  }

  const handleResetScanner = () => {
    console.log('Resetting scanner for next scan')
    scannedCodesRef.current.clear()
    handleClearScan()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">QR Code Scanner</h3>
        {isScanning && !isInitializing && libraryLoaded && (
          <Badge variant="secondary" className="bg-success/20 text-success animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )}
        {isInitializing && (
          <Badge variant="outline" className="animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Starting...
          </Badge>
        )}
        {!libraryLoaded && !isScanning && (
          <Badge variant="outline" className="animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Loading...
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
          disabled={!libraryLoaded || isInitializing}
        >
          <Camera className="mr-2 h-4 w-4" />
          {libraryLoaded ? 'Start Scanner' : 'Loading Scanner...'}
        </Button>
      ) : (
        <Button
          onClick={() => setIsScanning(false)}
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
          <AlertDescription>
            Error: {cameraError}. Please check camera permissions and try again.
          </AlertDescription>
        </Alert>
      )}

      {!libraryLoaded && (
        <Alert>
          <Camera className="h-4 w-4" />
          <AlertDescription>Loading QR scanner library. Please wait...</AlertDescription>
        </Alert>
      )}

      {isScanning && !cameraError && (
        <div
          ref={containerRef}
          id="qr-scanner-container"
          className="w-full rounded-lg border-2 border-primary overflow-hidden bg-black"
          style={{ height: '400px' }}
        />
      )}

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <label className="block text-sm font-medium text-foreground">Manual QR Entry</label>
        <p className="text-xs text-muted-foreground mb-3">Paste or type QR code data directly. This is the most reliable method.</p>
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
