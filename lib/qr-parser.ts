/**
 * QR Code Parser
 * Handles various QR code formats for batch verification
 */

export interface ParsedQRData {
  batchNo: string
  containerNo: string
  rawValue: string
  [key: string]: string | Record<string, unknown>
}

export interface AllQRData {
  format: 'json' | 'delimited' | 'text'
  rawValue: string
  parameters: Record<string, unknown>
  batchNo?: string
  containerNo?: string
}

/**
 * Parse QR code value and extract ALL available parameters
 * Supports formats like:
 * - JSON: {"batch_no": "123", "container_no": "001", "other_field": "value"}
 * - Delimited: "BATCH123-CONTAINER001-EXTRA"
 * - Plain text (single value)
 */
export function parseQRValueFull(qrValue: string): AllQRData {
  const rawValue = qrValue.trim()
  const parameters: Record<string, unknown> = {}

  // Try parsing as JSON first
  try {
    const jsonData = JSON.parse(rawValue)
    if (typeof jsonData === 'object' && jsonData !== null) {
      return {
        format: 'json',
        rawValue,
        parameters: jsonData,
        batchNo: jsonData.batch_no || jsonData['Batch No'] || jsonData.batchNo,
        containerNo: jsonData.container_no || jsonData['Container No'] || jsonData.containerNo,
      }
    }
  } catch {
    // Not JSON, continue with other formats
  }

  // Try splitting by common delimiters
  const delimiters = ['-', '|', ',', ':', ';']
  let foundDelimiter = false

  for (const delimiter of delimiters) {
    if (rawValue.includes(delimiter)) {
      const parts = rawValue.split(delimiter).map((p) => p.trim())
      if (parts.length >= 2) {
        parts.forEach((part, index) => {
          parameters[`field_${index + 1}`] = part
        })
        foundDelimiter = true
        return {
          format: 'delimited',
          rawValue,
          parameters,
          batchNo: parts[0],
          containerNo: parts[1],
        }
      }
    }
  }

  // Try parsing multiline text (key: value format) (Custom format support)
  if (rawValue.includes('\n') || rawValue.includes(':')) {
    const lines = rawValue.split(/\r?\n/)
    const multilineParams: Record<string, string> = {}
    let foundKeyValue = false

    lines.forEach(line => {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/[.]/g, '') // Remove dots from keys like "Batch No."
        const value = parts.slice(1).join(':').trim() // Re-join rest in case value has colon
        if (key && value) {
          multilineParams[key] = value
          parameters[key] = value // Add to main parameters
          foundKeyValue = true
        }
      }
    })

    if (foundKeyValue) {
      // keys usually appear as "Batch No", "Container No", "Serial Shipping Container Code"
      const batchNo = findValue(['Batch No', 'Batch Number', 'Batch', 'Lot No', 'Lot'], multilineParams)
      const containerNo = findValue(['Container No', 'Container', 'Serial Shipping Container Code', 'SSCC'], multilineParams)

      return {
        format: 'text',
        rawValue,
        parameters,
        batchNo,
        containerNo
      }
    }
  }

  // If no delimiter found, treat as plain text
  parameters['value'] = rawValue
  return {
    format: 'text',
    rawValue,
    parameters,
  }
}

// Helper to find value by multiple possible keys (case-insensitive)
function findValue(keys: string[], params: Record<string, string>): string | undefined {
  const normalizedParams = Object.keys(params).reduce((acc, key) => {
    acc[key.toLowerCase()] = params[key]
    return acc
  }, {} as Record<string, string>)

  for (const key of keys) {
    const val = normalizedParams[key.toLowerCase()]
    if (val) return val
  }
  return undefined
}

/**
 * Parse QR code value based on common formats (legacy function)
 * Supports formats like:
 * - "BATCH123-CONTAINER001"
 * - "BATCH123|CONTAINER001"
 * - "BATCH123,CONTAINER001"
 * - JSON format with batch_no and container_no
 */
