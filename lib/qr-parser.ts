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

  // If no delimiter found, treat as plain text
  parameters['value'] = rawValue
  return {
    format: 'text',
    rawValue,
    parameters,
  }
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

  // Try splitting by common delimiters
  const delimiters = ['-', '|', ',', ':', ';']
  for (const delimiter of delimiters) {
    if (qrValue.includes(delimiter)) {
      const parts = qrValue.split(delimiter).map((p) => p.trim())
      if (parts.length >= 2) {
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
  const digits = containerNo.replace(/\D/g, '')
  return digits.substring(0, 2)
}

/**
 * Validate parsed QR data
 */
export function validateParsedQR(data: ParsedQRData): { valid: boolean; error?: string } {
  if (!data.batchNo || data.batchNo.length === 0) {
    return { valid: false, error: 'Batch No is required' }
  }
  if (!data.containerNo || data.containerNo.length === 0) {
    return { valid: false, error: 'Container No is required' }
  }
  return { valid: true }
}
