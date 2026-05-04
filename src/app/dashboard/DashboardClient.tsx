'use client'
// Dividi App - Dashboard Client - v1.1.0 (Tabbed Settings & Incomes)

import { useState, useMemo, useTransition, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { addExpense, updateExpense, deleteExpense } from '../actions/expenses'
import { updateHouseholdSettings } from '../actions/settings'
import { inviteUser } from '../actions/invite'
import { addRecurringExpense, deleteRecurringExpense, applyRecurringExpenses, updateRecurringExpense } from '../actions/recurring'
import { updateCategoryBudget } from '../actions/budgets'
import { addIncome, deleteIncome, updateIncome } from '../actions/incomes'
import { Trash2, Upload, ChevronLeft, ChevronRight, LogOut, Users, Settings, Edit2, Repeat, Download, X, Wallet, TrendingUp, Receipt, Plus } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import Charts from './Charts'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
export default function DashboardClient({ 
  initialExpenses, 
  householdId, 
  userEmail,
  initialMonthlyBudget,
  initialWeeklyBudget,
  initialCurrency,
  initialCategoryBudgets,
  initialIncomes,
  initialMembers = []
}: { 
  initialExpenses: any[], 
  householdId: string, 
  userEmail: string,
  initialMonthlyBudget: number,
  initialWeeklyBudget: number,
  initialCurrency: string,
  initialRecurringExpenses: any[],
  initialCategoryBudgets: any[],
  initialIncomes: any[],
  initialMembers: any[]
}) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [incomes, setIncomes] = useState(initialIncomes)
  const [members, setMembers] = useState(initialMembers)
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses)
  const [monthlyBudget, setMonthlyBudget] = useState(initialMonthlyBudget)
  const [weeklyBudget, setWeeklyBudget] = useState(initialWeeklyBudget)
  const [currency, setCurrency] = useState(initialCurrency)
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>(initialCategoryBudgets)
  const [recurringTab, setRecurringTab] = useState<'launch' | 'manage'>('launch')
  
  // Estados para o formulário de configurações
  const [localMonthly, setLocalMonthly] = useState(initialMonthlyBudget)
  const [localWeekly, setLocalWeekly] = useState(initialWeeklyBudget)
  const [localCurrency, setLocalCurrency] = useState(initialCurrency)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialDate = useMemo(() => {
    const monthParam = searchParams.get('month')
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number)
      if (!isNaN(year) && !isNaN(month)) {
        return new Date(year, month - 1, 1)
      }
    }
    return new Date()
  }, [searchParams])

  const [currentDate, setCurrentDate] = useState(initialDate)

  // Sincronizar data com a URL
  useEffect(() => {
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    if (searchParams.get('month') !== monthStr) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('month', monthStr)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [currentDate, pathname, router, searchParams])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [pendingImports, setPendingImports] = useState<any[]>([])
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isRecurringOpen, setIsRecurringOpen] = useState(false)
  const [recurringToEdit, setRecurringToEdit] = useState<any>(null)
  const [recurringDate, setRecurringDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  
  // Novos estados para Receitas e Abas
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [incomeToEdit, setIncomeToEdit] = useState<any>(null)
  const [settingsTab, setSettingsTab] = useState<'budget' | 'family' | 'account'>('budget')
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

    // Incomes Realtime
    const incomeChannel = supabase.channel('realtime_incomes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes', filter: `household_id=eq.${householdId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncomes(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setIncomes(prev => prev.map(i => i.id === payload.new.id ? payload.new : i))
        } else if (payload.eventType === 'DELETE') {
          setIncomes(prev => prev.filter(i => i.id !== payload.old.id))
        }
      })
      .subscribe()

    const membersChannel = supabase.channel('realtime_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_members', filter: `household_id=eq.${householdId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMembers(prev => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setMembers(prev => prev.filter(m => m.user_id !== payload.old.user_id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(incomeChannel)
      supabase.removeChannel(membersChannel)
    }
  }, [householdId, supabase])

  // --- BUSCA DINÂMICA DE DADOS POR MÊS ---
  useEffect(() => {
    const fetchMonthData = async () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const [expsRes, incsRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('household_id', householdId)
          .gte('date', firstDay)
          .lte('date', lastDay),
        supabase
          .from('incomes')
          .select('*')
          .eq('household_id', householdId)
          .gte('date', firstDay)
          .lte('date', lastDay)
      ])

      if (expsRes.data) {
        setExpenses(prev => {
          // Remove os gastos do mês atual antes de adicionar os novos para evitar duplicidade
          const otherMonths = prev.filter(e => {
            const d = new Date(e.date + 'T12:00:00')
            return d.getFullYear() !== year || d.getMonth() !== month
          })
          return [...otherMonths, ...expsRes.data!]
        })
      }

      if (incsRes.data) {
        setIncomes(prev => {
          const otherMonths = prev.filter(i => {
            const d = new Date(i.date + 'T12:00:00')
            return d.getFullYear() !== year || d.getMonth() !== month
          })
          return [...otherMonths, ...incsRes.data!]
        })
      }
    }

    fetchMonthData()
  }, [currentDate, householdId, supabase])

  const monthExpenses = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return expenses.filter(exp => {
      const expDate = new Date(exp.date + 'T12:00:00')
      return expDate.getFullYear() === year && expDate.getMonth() === month
    })
  }, [expenses, currentDate])

  // --- Cálculo de Semanas no Mês ---
  const totalWeeksInMonth = useMemo(() => {
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return getWeekOfMonth(lastDay)
  }, [currentDate])

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'Todas') return monthExpenses
    return monthExpenses.filter(exp => exp.category === categoryFilter)
  }, [monthExpenses, categoryFilter])

  const totals = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    
    // Valores GLOBAIS do mês (ignorando filtros de categoria)
    const globalTotal = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const globalAle = monthExpenses.filter(exp => exp.payer === 'Alê').reduce((sum, exp) => sum + Number(exp.amount), 0)
    const globalMaria = monthExpenses.filter(exp => exp.payer === 'Maria').reduce((sum, exp) => sum + Number(exp.amount), 0)
    const globalIncome = incomes
      .filter(i => i.date.startsWith(monthStr))
      .reduce((acc, i) => acc + Number(i.amount), 0)
    const globalIncomeAle = incomes
      .filter(i => i.date.startsWith(monthStr) && i.payer === 'Alê')
      .reduce((acc, i) => acc + Number(i.amount), 0)
    const globalIncomeMaria = incomes
      .filter(i => i.date.startsWith(monthStr) && i.payer === 'Maria')
      .reduce((acc, i) => acc + Number(i.amount), 0)
    const globalPlanned = categoryBudgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0)

    // Valores FILTRADOS (para a seção de detalhes e semanas)
    const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const aleFiltered = filteredExpenses.filter(exp => exp.payer === 'Alê').reduce((sum, exp) => sum + Number(exp.amount), 0)
    const mariaFiltered = filteredExpenses.filter(exp => exp.payer === 'Maria').reduce((sum, exp) => sum + Number(exp.amount), 0)
    
    // Receitas Filtradas (se necessário no futuro)
    const filteredIncomes = incomes.filter(i => {
      const d = new Date(i.date + 'T12:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    })

    let currentLimit = globalPlanned
    if (categoryFilter !== 'Todas') {
      const catBudget = categoryBudgets.find(b => b.category === categoryFilter)
      currentLimit = catBudget ? Number(catBudget.monthly_limit) : 0
    }

    const currentWeeklyLimit = currentLimit / totalWeeksInMonth

    return { 
      globalTotal,
      globalIncome,
      globalIncomeAle,
      globalIncomeMaria,
      globalBalance: globalIncome - globalTotal,
      globalPlanned,
      globalAle,
      globalMaria,
      filteredTotal, 
      ale: aleFiltered, 
      maria: mariaFiltered, 
      remaining: currentLimit > 0 ? currentLimit - filteredTotal : 0,
      limit: currentLimit,
      weeklyLimit: currentWeeklyLimit,
      hideWeeklyProgress: categoryFilter === 'Contas'
    }
  }, [monthExpenses, filteredExpenses, incomes, categoryFilter, categoryBudgets, totalWeeksInMonth, currentDate])

  const weeks = useMemo(() => {
    const w: Record<number, any> = {}
    filteredExpenses.forEach(exp => {
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
  }, [filteredExpenses])

  const formatMoney = (v: number) => {
    return v.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency 
    })
  }

  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      let result
      if (incomeToEdit) {
        result = await updateIncome(incomeToEdit.id, formData)
      } else {
        result = await addIncome(formData)
      }

      if (result.success && result.data) {
        if (incomeToEdit) {
          setIncomes(prev => prev.map(inc => inc.id === incomeToEdit.id ? result.data : inc))
        } else {
          setIncomes(prev => [...prev, result.data])
        }
        setIsIncomeFormOpen(false)
        setIncomeToEdit(null)
      } else if (result.error) {
        alert('Erro: ' + result.error)
      }
    })
  }

  const openEditIncome = (income: any) => {
    setIncomeToEdit(income)
    setIsIncomeFormOpen(true)
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return
    startTransition(async () => {
      const result = await deleteIncome(id)
      if (result.success) {
        setIncomes(prev => prev.filter(i => i.id !== id))
      } else {
        alert('Erro ao excluir: ' + result.error)
      }
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
    
    startTransition(async () => {
      const result = await inviteUser(householdId, email)
      if (result.success) {
        alert('Sucesso! Agora a pessoa já tem acesso aos dados e gastos compartilhados.')
        setIsInviteOpen(false)
      } else {
        alert(result.error)
      }
    })
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
      let result
      if (recurringToEdit) {
        result = await updateRecurringExpense(recurringToEdit.id, formData)
      } else {
        result = await addRecurringExpense(formData)
      }

      if (result.success && result.data) {
        if (recurringToEdit) {
          setRecurringExpenses(prev => prev.map(r => r.id === recurringToEdit.id ? result.data : r))
          setRecurringToEdit(null)
        } else {
          setRecurringExpenses(prev => [...prev, result.data])
        }
        e.currentTarget.reset()
      } else {
        alert('Erro ao salvar gasto fixo: ' + result.error)
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

  const handleApplyRecurring = async (expenseId?: string, specificDate?: string) => {
    startTransition(async () => {
      const dateToUse = specificDate || recurringDate
      const result = await applyRecurringExpenses(householdId, dateToUse, expenseId)
      if (result.success) {
        alert(expenseId ? 'Gasto lançado com sucesso!' : `${result.count} gastos lançados com sucesso!`)
        if (!expenseId) setIsRecurringOpen(false) // Fecha o modal se lançar tudo
      } else {
        alert('Erro ao lançar: ' + result.error)
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

          {/* Filtros de Categoria em Destaque */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            <button
              onClick={() => setCategoryFilter('Todas')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shadow-md border uppercase tracking-widest ${
                categoryFilter === 'Todas' 
                  ? 'bg-white text-indigo-600 border-white' 
                  : 'bg-indigo-400/30 text-indigo-100 border-indigo-400/20 hover:bg-white/20'
              }`}
            >
              Tudo
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shadow-md border uppercase tracking-widest ${
                  categoryFilter === cat 
                    ? 'bg-white text-indigo-600 border-white' 
                    : 'bg-indigo-400/30 text-indigo-100 border-indigo-400/20 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        
        {/* CARDS DE RESUMO NO TOPO - Sempre mostram o global do mês */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Saldo do Mês</p>
            <h3 className={`text-3xl font-black ${totals.globalBalance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatMoney(totals.globalBalance)}
            </h3>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 ${totals.globalBalance < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Receitas</p>
            <h3 className="text-3xl font-black text-slate-900">{formatMoney(totals.globalIncome)}</h3>
            <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-blue-500">Alê: {formatMoney(totals.globalIncomeAle)}</span>
              <span className="text-pink-500">Maria: {formatMoney(totals.globalIncomeMaria)}</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Gastos</p>
            <h3 className="text-3xl font-black text-slate-900">{formatMoney(totals.globalTotal)}</h3>
            <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
               Total Geral do Mês
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Planejado (Limite)</p>
            <h3 className="text-3xl font-black text-slate-900">{formatMoney(totals.globalPlanned)}</h3>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((totals.globalTotal / totals.globalPlanned) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <Charts expenses={filteredExpenses} budget={totals.limit > 0 ? totals.limit : monthlyBudget} currency={currency} />

        {/* LISTA DE RECEITAS (NOVO) */}
        <section className="mt-10 bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Entradas</p>
              <h4 className="text-2xl font-black text-slate-800">Extrato de Receitas</h4>
            </div>
            <button 
              onClick={() => setIsIncomeFormOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95"
            >
              <Plus size={18} /> Nova Receita
            </button>
          </div>

          <div className="space-y-4">
            {incomes.filter(i => {
               const d = new Date(i.date + 'T12:00:00');
               return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
            }).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">Nenhuma receita registrada neste mês.</p>
              </div>
            ) : (
              incomes
                .filter(i => {
                  const d = new Date(i.date + 'T12:00:00');
                  return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(income => (
                  <div key={income.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${income.payer === 'Alê' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {income.payer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-tight">{income.description || 'Receita'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(income.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {income.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-lg font-black text-emerald-600">{formatMoney(Number(income.amount))}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditIncome(income)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteIncome(income.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-10">
          <section className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl flex flex-col justify-center border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-6 mb-6 sm:items-center gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                  {categoryFilter === 'Todas' ? 'Gasto Total do Mês' : `Gasto em ${categoryFilter}`}
                </p>
                <p className="text-4xl font-black text-slate-900">{formatMoney(totals.filteredTotal)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{totals.remaining < 0 ? 'Passou do Orçamento' : 'Resta no Mês'}</p>
                <p className={`text-4xl font-black ${totals.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
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
            <div className="flex flex-wrap gap-2 md:gap-3">
            <button onClick={() => setIsIncomeFormOpen(true)} className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-emerald-500/30 group">
              <TrendingUp size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              Lançar Receita
            </button>
            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20 group">
              <Upload size={18} className="group-hover:translate-y-[-2px] transition-transform" />
              Lançar Gasto
            </button>
            <button onClick={() => setIsRecurringOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-white/20 group">
              <Receipt size={18} className="group-hover:scale-110 transition-transform" />
              Pagar Contas
            </button>
            
            <div className="w-[1px] h-8 bg-white/10 mx-1 hidden md:block"></div>

            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20" title="Configurações">
              <Settings size={20} />
            </button>
            <button onClick={() => setIsImportOpen(true)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20" title="Importar Planilha">
              <Download size={20} />
            </button>
          </div>
          </section>
        </div>

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsSettingsOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-300 border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[550px] max-h-[90vh]">
              
              {/* Sidebar das Configurações */}
              <div className="w-full md:w-60 bg-slate-50 border-r border-slate-100 p-6 md:p-8 flex flex-col">
                <h3 className="font-black text-slate-800 text-lg mb-8 uppercase tracking-[0.2em] opacity-80">Ajustes</h3>
                <nav className="space-y-2 flex-1">
                  <button 
                    onClick={() => setSettingsTab('budget')}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${settingsTab === 'budget' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200/50'}`}
                  >
                    <Wallet size={18} /> Orçamento
                  </button>
                  <button 
                    onClick={() => setSettingsTab('family')}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${settingsTab === 'family' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200/50'}`}
                  >
                    <Users size={18} /> Família
                  </button>
                  <button 
                    onClick={() => setSettingsTab('account')}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${settingsTab === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200/50'}`}
                  >
                    <Settings size={18} /> Minha Conta
                  </button>
                </nav>
                <form action="/auth/signout" method="post" className="mt-8">
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                    <LogOut size={18} /> Sair do App
                  </button>
                </form>
              </div>

              {/* Conteúdo das Abas */}
              <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="absolute top-8 right-8 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm">
                   <X size={24} />
                </button>

                {settingsTab === 'budget' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <header className="mb-10">
                      <h4 className="font-black text-slate-800 text-2xl mb-2">Orçamento e Moeda</h4>
                      <p className="text-slate-500 font-medium">Defina como você quer visualizar e controlar seus gastos.</p>
                    </header>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-[0.2em] ml-1">Moeda Principal</label>
                        <select 
                          value={localCurrency}
                          onChange={(e) => setLocalCurrency(e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        >
                          <option value="BRL">Real (R$)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="USD">Dólar (US$)</option>
                        </select>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h5 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-6">Limites por Categoria</h5>
                        <div className="space-y-3">
                          {CATEGORIES.map(cat => {
                            const budget = categoryBudgets.find(b => b.category === cat)
                            return (
                              <div key={cat} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-100 transition-all">
                                <span className="font-black text-slate-700 text-sm uppercase tracking-wider">{cat}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400 font-black text-xs">{currency}</span>
                                  <input 
                                    type="number" 
                                    step="1"
                                    placeholder="Sem limite"
                                    defaultValue={budget?.monthly_limit || ''}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value)
                                      if (!isNaN(val)) {
                                        updateCategoryBudget(householdId, cat, val).then(res => {
                                          if (res.success) {
                                            setCategoryBudgets(prev => {
                                              const existing = prev.find(p => p.category === cat)
                                              if (existing) return prev.map(p => p.category === cat ? { ...p, monthly_limit: val } : p)
                                              return [...prev, { category: cat, monthly_limit: val }]
                                            })
                                          }
                                        })
                                      }
                                    }}
                                    className="w-28 p-2.5 bg-white border-2 border-slate-100 rounded-xl font-black text-slate-900 text-right focus:border-indigo-500 outline-none"
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'family' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <header className="mb-10">
                      <h4 className="font-black text-slate-800 text-2xl mb-2">Membros da Família</h4>
                      <p className="text-slate-500 font-medium">Compartilhe este dashboard com outras pessoas.</p>
                    </header>

                    <form onSubmit={handleInvite} className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 mb-10">
                      <label className="block text-[10px] font-black uppercase text-indigo-400 mb-3 tracking-[0.2em] ml-1">Convidar por E-mail</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          placeholder="email@exemplo.com" 
                          className="flex-1 p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none shadow-sm"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
                          Convidar
                        </button>
                      </div>
                    </form>

                    <div>
                      <h5 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 ml-1">Membros Atuais</h5>
                      <div className="space-y-3">
                        {members.map(member => (
                          <div key={member.user_id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${member.email === userEmail ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                {member.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-sm">{member.email}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase">
                                  {member.email === userEmail ? 'Você (Admin)' : 'Membro'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'account' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <header className="mb-10">
                      <h4 className="font-black text-slate-800 text-2xl mb-2">Minha Conta</h4>
                      <p className="text-slate-500 font-medium">Informações do seu perfil pessoal.</p>
                    </header>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-4xl shadow-2xl mb-6 ring-8 ring-white">
                          {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <h5 className="font-black text-slate-800 text-xl mb-1">{userEmail.split('@')[0]}</h5>
                        <p className="text-slate-400 font-bold text-sm mb-8">{userEmail}</p>
                        
                        <div className="w-full pt-8 border-t border-slate-200 text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Segurança</p>
                          <button className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-left flex justify-between items-center">
                             Alterar Senha
                             <Settings size={16} className="text-slate-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {isRecurringOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsRecurringOpen(false)}>
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-6">
              <h3 className="font-bold text-3xl text-slate-800 pr-10">Gastos Fixos</h3>
              <p className="text-slate-500 font-medium">Lance seus pagamentos ou gerencie seus modelos.</p>
              <button type="button" onClick={() => setIsRecurringOpen(false)} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm" title="Fechar">
                <X size={24} />
              </button>
            </div>

            {/* Seletor de Abas */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[1.25rem] mb-8">
              <button 
                onClick={() => setRecurringTab('launch')}
                className={`flex-1 py-3.5 rounded-[1rem] font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${recurringTab === 'launch' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Receipt size={16} />
                Pagar / Lançar
              </button>
              <button 
                onClick={() => setRecurringTab('manage')}
                className={`flex-1 py-3.5 rounded-[1rem] font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${recurringTab === 'manage' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Settings size={16} />
                Configurar Contas
              </button>
            </div>

            {recurringTab === 'launch' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-3 mb-10">
                  {recurringExpenses.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-black text-lg mb-4 italic">Nenhum gasto fixo cadastrado.</p>
                      <button onClick={() => setRecurringTab('manage')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">Cadastrar Primeiro Gasto</button>
                    </div>
                  ) : (
                    recurringExpenses.map(req => (
                      <div key={req.id} className="group bg-white p-6 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1 min-w-[220px]">
                          <div className="flex items-center gap-3 mb-1.5">
                            <p className="font-black text-slate-800 text-xl leading-tight">{req.description}</p>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-500 text-[10px] font-black rounded-full uppercase tracking-widest">{req.category}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Pagador: {req.payer}</p>
                        </div>

                        <div className="flex flex-wrap items-end lg:items-center gap-8">
                          <div className="flex flex-col items-center">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Valor</p>
                            <div className="bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 min-w-[130px] text-center">
                              <p className="font-black text-slate-900 text-lg">{formatMoney(Number(req.amount))}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest text-center">Data Pagamento</p>
                            <input 
                              type="date" 
                              id={`date-${req.id}`}
                              defaultValue={new Date().toISOString().split('T')[0]}
                              className="p-3 text-sm border-2 border-slate-100 rounded-xl bg-white font-black outline-none focus:border-indigo-500 transition-all shadow-sm"
                            />
                          </div>

                          <button 
                            onClick={() => {
                              const dateVal = (document.getElementById(`date-${req.id}`) as HTMLInputElement).value
                              handleApplyRecurring(req.id, dateVal)
                            }} 
                            className="bg-emerald-500 text-white hover:bg-emerald-600 px-8 py-3.5 rounded-2xl transition-all shadow-lg flex items-center gap-3 group/btn active:scale-95"
                          >
                            <Repeat size={20} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                            <span className="text-xs font-black uppercase tracking-widest">Lançar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {recurringExpenses.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 text-center md:text-left">
                      <h4 className="font-black text-white uppercase text-lg tracking-widest mb-1">Lançamento em Lote</h4>
                      <p className="text-indigo-100/80 text-sm font-medium">Lançar todos os gastos acima com a mesma data.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                      <input 
                        type="date" 
                        value={recurringDate}
                        onChange={(e) => setRecurringDate(e.target.value)}
                        className="flex-1 md:w-44 p-4 text-sm border-none rounded-2xl bg-white/10 text-white font-black outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
                      />
                      <button 
                        onClick={() => handleApplyRecurring()} 
                        disabled={isPending}
                        className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 whitespace-nowrap"
                      >
                        <Repeat size={22} className={isPending ? "animate-spin" : ""} /> 
                        LANÇAR TUDO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                <form onSubmit={handleAddRecurring} className={`p-8 rounded-[2rem] border-2 transition-all ${recurringToEdit ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="font-black text-indigo-900 uppercase text-sm tracking-[0.2em]">{recurringToEdit ? 'Editando Modelo' : 'Novo Gasto Fixo'}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-bold">Defina os valores base que serão usados nos lançamentos.</p>
                    </div>
                    {recurringToEdit && (
                      <button type="button" onClick={() => setRecurringToEdit(null)} className="bg-white px-4 py-2 rounded-lg text-[10px] font-black text-indigo-500 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all uppercase tracking-widest border border-indigo-100">Cancelar Edição</button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 mb-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.15em] ml-2">Descrição do Gasto</label>
                      <input type="text" name="description" required defaultValue={recurringToEdit?.description || ''} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Ex: Aluguel" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.15em] ml-2">Valor Base</label>
                      <input type="number" step="0.01" name="amount" required defaultValue={recurringToEdit?.amount || ''} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="0,00" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.15em] ml-2">Quem Paga?</label>
                      <select name="payer" defaultValue={recurringToEdit?.payer || 'Alê'} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm">
                        <option value="Alê">Alê</option>
                        <option value="Maria">Maria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.15em] ml-2">Categoria</label>
                      <select name="category" defaultValue={recurringToEdit?.category || 'Contas'} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black shadow-xl transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-sm">
                    {recurringToEdit ? 'Atualizar Conta' : 'Salvar Conta Fixa'}
                  </button>
                </form>

                <div className="border-t-2 border-slate-100 pt-10">
                  <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] mb-8 text-center">Minhas Contas Fixas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recurringExpenses.map(req => (
                      <div key={req.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg transition-all">
                        <div>
                          <p className="font-black text-slate-800 text-lg">{req.description}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatMoney(Number(req.amount))} • {req.payer}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setRecurringToEdit(req)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteRecurring(req.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            <form onSubmit={handleInvite} onClick={(e) => e.stopPropagation()} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200 border border-slate-200">
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

        {isIncomeFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }}>
            <form id="incomeForm" onSubmit={handleAddIncome} onClick={(e) => e.stopPropagation()} className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="relative mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <TrendingUp size={32} />
                </div>
                <h3 className="font-black text-2xl text-slate-800">{incomeToEdit ? 'Editar Receita' : 'Lançar Receita'}</h3>
                <button type="button" onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }} className="absolute -top-2 -right-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all shadow-sm">
                   <X size={24} />
                </button>
              </div>
              <input type="hidden" name="household_id" value={householdId} />
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] ml-1">Data</label>
                  <input type="date" name="date" required defaultValue={incomeToEdit?.date || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] ml-1">Valor</label>
                  <input type="number" name="amount" step="0.01" min="0.01" required defaultValue={incomeToEdit?.amount || ''} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-emerald-500 outline-none transition-all" placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] ml-1">Quem recebeu?</label>
                  <div className="flex gap-3">
                    <label className="flex-1 text-center p-4 border-2 rounded-2xl cursor-pointer transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 font-black text-xs uppercase tracking-widest has-[:checked]:text-emerald-700 text-slate-400 border-slate-100 bg-slate-50">
                      <input type="radio" name="payer" value="Alê" className="hidden" required defaultChecked={incomeToEdit?.payer === 'Alê'} /> Alê
                    </label>
                    <label className="flex-1 text-center p-4 border-2 rounded-2xl cursor-pointer transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 font-black text-xs uppercase tracking-widest has-[:checked]:text-emerald-700 text-slate-400 border-slate-100 bg-slate-50">
                      <input type="radio" name="payer" value="Maria" className="hidden" required defaultChecked={incomeToEdit?.payer === 'Maria'} /> Maria
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] ml-1">Descrição</label>
                  <input type="text" name="description" placeholder="Ex: Salário" defaultValue={incomeToEdit?.description || ''} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }} className="flex-1 p-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
                  <button type="submit" disabled={isPending} className="flex-1 p-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all">
                    {isPending ? 'Salvando...' : 'Salvar Receita'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }}>
            <form id="expenseForm" onSubmit={handleAddExpense} onClick={(e) => e.stopPropagation()} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {weeks.length === 0 ? (
            <p className="text-center text-slate-500 py-8 md:col-span-2">Nenhum gasto neste mês.</p>
          ) : (
            weeks.map(week => {
              const weekLimit = totals.weeklyLimit > 0 ? totals.weeklyLimit : (monthlyBudget / totalWeeksInMonth)
              const remaining = weekLimit - week.total
              return (
                <div key={week.number} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between border-b pb-3 mb-3 items-center">
                    <h3 className="font-bold text-slate-800">Semana {week.number}</h3>
                    {!totals.hideWeeklyProgress && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Gasto: {formatMoney(week.total)}</p>
                        <p className={`text-sm font-black ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {remaining < 0 ? 'Passou: ' : 'Resta: '}{formatMoney(Math.abs(remaining))}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {week.expenses.map((exp: any) => (
                      <div key={exp.id} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50 last:border-0">
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${exp.payer === 'Alê' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {exp.payer.charAt(0)}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <p className="font-bold text-base text-slate-800 leading-tight break-words">{exp.description || 'Gasto'}</p>
                              <span className="font-black text-base text-slate-900 whitespace-nowrap leading-none mt-0.5">{formatMoney(Number(exp.amount))}</span>
                            </div>

                            {/* Linha 2: Categoria, Data e Ações */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 uppercase rounded-md tracking-wider leading-none">{exp.category || 'Outros'}</span>
                                <span className="text-[10px] text-slate-400 font-bold leading-none">{exp.date.split('-').reverse().slice(0,2).join('/')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditExpense(exp)} className="text-indigo-500 hover:text-indigo-700 p-1 transition-colors" title="Editar">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors" title="Excluir">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
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
