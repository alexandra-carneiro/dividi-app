import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface RawExpense {
  _id: string
  household_id: string
  date: string
  amount: number
  payer: string
  description: string
}

const ptMonths = {
  'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
  'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
}

export const parseAmount = (val: any) => {
  if (typeof val === 'number') return val
  let str = String(val)
  str = str.replace(/[^\d.,-]/g, '')
  
  const lastDot = str.lastIndexOf('.')
  const lastComma = str.lastIndexOf(',')
  
  if (lastComma > lastDot) {
    str = str.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    str = str.replace(/,/g, '')
  }
  
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export const processImportData = (rows: any[], householdId: string, setDetectedHeaders: (headers: string[]) => void): RawExpense[] => {
  const validRows = rows.filter(r => Object.values(r).some(val => val !== undefined && val !== null && String(val).trim() !== ''))

  if (validRows.length === 0) return []

  const newExpenses: RawExpense[] = []
  
  validRows.forEach((r, index) => {
    const keys = Object.keys(r).filter(k => k !== '_sheetName')
    if (index === 0) setDetectedHeaders(keys)

    const dateKey = keys.find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date') || k.toLowerCase().includes('dia'))
    const valKey = keys.find(k => k.toLowerCase().includes('valor') && !k.toLowerCase().includes('alê') && !k.toLowerCase().includes('maria'))
    const payerKey = keys.find(k => k.toLowerCase() === 'pagador' || k.toLowerCase() === 'quem' || k.toLowerCase() === 'payer' || k.toLowerCase() === 'pessoa')
    const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('nome') || k.toLowerCase().includes('item') || k.toLowerCase().includes('lugar') || k.toLowerCase().includes('local'))

    let rawDate = dateKey ? String(r[dateKey]).trim() : ''
    let rawDesc = descKey ? String(r[descKey]).trim() : 'Mercado'
    const sheetName = r._sheetName ? String(r._sheetName).toLowerCase().trim() : ''

    const lowerDate = rawDate.toLowerCase()
    if (lowerDate.includes('total') || lowerDate.includes('resta') || lowerDate.includes('gasto') || lowerDate.includes('falta') || lowerDate.includes('resumo')) return

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
    } else if (rawDate.includes('/')) {
      const parts = rawDate.split('/')
      if(parts.length === 3) {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
        rawDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    } else if (!isNaN(Number(rawDate)) && Number(rawDate) > 40000) {
      const excelDate = new Date(Math.round((Number(rawDate) - 25569) * 86400 * 1000))
      rawDate = excelDate.toISOString().split('T')[0]
    }

    if (valKey && payerKey) {
      const numAmount = parseAmount(String(r[valKey]))
      let rawPayer = payerKey ? String(r[payerKey]) : ''
      if (numAmount > 0) {
        newExpenses.push({
          _id: 'temp_' + index,
          household_id: householdId,
          date: rawDate,
          amount: numAmount,
          payer: rawPayer,
          description: rawDesc
        })
      }
    } else {
      let foundPayer = false
      keys.forEach(k => {
        const lowerK = k.toLowerCase()
        if (k !== dateKey && k !== descKey && !lowerK.includes('total') && !lowerK.includes('resta') && !lowerK.includes('falta') && !k.startsWith('__EMPTY')) {
          const numAmount = parseAmount(String(r[k]))
          if (numAmount > 0) {
            foundPayer = true
            let extractedPayer = k
            if (lowerK.includes('alê') || lowerK.includes('ale')) extractedPayer = 'Alê'
            else if (lowerK.includes('maria')) extractedPayer = 'Maria'

            newExpenses.push({
              _id: 'temp_' + index + '_' + k,
              household_id: householdId,
              date: rawDate,
              amount: numAmount,
              payer: extractedPayer,
              description: rawDesc
            })
          }
        }
      })
      if (!foundPayer && rawDate && !isNaN(Date.parse(rawDate))) {
        newExpenses.push({
          _id: 'temp_' + index,
          household_id: householdId,
          date: rawDate,
          amount: 0,
          payer: '',
          description: rawDesc
        })
      }
    }
  })
  
  return newExpenses
}

export const handleFileImport = (file: File, householdId: string, setDetectedHeaders: (headers: string[]) => void, setPendingImports: (data: RawExpense[]) => void) => {
  if (file.name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processed = processImportData(results.data as any[], householdId, setDetectedHeaders)
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
      const processed = processImportData(allData, householdId, setDetectedHeaders)
      setPendingImports(processed)
    }
    reader.readAsBinaryString(file)
  }
}
