'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface ExcelRow {
  id: string
  'Batch no': string
  'S.NO': string
  [key: string]: string | boolean
  verified: boolean
}

export interface QRData {
  'Batch No': string
  'Container No': string
  timestamp: number
  [key: string]: string | number
}

export interface VerificationContextType {
  uploadedData: ExcelRow[]
  setUploadedData: (data: ExcelRow[]) => void
  verifiedRowIds: Set<string>
  markRowAsVerified: (rowId: string, qrData: QRData) => void
  clearVerification: (rowId: string) => void
  lastScannedQR: QRData | null
  setLastScannedQR: (data: QRData | null) => void
  resetAllData: () => void
  getVerificationStats: () => { total: number; verified: number; unverified: number }
  getRowByBatchAndSNO: (batchNo: string, sno: string) => ExcelRow | undefined
  recentHistory: { batchNo: string, sno: string, timestamp: number, status: 'success' | 'warning' | 'error', scanData?: any }[]
  addToHistory: (entry: { batchNo: string, sno: string, timestamp: number, status: 'success' | 'warning' | 'error', scanData?: any }) => void
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined)

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [uploadedData, setUploadedData] = useState<ExcelRow[]>([])
  const [verifiedRowIds, setVerifiedRowIds] = useState<Set<string>>(new Set())
  const [lastScannedQR, setLastScannedQR] = useState<QRData | null>(null)
  const [recentHistory, setRecentHistory] = useState<{ batchNo: string, sno: string, timestamp: number, status: 'success' | 'warning' | 'error', scanData?: any }[]>([])

  const addToHistory = useCallback((entry: { batchNo: string, sno: string, timestamp: number, status: 'success' | 'warning' | 'error', scanData?: any }) => {
    setRecentHistory(prev => [entry, ...prev].slice(0, 10)); // Keep only the last 10 scans
  }, []);

  const markRowAsVerified = useCallback((rowId: string, qrData: QRData) => {
    setVerifiedRowIds((prev) => new Set(prev).add(rowId))
    setUploadedData((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, verified: true } : row))
    )
    setLastScannedQR({ ...qrData, timestamp: Date.now() })
  }, [])

  const clearVerification = useCallback((rowId: string) => {
    setVerifiedRowIds((prev) => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })
    setUploadedData((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, verified: false } : row))
    )
  }, [])

  const resetAllData = useCallback(() => {
    setUploadedData([])
    setVerifiedRowIds(new Set())
    setLastScannedQR(null)
    setRecentHistory([])
  }, [])

  const getVerificationStats = useCallback(() => {
    const total = uploadedData.length
    const verified = verifiedRowIds.size
    const unverified = total - verified
    return { total, verified, unverified }
  }, [uploadedData, verifiedRowIds])

  const getRowByBatchAndSNO = useCallback(
    (batchNo: string, sno: string) => {
      return uploadedData.find(
        (row) => row['Batch no']?.toString().trim() === batchNo.trim() &&
                 row['S.NO']?.toString().trim() === sno.trim()
      )
    },
    [uploadedData]
  )

  return (
    <VerificationContext.Provider
      value={{
        uploadedData,
        setUploadedData,
        verifiedRowIds,
        markRowAsVerified,
        clearVerification,
        lastScannedQR,
        setLastScannedQR,
        resetAllData,
        getVerificationStats,
        getRowByBatchAndSNO,
        recentHistory,
        addToHistory,
      }}
    >
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider')
  }
  return context
}
