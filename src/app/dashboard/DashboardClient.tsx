'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { addExpense, updateExpense, deleteExpense } from '../actions/expenses'
import { updateHouseholdSettings } from '../actions/settings'
import { addRecurringExpense, deleteRecurringExpense, applyRecurringExpenses } from '../actions/recurring'
import { Trash2, Upload, ChevronLeft, ChevronRight, LogOut, Users, Settings, Edit2, Repeat, Download, X, Wallet, TrendingUp } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import Charts from './Charts'

export default function DashboardClient({ 
  initialExpenses, 
  householdId, 
  userEmail,
  initialMonthlyBudget,
  initialWeeklyBudget,
  initialCurrency,
  initialRecurringExpenses
}: { 
  initialExpenses: any[], 
  householdId: string, 
  userEmail: string,
  initialMonthlyBudget: number,
  initialWeeklyBudget: number,
  initialCurrency: string,
  initialRecurringExpenses: any[]
}) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses)
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
  const [isRecurringOpen, setIsRecurringOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const closeAllModals = () => {
    setIsFormOpen(false)
    setIsSettingsOpen(false)
    setIsRecurringOpen(false)
    setIsInviteOpen(false)
    setIsImportOpen(false)
    setExpenseToEdit(null)
  }
  
  const CATEGORIES = ['Mercado', 'Contas', 'Lazer', 'Saúde', 'Transporte', 'Outros']
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Sincronização em Tempo Real (Realtime Magic)
    const channel = supabase.channel('realtime_expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `household_id=eq.${householdId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setExpenses(prev => {
            if (prev.find(e => e.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        } else if (payload.eventType === 'UPDATE') {
          setExpenses(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
        } else if (payload.eventType === 'DELETE') {
          setExpenses(prev => prev.filter(e => e.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase])

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
    const formData = new FormData(e.currentTarget)
    if (!formData.get('description')) {
      formData.set('description', 'Mercado')
    }
    
    startTransition(async () => {
      if (expenseToEdit) {
        const result = await updateExpense(expenseToEdit.id, formData)
        if (result.success && result.data) {
          setExpenses(prev => prev.map(exp => exp.id === expenseToEdit.id ? result.data : exp))
          setIsFormOpen(false)
          setExpenseToEdit(null)
        } else {
          alert('Erro ao atualizar gasto: ' + (result.error || 'Desconhecido'))
        }
      } else {
        const result = await addExpense(formData)
        if (result.success && result.data) {
          setExpenses(prev => [...prev, result.data])
          setIsFormOpen(false)
          // Using standard DOM method to reset form
          const formElement = document.getElementById('expenseForm') as HTMLFormElement
          if (formElement) formElement.reset()
        } else {
          alert('Erro ao salvar gasto: ' + (result.error || 'Desconhecido'))
        }
      }
    })
  }

  const openEditExpense = (exp: any) => {
    setExpenseToEdit(exp)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este gasto?')) {
      startTransition(async () => {
        const result = await deleteExpense(id)
        if (result.success) {
          setExpenses(prev => prev.filter(e => e.id !== id))
        } else {
          alert('Erro ao excluir: ' + result.error)
        }
      })
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
        let rawDesc = descKey ? String(r[descKey]).trim() : 'Mercado' // Padrão solicitado pelo usuário
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
    
    // 1. Buscar o perfil pelo e-mail para obter o user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      alert('A pessoa precisa criar a conta primeiro com o e-mail: ' + email)
      return
    }

    // 2. Adicionar na tabela household_members usando o user_id encontrado
    const { error } = await supabase.from('household_members').insert({
        household_id: householdId,
        user_id: profile.id,
        email: email
    })
    
    if(!error) {
       alert('Sucesso! Agora a pessoa já tem acesso aos dados e gastos compartilhados.')
       setIsInviteOpen(false)
    } else {
       if (error.code === '23505') {
         alert('Esta pessoa já foi convidada ou já faz parte do grupo.')
       } else {
         alert('Erro ao convidar: ' + error.message)
       }
    }
  }

  const exportToExcel = () => {
    if (monthExpenses.length === 0) {
      alert('Não há gastos neste mês para exportar.')
      return
    }

    const dataToExport = monthExpenses.map(exp => ({
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

  const handleUpdateLimits = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Add missing inputs manually since they might not be in a FormData if we use controlled state
    formData.append('monthly_budget', localMonthly.toString())
    formData.append('weekly_budget', localWeekly.toString())
    formData.append('currency', localCurrency)

    startTransition(async () => {
      const result = await updateHouseholdSettings(householdId, formData)
      if (result.success) {
        setMonthlyBudget(localMonthly)
        setWeeklyBudget(localWeekly)
        setCurrency(localCurrency)
        setIsSettingsOpen(false)
        alert('Configurações atualizadas com sucesso!')
      } else {
        alert('Erro ao atualizar configurações: ' + result.error)
      }
    })
  }

  const openSettings = () => {
    setLocalMonthly(monthlyBudget)
    setLocalWeekly(weeklyBudget)
    setLocalCurrency(currency)
    setIsSettingsOpen(true)
  }

  const handleAddRecurring = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addRecurringExpense(formData)
      if (result.success && result.data) {
        setRecurringExpenses(prev => [...prev, result.data])
        const formElement = e.target as HTMLFormElement
        formElement.reset()
      } else {
        alert('Erro ao adicionar gasto fixo: ' + result.error)
      }
    })
  }

  const handleDeleteRecurring = async (id: string) => {
    if (confirm('Excluir este gasto fixo?')) {
      startTransition(async () => {
        const result = await deleteRecurringExpense(id)
        if (result.success) {
          setRecurringExpenses(prev => prev.filter(e => e.id !== id))
        } else {
          alert('Erro ao excluir: ' + result.error)
        }
      })
    }
  }

  const handleApplyRecurring = async () => {
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`
    startTransition(async () => {
      const result = await applyRecurringExpenses(householdId, monthStr)
      if (result.success) {
        alert(`${result.count} gastos fixos lançados neste mês! Atualize a página se os dados não aparecerem imediatamente (o realtime pode estar desativado).`)
        setIsRecurringOpen(false)
        // Forçar reload na tela para carregar do DB, ou depender do revalidatePath
        window.location.reload()
      } else {
        alert('Erro ao lançar gastos fixos: ' + result.error)
      }
    })
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-12 font-sans text-slate-800">
      <header className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 md:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={closeAllModals} className="flex items-center gap-4 group text-left focus:outline-none cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg transform -rotate-3 group-hover:rotate-0 group-active:scale-95 transition duration-300">
                <img src="/logo.png" alt="Dividi Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="group-hover:translate-x-1 transition-transform">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white drop-shadow-md leading-none">Dividi</h1>
                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-0.5">Gestão Compartilhada</p>
              </div>
            </button>
            <div className="flex gap-3">
              <button onClick={() => setIsRecurringOpen(true)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition" title="Gastos Fixos">
                <Repeat size={20} />
              </button>
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
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              <button onClick={exportToExcel} className="p-1 hover:bg-white/20 rounded transition text-emerald-300" title="Exportar Mês para Excel">
                <Download size={16} />
              </button>
            </h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/20 rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        
        <Charts expenses={monthExpenses} currency={currency} />

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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsSettingsOpen(false)}>
            <form onSubmit={handleUpdateLimits} onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="relative mb-6">
                <h3 className="font-bold text-2xl text-slate-800 pr-10">Configurações do App</h3>
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm" title="Fechar e voltar ao Dashboard">
                   <X size={24} />
                </button>
              </div>
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
        </div>
      )}

        {isRecurringOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsRecurringOpen(false)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-4">
              <h3 className="font-bold text-2xl text-slate-800 pr-10">Gastos Fixos Recorrentes</h3>
              <button onClick={() => setIsRecurringOpen(false)} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm" title="Fechar e voltar ao Dashboard">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Defina contas fixas (ex: Aluguel, Internet) e lance todas de uma vez no mês atual.</p>
            
            <div className="mb-6">
              {recurringExpenses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum gasto fixo cadastrado.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recurringExpenses.map(req => (
                    <li key={req.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800 flex items-center gap-2">
                          {req.description} 
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{req.category}</span>
                        </p>
                        <p className="text-xs text-slate-500">Pagador: {req.payer}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{formatMoney(Number(req.amount))}</span>
                        <button onClick={() => handleDeleteRecurring(req.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {recurringExpenses.length > 0 && (
                <button 
                  onClick={handleApplyRecurring} 
                  disabled={isPending}
                  className="w-full mt-4 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Repeat size={18} /> {isPending ? 'Lançando...' : 'Lançar todos neste mês'}
                </button>
              )}
            </div>

            <form onSubmit={handleAddRecurring} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-sm mb-3">Adicionar Novo Gasto Fixo</h4>
              <input type="hidden" name="household_id" value={householdId} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Descrição</label>
                  <input type="text" name="description" required className="w-full p-2 text-sm border rounded-lg" placeholder="Ex: Aluguel" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Valor</label>
                  <input type="number" name="amount" step="0.01" min="0.01" required className="w-full p-2 text-sm border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Quem paga?</label>
                  <select name="payer" className="w-full p-2 text-sm border rounded-lg bg-white">
                    <option value="Alê">Alê</option>
                    <option value="Maria">Maria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Categoria</label>
                  <select name="category" defaultValue="Contas" className="w-full p-2 text-sm border rounded-lg bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isPending} className="w-full p-2 bg-indigo-600 text-white rounded-lg font-medium text-sm disabled:opacity-50">
                Adicionar Fixo
              </button>
            </form>
          </div>
        </div>
      )}

        {isImportOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsImportOpen(false)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">Importar Planilha</h3>
                <button type="button" onClick={() => setIsImportOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
                  <X size={20} />
                </button>
              </div>

              {pendingImports.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 p-12 text-center rounded-2xl">
                  <Upload size={40} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500 mb-4">Arraste seu arquivo .xlsx, .xls ou .csv aqui ou clique para selecionar.</p>
                  <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-2">Verifique se os dados da planilha foram lidos corretamente. Linhas com erros serão ignoradas.</p>
                  {detectedHeaders.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono">
                      <strong>Colunas detectadas:</strong> {detectedHeaders.join(', ')}
                    </div>
                  )}
                  <div className="overflow-x-auto max-h-96 overflow-y-auto mb-6 border rounded-xl">
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
                            <tr key={exp._id} className={isValid ? "hover:bg-slate-50 text-slate-800" : "bg-red-50 text-red-500"}>
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
                    <button onClick={cancelImport} className="flex-1 p-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Cancelar</button>
                    <button onClick={confirmImport} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md">Confirmar e Salvar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isInviteOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsInviteOpen(false)}>
            <form onSubmit={handleInvite} onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-slate-200">
              <div className="relative mb-6">
                <h3 className="font-bold text-2xl text-slate-800 pr-10">Convidar para a Casa</h3>
                <button type="button" onClick={() => setIsInviteOpen(false)} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm" title="Fechar e voltar ao Dashboard">
                   <X size={24} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Insira o e-mail da pessoa que você deseja convidar para compartilhar estes dados.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail do convidado</label>
                  <input type="email" name="email" required placeholder="email@exemplo.com" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">Convidar</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }}>
            <form id="expenseForm" onSubmit={handleAddExpense} onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="relative mb-6">
                <h3 className="font-bold text-2xl text-slate-800 pr-10">{expenseToEdit ? 'Editar Gasto' : 'Novo Gasto'}</h3>
                <button type="button" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm" title="Fechar e voltar ao Dashboard">
                   <X size={24} />
                </button>
              </div>
              <input type="hidden" name="household_id" value={householdId} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input type="date" name="date" required defaultValue={expenseToEdit?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <input type="number" name="amount" step="0.01" min="0.01" required defaultValue={expenseToEdit?.amount || ''} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Quem pagou?</label>
                  <div className="flex gap-2">
                    <label className="flex-1 text-center p-3 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 font-bold text-blue-600">
                      <input type="radio" name="payer" value="Alê" className="hidden" required defaultChecked={expenseToEdit?.payer === 'Alê'} /> Alê
                    </label>
                    <label className="flex-1 text-center p-3 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:border-pink-600 has-[:checked]:bg-pink-50 font-bold text-pink-600">
                      <input type="radio" name="payer" value="Maria" className="hidden" required defaultChecked={expenseToEdit?.payer === 'Maria'} /> Maria
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input type="text" name="description" placeholder="Ex: Mercado Semanal" defaultValue={expenseToEdit?.description || ''} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select name="category" defaultValue={expenseToEdit?.category || 'Outros'} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Cancelar</button>
                  <button type="submit" disabled={isPending} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition disabled:opacity-50">
                    {isPending ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                      <div key={exp.id} className="flex items-center justify-between group p-1 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${exp.payer === 'Alê' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {exp.payer.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-slate-800 truncate">{exp.description || 'Gasto'}</p>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 uppercase rounded-md tracking-wider">{exp.category || 'Outros'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{exp.date.split('-').reverse().slice(0,2).join('/')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="font-bold text-sm text-slate-900">{formatMoney(Number(exp.amount))}</span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditExpense(exp)} className="text-slate-300 hover:text-indigo-600 p-1.5 transition-colors" title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-red-600 p-1.5 transition-colors" title="Excluir">
                              <Trash2 size={14} />
                            </button>
                          </div>
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
