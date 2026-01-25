'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertCircle, Camera, X, CheckCircle2, RefreshCw } from 'lucide-react'
import { parseQRValueFull } from '@/lib/qr-parser'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
  setIsScanning: (active: boolean) => void
}

export function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannedValue, setScannedValue] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ReturnType<typeof parseQRValueFull> | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scannedCodesRef = useRef<Set<string>>(new Set())
  const controlsRef = useRef<any>(null)

  // Initialize ZXing reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader()
    return () => {
      codeReaderRef.current = null
    }
  }, [])

  // Fetch available video devices - ONLY after finding initial stream or if already permitted
  const updateVideoInputDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setVideoInputDevices(videoDevices)
    } catch (err) {
      console.error('Error listing devices:', err)
    }
  }, [])

  // Start scanning when ready
  useEffect(() => {
    if (!isScanning || !videoRef.current || !codeReaderRef.current) {
      return
    }

    setIsInitializing(true)
    setCameraError(null)

    const startScanning = async () => {
      try {
        console.log('Starting ZXing scanner...')

        // Use constraints instead of specific device ID initially to let browser pick best default (usually back camera on mobile)
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        }

        // If we have a selected device ID (from manual switch), use it
        if (selectedDeviceId) {
          // @ts-ignore
          constraints.video.deviceId = { exact: selectedDeviceId }
        }

        const controls = await codeReaderRef.current?.decodeFromConstraints(
          constraints,
          videoRef.current!,
          (result, err) => {
            if (result) {
              const text = result.getText()
              // Draw result points on canvas
              const videoElement = videoRef.current
              const canvasElement = canvasRef.current

              if (videoElement && canvasElement) {
                const ctx = canvasElement.getContext('2d')
                if (ctx) {
                  canvasElement.width = videoElement.videoWidth
                  canvasElement.height = videoElement.videoHeight
                  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

                  const points = result.getResultPoints()
                  if (points && points.length > 0) {
                    ctx.beginPath()
                    ctx.lineWidth = 4
                    ctx.strokeStyle = '#00ff00' // Green color for focus

                    // Draw bounding box polygon
                    ctx.moveTo(points[0].getX(), points[0].getY())
                    for (let i = 1; i < points.length; i++) {
                      ctx.lineTo(points[i].getX(), points[i].getY())
                    }
                    ctx.closePath()
                    ctx.stroke()
                  }
                }
              }

              // Handle Scan Logic with Delay
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
            } else if (err && !(err instanceof NotFoundException)) {
              // Clear canvas on error or no result (optional, but good for cleanup)
              const canvasElement = canvasRef.current
              if (canvasElement) {
                const ctx = canvasElement.getContext('2d')
                ctx?.clearRect(0, 0, canvasElement.width, canvasElement.height)
              }
            }
          }
        )

        controlsRef.current = controls

        // Try to enable autofocus if supported
        try {
          const stream = videoRef.current?.srcObject as MediaStream
          if (stream) {
            const track = stream.getVideoTracks()[0]
            const capabilities = track.getCapabilities() as any

            // Check if focusMode is supported
            if (capabilities.focusMode) {
              const advancedConstraints = [{ focusMode: 'continuous' }, { focusDistance: 0 }]
              await track.applyConstraints({
                advanced: advancedConstraints as any
              })
              console.log('Autofocus enabled')
            }
          }
        } catch (focusErr) {
          console.log('Autofocus not supported or failed to enable:', focusErr)
        }

        // Once successfully started, update device list (now that we have permissions)
        await updateVideoInputDevices()
        setIsInitializing(false)
      } catch (err) {
        console.error('Failed to start scanner:', err)
        setCameraError('Failed to access camera. Please check permissions.')
        setIsInitializing(false)
      }
    }

    startScanning()

    return () => {
      console.log('Stopping scanner...')
      if (controlsRef.current) {
        controlsRef.current.stop()
        controlsRef.current = null
      }
    }
  }, [isScanning, selectedDeviceId, onScan, updateVideoInputDevices])

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
        ; (e.target as HTMLFormElement).reset()
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
    if (videoInputDevices.length <= 1) return

    // Find current device in list or default to 0
    let currentIndex = 0
    if (selectedDeviceId) {
      currentIndex = videoInputDevices.findIndex(d => d.deviceId === selectedDeviceId)
    }

    const nextIndex = (currentIndex + 1) % videoInputDevices.length
    const nextDevice = videoInputDevices[nextIndex]

    console.log('Switching to device:', nextDevice.label)
    setSelectedDeviceId(nextDevice.deviceId)
    scannedCodesRef.current.clear()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">QR Code Scanner (ZXing)</h3>
        {isScanning && !isInitializing && (
          <Badge variant="secondary" className="bg-success/20 text-success animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )}
        {isInitializing && isScanning && (
          <Badge variant="outline" className="animate-pulse">
            <Camera className="mr-1 h-3 w-3" />
            Starting...
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
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      {isScanning && !cameraError && (
        <div className="relative w-full overflow-hidden rounded-lg border-2 border-primary bg-black">
          <video
            ref={videoRef}
            className="h-[400px] w-full object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
          />
          {videoInputDevices.length > 1 && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleCameraSwitch}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

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
