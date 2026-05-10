import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface RawExpense {
  _id: string
  household_id: string
  date: string
  amount: number
  payer: string
  description: string
  category?: string
}

export interface Member {
  user_id: string
  email: string
  display_name?: string | null
}

const ptMonths = {
  'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
  'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
}

export const parseAmount = (val: any): number => {
  if (typeof val === 'number') return val
  if (!val) return 0
  let str = String(val).trim()
  
  // Remove currency symbols and spaces
  str = str.replace(/[^\d.,-]/g, '')
  
  const lastDot = str.lastIndexOf('.')
  const lastComma = str.lastIndexOf(',')
  
  if (lastComma > lastDot) {
    // European/Brazilian format: 1.000,00
    str = str.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    // US format: 1,000.00
    str = str.replace(/,/g, '')
  }
  
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const fuzzyMatchPayer = (input: string, members: Member[]): string => {
  const cleanInput = input.toLowerCase().trim()
  if (!cleanInput) return ''

  for (const m of members) {
    const name = (m.display_name || '').toLowerCase()
    const email = m.email.toLowerCase()
    
    if (name.includes(cleanInput) || cleanInput.includes(name) || email.includes(cleanInput)) {
      return m.display_name || m.email.split('@')[0]
    }
  }
  return ''
}

export const processImportData = (rows: any[], householdId: string, members: Member[], setDetectedHeaders: (headers: string[]) => void): RawExpense[] => {
  const validRows = rows.filter(r => Object.values(r).some(val => val !== undefined && val !== null && String(val).trim() !== ''))

  if (validRows.length === 0) return []

  const newExpenses: RawExpense[] = []
  
  validRows.forEach((r, index) => {
    const keys = Object.keys(r).filter(k => k !== '_sheetName')
    if (index === 0) setDetectedHeaders(keys)

    const dateKey = keys.find(k => {
      const l = k.toLowerCase()
      return l.includes('data') || l.includes('date') || l.includes('dia') || l === 'd'
    })
    
    const valKey = keys.find(k => {
      const l = k.toLowerCase()
      return (l.includes('valor') || l.includes('preço') || l.includes('amount') || l.includes('total') || l === 'v') && 
             !members.some(m => l.includes((m.display_name || '').toLowerCase()))
    })
    
    const payerKey = keys.find(k => {
      const l = k.toLowerCase()
      return l === 'pagador' || l === 'quem' || l === 'payer' || l === 'pessoa' || l === 'membro' || l === 'p'
    })
    
    const descKey = keys.find(k => {
      const l = k.toLowerCase()
      return l.includes('desc') || l.includes('nome') || l.includes('item') || l.includes('lugar') || l.includes('local') || l.includes('histórico')
    })

    let rawDate = dateKey ? String(r[dateKey]).trim() : ''
    let rawDesc = descKey ? String(r[descKey]).trim() : 'Gasto Importado'
    const sheetName = r._sheetName ? String(r._sheetName).toLowerCase().trim() : ''

    // Skip summary rows
    const lowerDate = rawDate.toLowerCase()
    if (lowerDate.includes('total') || lowerDate.includes('resta') || lowerDate.includes('gasto') || lowerDate.includes('falta') || lowerDate.includes('resumo')) return

    // Date Parsing Logic
    if (/^\d{1,2}$/.test(rawDate)) {
      const monthNum = ptMonths[sheetName as keyof typeof ptMonths]
      if (monthNum) {
        const day = rawDate.padStart(2, '0')
        const currentYear = new Date().getFullYear()
        let year = currentYear
        const currentMonth = new Date().getMonth() + 1
        if (parseInt(monthNum) > currentMonth + 3) year = currentYear - 1
        rawDate = `${year}-${monthNum}-${day}`
      }
    } else if (rawDate.includes('/') || rawDate.includes('-')) {
      const separator = rawDate.includes('/') ? '/' : '-'
      const parts = rawDate.split(separator)
      if(parts.length === 3) {
        // Assume DD/MM/YYYY or YYYY/MM/DD
        if (parts[0].length === 4) {
          rawDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
        } else {
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
          rawDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }
    } else if (!isNaN(Number(rawDate)) && Number(rawDate) > 40000) {
      // Excel Serial Date
      const excelDate = new Date(Math.round((Number(rawDate) - 25569) * 86400 * 1000))
      rawDate = excelDate.toISOString().split('T')[0]
    }

    // Try to find payer and amount
    if (valKey && payerKey) {
      const numAmount = parseAmount(String(r[valKey]))
      const matchedPayer = fuzzyMatchPayer(String(r[payerKey]), members)
      
      if (numAmount > 0) {
        newExpenses.push({
          _id: `temp_${index}`,
          household_id: householdId,
          date: rawDate,
          amount: numAmount,
          payer: matchedPayer || String(r[payerKey]),
          description: rawDesc
        })
      }
    } else {
      // Look for columns named after members
      let foundPayer = false
      keys.forEach(k => {
        const matchedPayer = fuzzyMatchPayer(k, members)
        if (matchedPayer && k !== dateKey && k !== descKey) {
          const numAmount = parseAmount(String(r[k]))
          if (numAmount > 0) {
            foundPayer = true
            newExpenses.push({
              _id: `temp_${index}_${k}`,
              household_id: householdId,
              date: rawDate,
              amount: numAmount,
              payer: matchedPayer,
              description: rawDesc
            })
          }
        }
      })

      // Fallback: Check all columns for amounts if no payer found
      if (!foundPayer) {
        keys.forEach(k => {
          const lowerK = k.toLowerCase()
          if (k !== dateKey && k !== descKey && !lowerK.includes('total') && !lowerK.includes('resta') && !k.startsWith('__EMPTY')) {
            const numAmount = parseAmount(String(r[k]))
            if (numAmount > 0) {
              newExpenses.push({
                _id: `temp_${index}_${k}`,
                household_id: householdId,
                date: rawDate,
                amount: numAmount,
                payer: '',
                description: rawDesc
              })
            }
          }
        })
      }
    }
  })
  
  return newExpenses
}

export const handleFileImport = (
  file: File, 
  householdId: string, 
  members: Member[],
  setDetectedHeaders: (headers: string[]) => void, 
  setPendingImports: (data: RawExpense[]) => void
) => {
  if (file.name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processed = processImportData(results.data as any[], householdId, members, setDetectedHeaders)
        setPendingImports(processed)
      }
    })
  } else {
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      let allData: any[] = []
      for (const wsname of wb.SheetNames) {
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { raw: false })
        const dataWithSheet = data.map((r: any) => ({ ...r, _sheetName: wsname }))
        allData = allData.concat(dataWithSheet)
      }
      const processed = processImportData(allData, householdId, members, setDetectedHeaders)
      setPendingImports(processed)
    }
    reader.readAsBinaryString(file)
  }
}
