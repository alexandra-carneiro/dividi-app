'use client'

import { useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Trash2, Upload, ChevronLeft, ChevronRight, LogOut, Users, Settings, Edit2 } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export default function DashboardClient({ 
  initialExpenses, 
  householdId, 
  userEmail,
  initialMonthlyBudget,
  initialWeeklyBudget,
  initialCurrency
}: { 
  initialExpenses: any[], 
  householdId: string, 
  userEmail: string,
  initialMonthlyBudget: number,
  initialWeeklyBudget: number,
  initialCurrency: string
}) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [monthlyBudget, setMonthlyBudget] = useState(initialMonthlyBudget)
  const [weeklyBudget, setWeeklyBudget] = useState(initialWeeklyBudget)
  const [currency, setCurrency] = useState(initialCurrency)
  
  // Estados para o formulário de configurações
  const [localMonthly, setLocalMonthly] = useState(initialMonthlyBudget)
  const [localWeekly, setLocalWeekly] = useState(initialWeeklyBudget)
  const [localCurrency, setLocalCurrency] = useState(initialCurrency)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [pendingImports, setPendingImports] = useState<any[]>([])
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const monthExpenses = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return expenses.filter(exp => {
      const expDate = new Date(exp.date + 'T12:00:00')
      return expDate.getFullYear() === year && expDate.getMonth() === month
    })
  }, [expenses, currentDate])

  const totals = useMemo(() => {
    const total = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const ale = monthExpenses.filter(exp => exp.payer === 'Alê').reduce((sum, exp) => sum + Number(exp.amount), 0)
    const maria = monthExpenses.filter(exp => exp.payer === 'Maria').reduce((sum, exp) => sum + Number(exp.amount), 0)
    return { total, ale, maria, remaining: monthlyBudget - total }
  }, [monthExpenses, monthlyBudget])

  const weeks = useMemo(() => {
    const w: Record<number, any> = {}
    monthExpenses.forEach(exp => {
      const expDate = new Date(exp.date + 'T12:00:00')
      const weekNum = getWeekOfMonth(expDate)
      if (!w[weekNum]) w[weekNum] = { number: weekNum, total: 0, expenses: [] }
      w[weekNum].total += Number(exp.amount)
      w[weekNum].expenses.push(exp)
    })
    return Object.values(w).sort((a, b) => a.number - b.number).map(week => ({
      ...week,
      expenses: week.expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
  }, [monthExpenses])

  const formatMoney = (v: number) => {
    return v.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency 
    })
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const expData = {
      household_id: householdId,
      date: formData.get('date') as string,
      amount: parseFloat(formData.get('amount') as string),
      payer: formData.get('payer') as string,
      description: (formData.get('description') as string) || 'Sem descrição'
    }

    if (expenseToEdit) {
      const { data, error } = await supabase.from('expenses').update(expData).eq('id', expenseToEdit.id).select().single()
      if (!error && data) {
        setExpenses(prev => prev.map(e => e.id === expenseToEdit.id ? data : e))
        setIsFormOpen(false)
        setExpenseToEdit(null)
      } else {
        alert('Erro ao atualizar gasto.')
      }
    } else {
      const { data, error } = await supabase.from('expenses').insert(expData).select().single()
      if (!error && data) {
        setExpenses(prev => [...prev, data])
        setIsFormOpen(false)
        form.reset()
      } else {
        alert('Erro ao salvar gasto.')
      }
    }
  }

  const openEditExpense = (exp: any) => {
    setExpenseToEdit(exp)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este gasto?')) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (!error) {
        setExpenses(prev => prev.filter(e => e.id !== id))
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const processData = (rows: any[]) => {
      // Filtra as linhas do Excel que não têm absolutamente nenhum valor real
      const validRows = rows.filter(r => {
        return Object.values(r).some(val => val !== undefined && val !== null && String(val).trim() !== '')
      })

      if (validRows.length === 0) {
        alert('A planilha parece estar completamente vazia.')
        return
      }

      const ptMonths = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
        'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      }

      const newExpenses: any[] = []
      
      validRows.forEach((r, index) => {
        const keys = Object.keys(r).filter(k => k !== '_sheetName')
        if (index === 0) setDetectedHeaders(keys)

        const dateKey = keys.find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date') || k.toLowerCase().includes('dia'))
        const valKey = keys.find(k => k.toLowerCase().includes('valor') && !k.toLowerCase().includes('alê') && !k.toLowerCase().includes('maria'))
        const payerKey = keys.find(k => k.toLowerCase() === 'pagador' || k.toLowerCase() === 'quem' || k.toLowerCase() === 'payer' || k.toLowerCase() === 'pessoa')
        const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('nome') || k.toLowerCase().includes('item') || k.toLowerCase().includes('lugar') || k.toLowerCase().includes('local'))

        let rawDate = dateKey ? String(r[dateKey]).trim() : ''
        let rawDesc = descKey ? String(r[descKey]).trim() : 'Gasto Diário' // Padrão mais amigável que "Importado"
        const sheetName = r._sheetName ? String(r._sheetName).toLowerCase().trim() : ''

        // Ignorar completamente linhas que são apenas subtotais da planilha
        const lowerDate = rawDate.toLowerCase()
        if (lowerDate.includes('total') || lowerDate.includes('resta') || lowerDate.includes('gasto') || lowerDate.includes('falta') || lowerDate.includes('resumo')) {
           return // Pula esta linha
        }

        // Inferir a data completa se for apenas o "Dia" (1 a 31)
        if (/^\d{1,2}$/.test(rawDate)) {
           const monthNum = ptMonths[sheetName as keyof typeof ptMonths]
           if (monthNum) {
               const day = rawDate.padStart(2, '0')
               const currentYear = new Date().getFullYear()
               // Se a aba for de um mês final do ano passado (ex: novembro) mas estamos no início do ano (ex: março)
               // Ajusta o ano para trás por precaução (assumindo que a planilha acompanha o ano vigente/anterior)
               let year = currentYear
               const currentMonth = new Date().getMonth() + 1
               if (parseInt(monthNum) > currentMonth + 3) {
                   year = currentYear - 1
               }
               rawDate = `${year}-${monthNum}-${day}`
           }
        } else if (rawDate.includes('/')) {
           const parts = rawDate.split('/')
           if(parts.length === 3) {
               const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
               rawDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
           }
        } else if (!isNaN(Number(rawDate)) && Number(rawDate) > 40000) {
           const excelDate = new Date(Math.round((Number(rawDate) - 25569) * 86400 * 1000));
           rawDate = excelDate.toISOString().split('T')[0];
        }

        // Função auxiliar para converter qualquer moeda (R$, €) para número
        const parseAmount = (val: any) => {
            if (typeof val === 'number') return val;
            let str = String(val);
            str = str.replace(/[^\d.,-]/g, '');
            
            const lastDot = str.lastIndexOf('.');
            const lastComma = str.lastIndexOf(',');
            
            if (lastComma > lastDot) {
               // Vírgula é o decimal (ex: 34,98 ou 1.000,50)
               str = str.replace(/\./g, '').replace(',', '.');
            } else if (lastDot > lastComma) {
               // Ponto é o decimal (ex: 34.98 ou 1,000.50)
               str = str.replace(/,/g, '');
            }
            
            const num = parseFloat(str)
            return isNaN(num) ? 0 : num
        }

        // Se a planilha tem UMA coluna de "Valor" e UMA de "Pagador"
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
          // Formato alternativo: Cada pessoa tem sua própria coluna (ex: Valor - Alê, Valor - Maria)
          let foundPayer = false
          
          keys.forEach(k => {
             const lowerK = k.toLowerCase()
             // Ignora as colunas de Data, Descrição, Totais, e também colunas sem cabeçalho (__EMPTY) que costumam ter anotações laterais
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

          // Só adiciona erro se for uma linha de Dia válida, mas que não tinha gasto pra ninguém
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
      
      const missingColumns = newExpenses.every(e => e.date === '' && e.amount === 0)
      if (missingColumns) {
        alert('Não conseguimos reconhecer os títulos das colunas na sua planilha.\nPor favor, certifique-se de que a primeira linha contém os nomes: Data, Valor, Pagador e Descrição.')
        return
      }

      setPendingImports(newExpenses)
    }

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data as any[])
      })
    } else {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        
        let allData: any[] = []
        // Percorrer todas as abas (SheetNames)
        for (const wsname of wb.SheetNames) {
          const ws = wb.Sheets[wsname]
          const data = XLSX.utils.sheet_to_json(ws, { raw: false })
          // Injetar o nome da aba em cada linha para inferir o mês depois
          const dataWithSheet = data.map((r: any) => ({ ...r, _sheetName: wsname }))
          allData = allData.concat(dataWithSheet)
        }
        
        processData(allData)
      }
      reader.readAsBinaryString(file)
    }
  }

  const confirmImport = async () => {
    // Filtra apenas os válidos antes de enviar
    const validExpenses = pendingImports.filter(e => e.date && !isNaN(e.amount) && e.amount > 0 && e.payer).map(({_id, ...rest}) => rest)

    if (validExpenses.length === 0) {
      alert('Nenhum dado válido encontrado para importar.')
      setPendingImports([])
      return
    }

    const { data, error } = await supabase.from('expenses').insert(validExpenses).select()
    if (!error && data) {
      setExpenses(prev => [...prev, ...data])
      alert(`${data.length} gastos importados com sucesso!`)
      setPendingImports([])
      setIsImportOpen(false)
    } else {
      alert(`Erro ao salvar no banco: ${error?.message}`)
    }
  }

  const cancelImport = () => {
    setPendingImports([])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    // Na vida real, o usuário precisaria aceitar o convite. 
    // Por simplicidade, vamos apenas adicionar o email na tabela household_members.
    // Quando o usuário com esse email se cadastrar (ou se já existir), 
    // a RLS do banco permitirá que ele veja essa household.
    // Mas antes precisamos do user_id. Como Supabase Auth não permite buscar users livremente pelo client,
    // Em um app real, faríamos um Edge Function ou o parceiro usaria um "Código de Convite".
    // Para resolver isso agora, vamos fazer um upsert na tabela usando Edge functions ou o Server Actions.
    // Vamos adaptar: instruiremos o parceiro a criar a conta primeiro.
    const { error } = await supabase.from('household_members').insert({
        household_id: householdId,
        email: email
        // nota: sem user_id por enquanto se ele não existe. O ideal é o parceiro dar a ele o código.
    })
    
    if(!error) {
       alert('Convite enviado! Peça para a pessoa se cadastrar com o email: ' + email)
       setIsInviteOpen(false)
    } else {
       alert('A pessoa precisa criar a conta primeiro, ou você não tem permissão.')
    }
  }

  const handleUpdateLimits = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase.from('households').update({
      monthly_budget: localMonthly,
      weekly_budget: localWeekly,
      currency: localCurrency
    }).eq('id', householdId)

    if (!error) {
      setMonthlyBudget(localMonthly)
      setWeeklyBudget(localWeekly)
      setCurrency(localCurrency)
      setIsSettingsOpen(false)
      alert('Configurações atualizadas com sucesso!')
    } else {
      alert('Erro ao atualizar configurações.')
    }
  }

  const openSettings = () => {
    setLocalMonthly(monthlyBudget)
    setLocalWeekly(weeklyBudget)
    setLocalCurrency(currency)
    setIsSettingsOpen(true)
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-12 font-sans text-slate-800">
      <header className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 md:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm p-1.5 ring-1 ring-white/20">
                <img src="/icon.svg" alt="Dividi Symbol" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Dividi</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={openSettings} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition" title="Configurações">
                <Settings size={20} />
              </button>
              <button onClick={() => setIsInviteOpen(true)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition" title="Compartilhar">
                <Users size={20} />
              </button>
              <button onClick={handleSignOut} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-white/10 rounded-xl p-2 backdrop-blur-sm max-w-sm mx-auto md:mx-0">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/20 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg">
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/20 rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-4 mb-4 sm:items-center gap-4">
              <div>
                <p className="text-sm text-slate-500">Total Gasto</p>
                <p className="text-3xl md:text-4xl font-bold text-slate-900">{formatMoney(totals.total)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500">{totals.remaining < 0 ? 'Passou do Orçamento' : 'Resta no Mês'}</p>
                <p className={`text-3xl md:text-4xl font-bold ${totals.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {formatMoney(Math.abs(totals.remaining))}
                </p>
              </div>
            </div>
            <div className="flex justify-around sm:justify-start sm:gap-16">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">A</div>
                <div>
                  <p className="text-sm text-slate-500">Alê</p>
                  <p className="font-semibold text-lg">{formatMoney(totals.ale)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg">M</div>
                <div>
                  <p className="text-sm text-slate-500">Maria</p>
                  <p className="font-semibold text-lg">{formatMoney(totals.maria)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 justify-center">
            <button onClick={() => { setExpenseToEdit(null); setIsFormOpen(!isFormOpen) }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1">
              + Adicionar Gasto
            </button>
            <button onClick={() => setIsImportOpen(!isImportOpen)} className="w-full flex items-center justify-center gap-2 p-4 bg-white text-slate-700 rounded-2xl shadow-md hover:bg-slate-50 transition font-medium border border-slate-200" aria-label="Importar Planilha">
              <Upload size={20} /> Importar Arquivo (Excel/CSV)
            </button>
          </section>
        </div>

        {isSettingsOpen && (
          <form onSubmit={handleUpdateLimits} className="bg-white p-6 rounded-2xl shadow-xl mb-6 animate-in slide-in-from-top-4 border border-slate-200">
            <h3 className="font-bold text-xl mb-2 text-slate-800">Configurações do App</h3>
            <p className="text-sm text-slate-500 mb-6">Ajuste seu orçamento e moeda de preferência.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Moeda</label>
                <select 
                  value={localCurrency}
                  onChange={(e) => setLocalCurrency(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar (US$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Orçamento Mensal</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={localMonthly}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    setLocalMonthly(val)
                    setLocalWeekly(val / 4)
                  }}
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Orçamento Semanal (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={localWeekly}
                  onChange={(e) => setLocalWeekly(parseFloat(e.target.value) || 0)}
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition">Cancelar</button>
                <button type="submit" className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl font-bold transition">Salvar</button>
              </div>
            </div>
          </form>
        )}

        {isImportOpen && pendingImports.length === 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 animate-in slide-in-from-top-4">
            <h3 className="font-semibold mb-2">Importar Planilha (Excel ou CSV)</h3>
            <p className="text-xs text-slate-500 mb-4">Arquivos suportados: .xlsx, .xls, .csv. As planilhas do Google Docs podem ser baixadas como .xlsx e enviadas aqui.</p>
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
        )}

        {pendingImports.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 animate-in slide-in-from-bottom-4 border-2 border-indigo-500">
            <h3 className="font-bold text-xl mb-2 text-indigo-700">Validar Importação</h3>
            <p className="text-sm text-slate-500 mb-2">Verifique se os dados da planilha foram lidos corretamente. Linhas com erros serão ignoradas.</p>
            
            {detectedHeaders.length > 0 && (
              <div className="mb-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono">
                <strong>Colunas detectadas no seu arquivo:</strong> {detectedHeaders.join(', ')}
              </div>
            )}
            
            <div className="overflow-x-auto max-h-96 overflow-y-auto mb-4 border rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 sticky top-0 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-slate-600">Data</th>
                    <th className="p-3 font-semibold text-slate-600">Descrição</th>
                    <th className="p-3 font-semibold text-slate-600">Pagador</th>
                    <th className="p-3 font-semibold text-slate-600">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingImports.map((exp) => {
                    const isValid = exp.date && !isNaN(exp.amount) && exp.payer;
                    return (
                      <tr key={exp._id} className={isValid ? "hover:bg-slate-50 text-slate-800 font-medium" : "bg-red-50 text-red-500"}>
                        <td className="p-3">{exp.date || 'Faltando'}</td>
                        <td className="p-3 truncate max-w-[200px]">{exp.description}</td>
                        <td className="p-3">{exp.payer || 'Faltando'}</td>
                        <td className="p-3 font-bold">{!isNaN(exp.amount) ? formatMoney(exp.amount) : 'Inválido'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4">
              <button onClick={cancelImport} className="flex-1 p-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">Cancelar</button>
              <button onClick={confirmImport} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md">
                Confirmar e Salvar no Banco
              </button>
            </div>
          </div>
        )}

        {isInviteOpen && (
          <form onSubmit={handleInvite} className="bg-white p-5 rounded-2xl shadow-lg mb-6 animate-in slide-in-from-top-4">
            <h3 className="font-semibold mb-2">Compartilhar Conta</h3>
            <p className="text-xs text-slate-500 mb-4">Digite o e-mail da pessoa que irá dividir os gastos com você.</p>
            <div className="space-y-4">
              <div>
                <input type="email" name="email" required placeholder="email@exemplo.com" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 p-2 bg-slate-100 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 p-2 bg-indigo-600 text-white rounded-lg font-medium">Convidar</button>
              </div>
            </div>
          </form>
        )}

        {isFormOpen && (
          <form onSubmit={handleAddExpense} className="bg-white p-5 rounded-2xl shadow-lg mb-6 animate-in slide-in-from-top-4">
            <h3 className="font-semibold mb-4">{expenseToEdit ? 'Editar Gasto' : 'Novo Gasto'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input type="date" name="date" required defaultValue={expenseToEdit?.date || new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input type="number" name="amount" step="0.01" min="0.01" required defaultValue={expenseToEdit?.amount || ''} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quem pagou?</label>
                <div className="flex gap-2">
                  <label className="flex-1 text-center p-2 border rounded-lg cursor-pointer has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                    <input type="radio" name="payer" value="Alê" className="hidden" required defaultChecked={expenseToEdit?.payer === 'Alê'} /> Alê
                  </label>
                  <label className="flex-1 text-center p-2 border rounded-lg cursor-pointer has-[:checked]:border-pink-600 has-[:checked]:bg-pink-50">
                    <input type="radio" name="payer" value="Maria" className="hidden" required defaultChecked={expenseToEdit?.payer === 'Maria'} /> Maria
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input type="text" name="description" defaultValue={expenseToEdit?.description || ''} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }} className="flex-1 p-2 bg-slate-100 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 p-2 bg-indigo-600 text-white rounded-lg font-medium">Salvar</button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:space-y-0">
          {weeks.length === 0 ? (
            <p className="text-center text-slate-500 py-8 md:col-span-2">Nenhum gasto neste mês.</p>
          ) : (
            weeks.map(week => {
              const remaining = weeklyBudget - week.total
              return (
                <div key={week.number} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between border-b pb-3 mb-3">
                    <h3 className="font-bold text-slate-800">Semana {week.number}</h3>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Gasto: {formatMoney(week.total)}</p>
                      <p className={`font-semibold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {remaining < 0 ? 'Passou: ' : 'Resta: '}{formatMoney(Math.abs(remaining))}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {week.expenses.map((exp: any) => (
                      <div key={exp.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${exp.payer === 'Alê' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {exp.payer.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">{exp.description}</p>
                            <p className="text-xs text-slate-400">{exp.date.split('-').reverse().slice(0,2).join('/')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{formatMoney(Number(exp.amount))}</span>
                          <button onClick={() => openEditExpense(exp)} className="text-slate-400 hover:text-slate-600 p-1">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

function getWeekOfMonth(date: Date) {
  // Pega o primeiro dia do mês da data fornecida
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  
  // getDay() retorna 0 para Domingo, 1 para Segunda, etc.
  // A fórmula Math.ceil((dia + diaDaSemanaDoPrimeiroDia) / 7) 
  // quebra as semanas perfeitamente de Domingo a Sábado.
  return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7)
}
