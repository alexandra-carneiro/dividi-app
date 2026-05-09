import * as XLSX from 'xlsx'

export const exportExpensesToExcel = (expenses: any[], currentDate: Date) => {
  if (expenses.length === 0) {
    alert('Não há gastos neste mês para exportar.')
    return
  }

  const dataToExport = expenses.map(exp => ({
    Data: exp.date.split('-').reverse().join('/'),
    Descrição: exp.description,
    Categoria: exp.category || 'Outros',
    Pagador: exp.payer,
    Valor: Number(exp.amount)
  }))

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Gastos")
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', '_')
  XLSX.writeFile(wb, `Dividi_${monthName}.xlsx`)
}
