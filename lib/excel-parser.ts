import type { ExcelRow } from './verification-context'

export async function parseExcelFile(file: File): Promise<ExcelRow[]> {
  // Dynamic import for xlsx library
  const XLSX = await import('xlsx')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Transform data into ExcelRow format with unique IDs
        const rows: ExcelRow[] = jsonData.map((row, index) => ({
          id: `row-${index}-${Date.now()}`,
          verified: false,
          ...row,
        }))

        resolve(rows)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }

    reader.readAsBinaryString(file)
  })
}

export function validateExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
  ]
  return validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
}