export function parseQRValue(qrValue: string): ParsedQRData | null {
  try {
    // Try parsing as JSON first
    const jsonData = JSON.parse(qrValue)
    if (jsonData.batch_no && jsonData.container_no) {
      return {
        batchNo: String(jsonData.batch_no).trim(),
        containerNo: String(jsonData.container_no).trim(),
        rawValue: qrValue,
      }
    }
    if (jsonData['Batch No'] && jsonData['Container No']) {
      return {
        batchNo: String(jsonData['Batch No']).trim(),
        containerNo: String(jsonData['Container No']).trim(),
        rawValue: qrValue,
      }
    }
  } catch {
    // Not JSON, continue with other formats
  }

  // Try parsing multiline text (key: value format)
  if (qrValue.includes('\n') || qrValue.includes('\r') || qrValue.includes(':')) {
    const lines = qrValue.split(/\r\n|\r|\n/)
    const multilineParams: Record<string, string> = {}
    let foundKeyValue = false

    lines.forEach(line => {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/[.]/g, '')
        const value = parts.slice(1).join(':').trim()
        if (key && value) {
          multilineParams[key] = value
          foundKeyValue = true
        }
      }
    })

    if (foundKeyValue) {
      const normalize = (k: string) => k.toLowerCase()
      const normalizedParams = Object.keys(multilineParams).reduce((acc, k) => {
        acc[normalize(k)] = multilineParams[k]
        return acc
      }, {} as Record<string, string>)

      const getVal = (keys: string[]) => {
        for (const k of keys) {
          const v = normalizedParams[normalize(k)]
          if (v) return v
        }
        return undefined
      }

      const batchNo = getVal(['Batch No', 'Batch Number', 'Batch', 'Lot No', 'Lot'])
      const containerNo = getVal(['Container No', 'Container', 'Serial Shipping Container Code', 'SSCC'])

      // Special handling for pharmaceutical data
      const serialCode = getVal(['Serial Shipping Container Code'])
      const finalContainerNo = containerNo || serialCode

      if (batchNo && finalContainerNo) {
        return {
          batchNo,
          containerNo: finalContainerNo,
          rawValue: qrValue,
          ...multilineParams
        }
      }

      // Even if we didn't find strict Batch/container, if we found multiple key-values, 
      // it's likely a valid object structure. Return what we found.
      if (Object.keys(multilineParams).length > 2) {
        return {
          batchNo: batchNo || multilineParams[Object.keys(multilineParams)[0]] || 'Unknown',
          containerNo: finalContainerNo || 'Unknown',
          rawValue: qrValue,
          ...multilineParams
        }
      }
    }
  }

  // Try splitting by common delimiters
  const delimiters = ['-', '|', ',', ':', ';']
  for (const delimiter of delimiters) {
    if (qrValue.includes(delimiter)) {
      const parts = qrValue.split(delimiter).map((p) => p.trim())
      if (parts.length >= 2 && parts.length <= 4) { // Limit parts to avoid matching long text
        return {
          batchNo: parts[0],
          containerNo: parts[1],
          rawValue: qrValue,
        }
      }
    }
  }

  // If no delimiter found, return null
  return null
}

/**
 * Extract S.NO from Container No (typically first 2 digits)
 */
export function extractSNOFromContainer(containerNo: string): string {
  // Handle "03 of 26" format
  if (containerNo.toLowerCase().includes(' of ')) {
    const parts = containerNo.toLowerCase().split(' of ')
    return parts[0].replace(/\D/g, '')
  }

  // For pharmaceutical SSCC (Serial Shipping Container Code)
  const digits = containerNo.replace(/\D/g, '')

  // If it's a long SSCC (e.g. 18-digits), extract S.NO from last 2 digits like VeriScan Pro
  if (digits.length >= 10) {
    const lastTwo = digits.slice(-2)
    return parseInt(lastTwo, 10).toString()
  }

  // For shorter codes, return as is
  return digits
}

/**
 * Validate parsed QR data
 */
export function validateParsedQR(data: ParsedQRData): { valid: boolean; error?: string } {
  if (!data.batchNo || data.batchNo.length === 0 || data.batchNo === 'Unknown') {
    return { valid: false, error: 'Batch No is required' }
  }
  if (!data.containerNo || data.containerNo.length === 0 || data.containerNo === 'Unknown') {
    return { valid: false, error: 'Container No is required' }
  }
  return { valid: true }
}
