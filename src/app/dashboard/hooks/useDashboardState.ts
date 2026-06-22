'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { addExpense, updateExpense, deleteExpense } from '../../actions/expenses'
import { updateHouseholdSettings } from '../../actions/settings'
import { inviteUser } from '../../actions/invite'
import { addRecurringExpense, deleteRecurringExpense, applyRecurringExpenses, updateRecurringExpense } from '../../actions/recurring'
import { updateCategoryBudget } from '../../actions/budgets'
import { updateProfile } from '../../actions/profile'
import { addIncome, deleteIncome, updateIncome } from '../../actions/incomes'

export function useDashboardState({
  initialExpenses,
  householdId,
  userEmail,
  initialMonthlyBudget,
  initialWeeklyBudget,
  initialCurrency,
  initialRecurringExpenses,
  initialCategoryBudgets,
  initialIncomes,
  initialMembers = [],
  initialDisplayName
}: {
  initialExpenses: any[],
  householdId: string,
  userEmail: string,
  initialDisplayName: string,
  initialMonthlyBudget: number,
  initialWeeklyBudget: number,
  initialCurrency: string,
  initialRecurringExpenses: any[],
  initialCategoryBudgets: any[],
  initialIncomes: any[],
  initialMembers: any[]
}) {
  const normalizedIncomes = initialIncomes.map(inc => {
    let p = (inc.payer || '').toLowerCase()
    if (p.includes('alexandra') || p.includes('alê') || p.includes('ale')) inc.payer = 'alexandracarneiro'
    if (p.includes('maria')) inc.payer = 'mariaclaratrifoi1'
    return inc
  })

  const [expenses, setExpenses] = useState(initialExpenses)
  const [incomes, setIncomes] = useState(normalizedIncomes)
  const [members, setMembers] = useState(initialMembers)
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses)
  const [monthlyBudget, setMonthlyBudget] = useState(initialMonthlyBudget)
  const [weeklyBudget, setWeeklyBudget] = useState(initialWeeklyBudget)
  const [currency, setCurrency] = useState(initialCurrency)
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>(initialCategoryBudgets)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  
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

  const modalParam = searchParams.get('modal')
  const [isFormOpen, setIsFormOpen] = useState(modalParam === 'expense')
  const [isSettingsOpen, setIsSettingsOpen] = useState(modalParam === 'settings')
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [pendingImports, setPendingImports] = useState<any[]>([])
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isRecurringOpen, setIsRecurringOpen] = useState(modalParam === 'recurring')
  const [recurringToEdit, setRecurringToEdit] = useState<any>(null)
  const [recurringDate, setRecurringDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(modalParam === 'income')
  const [incomeToEdit, setIncomeToEdit] = useState<any>(null)
  const [settingsTab, setSettingsTab] = useState<'budget' | 'family' | 'account' | 'support'>('budget')
  const [payerFilter, setPayerFilter] = useState<string>(searchParams.get('payer') || 'Todos')
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>((searchParams.get('type') as any) || 'expenses')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const [isPending, startTransition] = useTransition()
  const initialTab = useMemo(() => {
    const tabParam = searchParams.get('tab')
    return (tabParam === 'history' || tabParam === 'overview') ? tabParam : 'overview'
  }, [searchParams])

  const [mainTab, setMainTab] = useState<'overview' | 'history'>(initialTab)
  const [recurringTab, setRecurringTab] = useState<'launch' | 'manage'>('launch')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>((searchParams.get('view') as any) || 'month')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  // SYNC STATE TO URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    let changed = false
    
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    if (params.get('month') !== monthStr) { params.set('month', monthStr); changed = true; }
    if (params.get('tab') !== mainTab) { params.set('tab', mainTab); changed = true; }
    if (params.get('type') !== activeTab) { params.set('type', activeTab); changed = true; }
    if (params.get('view') !== viewMode) { params.set('view', viewMode); changed = true; }
    if (params.get('payer') !== payerFilter) { params.set('payer', payerFilter); changed = true; }
    
    let currentModal = null
    if (isFormOpen) currentModal = 'expense'
    else if (isIncomeFormOpen) currentModal = 'income'
    else if (isSettingsOpen) currentModal = 'settings'
    else if (isRecurringOpen) currentModal = 'recurring'
    
    if (currentModal) {
      if (params.get('modal') !== currentModal) { params.set('modal', currentModal); changed = true; }
    } else {
      if (params.has('modal')) { params.delete('modal'); changed = true; }
    }

    if (changed) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [currentDate, mainTab, activeTab, viewMode, payerFilter, isFormOpen, isIncomeFormOpen, isSettingsOpen, isRecurringOpen])

  // SYNC URL TO STATE (back/forward buttons)
  useEffect(() => {
    const monthParam = searchParams.get('month')
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number)
      if (!isNaN(year) && !isNaN(month)) {
        const urlDate = new Date(year, month - 1, 1)
        setCurrentDate(prev => prev.getTime() !== urlDate.getTime() ? urlDate : prev)
      }
    }
    
    // Also sync tabs
    const tabParam = searchParams.get('tab') as any
    if (tabParam) setMainTab(prev => prev !== tabParam ? tabParam : prev)
    
    const viewParam = searchParams.get('view') as any
    if (viewParam) setViewMode(prev => prev !== viewParam ? viewParam : prev)
    
    const typeParam = searchParams.get('type') as any
    if (typeParam) setActiveTab(prev => prev !== typeParam ? typeParam : prev)

    const payerParam = searchParams.get('payer')
    if (payerParam) setPayerFilter(prev => prev !== payerParam ? payerParam : prev)

    const modalParam = searchParams.get('modal')
    if (modalParam === 'expense' && !isFormOpen) setIsFormOpen(true)
    if (modalParam === 'income' && !isIncomeFormOpen) setIsIncomeFormOpen(true)
    if (modalParam === 'settings' && !isSettingsOpen) setIsSettingsOpen(true)
    if (modalParam === 'recurring' && !isRecurringOpen) setIsRecurringOpen(true)
    if (!modalParam) {
      if (isFormOpen) setIsFormOpen(false)
      if (isIncomeFormOpen) setIsIncomeFormOpen(false)
      if (isSettingsOpen) setIsSettingsOpen(false)
      if (isRecurringOpen) setIsRecurringOpen(false)
    }
  }, [searchParams])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Realtime Subscriptions
  useEffect(() => {
    const channel = supabase.channel('realtime_expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `household_id=eq.${householdId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setExpenses(prev => prev.find(e => e.id === payload.new.id) ? prev : [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setExpenses(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
        } else if (payload.eventType === 'DELETE') {
          setExpenses(prev => prev.filter(e => e.id !== payload.old.id))
        }
      })
      .subscribe()

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



  // Computed Values
  const monthExpenses = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return expenses.filter(exp => {
      const expDate = new Date(exp.date + 'T12:00:00')
      return expDate.getFullYear() === year && expDate.getMonth() === month
    })
  }, [expenses, currentDate])

  const totalWeeksInMonth = useMemo(() => {
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return Math.ceil((lastDay.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)
  }, [currentDate])

  const filteredExpenses = useMemo(() => {
    let filtered = monthExpenses
    if (categoryFilter !== 'Todas') filtered = filtered.filter(exp => exp.category === categoryFilter)
    if (payerFilter !== 'Todos') filtered = filtered.filter(exp => exp.payer === payerFilter)
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(exp => (exp.description?.toLowerCase().includes(lowSearch)) || (exp.category?.toLowerCase().includes(lowSearch)))
    }
    return filtered.sort((a, b) => b.date.localeCompare(a.date))
  }, [monthExpenses, categoryFilter, payerFilter, searchTerm])

  const filteredIncomes = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date + 'T12:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    })
    
    let filtered = monthIncomes
    if (payerFilter !== 'Todos') filtered = filtered.filter(inc => inc.payer === payerFilter)
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(inc => (inc.description?.toLowerCase().includes(lowSearch)) || (inc.category?.toLowerCase().includes(lowSearch)))
    }
    return filtered.sort((a, b) => b.date.localeCompare(a.date))
  }, [incomes, currentDate, payerFilter, searchTerm])

  const totals = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    
    const globalTotal = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const globalIncome = incomes.filter(i => i.date.startsWith(monthStr)).reduce((acc, i) => acc + Number(i.amount), 0)
    const globalPlanned = categoryBudgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0)

    const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const filteredIncomeTotal = filteredIncomes.reduce((acc, i) => acc + Number(i.amount), 0)

    let currentLimit = globalPlanned
    if (categoryFilter !== 'Todas') {
      const catBudget = categoryBudgets.find(b => b.category === categoryFilter)
      currentLimit = catBudget ? Number(catBudget.monthly_limit) : 0
    }

    const incomeByMember: Record<string, number> = {}
    incomes.filter(i => i.date.startsWith(monthStr)).forEach(i => {
      const payer = i.payer || 'Desconhecido'
      incomeByMember[payer] = (incomeByMember[payer] || 0) + Number(i.amount)
    })

    const expensesByMember: Record<string, number> = {}
    monthExpenses.forEach(exp => {
      const payer = exp.payer || 'Desconhecido'
      expensesByMember[payer] = (expensesByMember[payer] || 0) + Number(exp.amount)
    })

    return { 
      globalTotal, globalIncome,
      globalBalance: globalIncome - globalTotal, globalPlanned,
      filteredTotal, filteredIncomeTotal,
      remaining: currentLimit > 0 ? currentLimit - filteredTotal : 0,
      limit: currentLimit, weeklyLimit: currentLimit / totalWeeksInMonth,
      hideWeeklyProgress: categoryFilter === 'Contas',
      incomeByMember,
      expensesByMember
    }
  }, [monthExpenses, filteredExpenses, filteredIncomes, incomes, categoryFilter, categoryBudgets, totalWeeksInMonth, currentDate])

  const groupedExpenses = useMemo(() => {
    if (viewMode === 'day') {
      const days: Record<string, any> = {}
      filteredExpenses.forEach(exp => {
        if (!days[exp.date]) days[exp.date] = { label: exp.date.split('-').reverse().join('/'), date: exp.date, expenses: [] }
        days[exp.date].expenses.push(exp)
      })
      return Object.values(days).sort((a: any, b: any) => b.date.localeCompare(a.date))
    }
    
    if (viewMode === 'week') {
      const w: Record<number, any> = {}
      filteredExpenses.forEach(exp => {
        const expDate = new Date(exp.date + 'T12:00:00')
        const firstDayOfMonth = new Date(expDate.getFullYear(), expDate.getMonth(), 1)
        const weekNum = Math.ceil((expDate.getDate() + firstDayOfMonth.getDay()) / 7)
        if (!w[weekNum]) w[weekNum] = { label: `Semana ${weekNum}`, expenses: [] }
        w[weekNum].expenses.push(exp)
      })
      return Object.values(w).sort((a: any, b: any) => b.label.localeCompare(a.label))
    }

    // Month: Group by Category for better analysis
    const categories: Record<string, any> = {}
    filteredExpenses.forEach(exp => {
      const cat = exp.category || 'Outros'
      if (!categories[cat]) categories[cat] = { label: cat, expenses: [] }
      categories[cat].expenses.push(exp)
    })
    return Object.values(categories).sort((a: any, b: any) => b.expenses.length - a.expenses.length)
  }, [filteredExpenses, viewMode])

  const weeks = useMemo(() => {
    const w: Record<number, any> = {}
    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date + 'T12:00:00')
      const firstDayOfMonth = new Date(expDate.getFullYear(), expDate.getMonth(), 1)
      const weekNum = Math.ceil((expDate.getDate() + firstDayOfMonth.getDay()) / 7)
      if (!w[weekNum]) w[weekNum] = { number: weekNum, total: 0, expenses: [] }
      w[weekNum].total += Number(exp.amount)
      w[weekNum].expenses.push(exp)
    })
    return Object.values(w).sort((a: any, b: any) => a.number - b.number).map((week: any) => ({
      ...week,
      expenses: week.expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
  }, [filteredExpenses])

  // Handlers
  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (!formData.get('description')) formData.set('description', 'Mercado')
    
    startTransition(async () => {
      const description = formData.get('description') as string
      const amount = formData.get('amount') as string
      const payer = formData.get('payer') as string

      if (!description || !amount || !payer) {
        showToast('Preencha todos os campos obrigatórios!', 'error')
        return
      }

      const result = expenseToEdit ? await updateExpense(expenseToEdit.id, formData) : await addExpense(formData)
      if (result.success && result.data) {
        if (expenseToEdit) {
          setExpenses(prev => prev.map(exp => exp.id === expenseToEdit.id ? result.data : exp))
          setExpenseToEdit(null)
        } else {
          setExpenses(prev => [...prev, result.data])
        }
        setIsFormOpen(false)
        showToast(expenseToEdit ? 'Gasto atualizado!' : 'Gasto registrado!')
      } else {
        showToast('Erro: ' + (result.error || 'Desconhecido'), 'error')
      }
    })
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Excluir este gasto?')) return
    startTransition(async () => {
      const result = await deleteExpense(id)
      if (result.success) {
        setExpenses(prev => prev.filter(e => e.id !== id))
        showToast('Gasto excluído.', 'info')
      } else {
        showToast('Erro ao excluir: ' + result.error, 'error')
      }
    })
  }

  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const description = formData.get('description') as string
      const amount = formData.get('amount') as string
      const payer = formData.get('payer') as string

      if (!description || !amount || !payer) {
        showToast('Preencha os campos de valor e pagador!', 'error')
        return
      }

      const result = incomeToEdit ? await updateIncome(incomeToEdit.id, formData) : await addIncome(formData)
      if (result.success && result.data) {
        if (incomeToEdit) {
          setIncomes(prev => prev.map(inc => inc.id === incomeToEdit.id ? result.data : inc))
          setIncomeToEdit(null)
        } else {
          setIncomes(prev => [...prev, result.data])
        }
        setIsIncomeFormOpen(false)
        showToast(incomeToEdit ? 'Receita atualizada!' : 'Receita registrada!')
      } else {
        showToast('Erro: ' + result.error, 'error')
      }
    })
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return
    startTransition(async () => {
      const result = await deleteIncome(id)
      if (result.success) {
        setIncomes(prev => prev.filter(i => i.id !== id))
        showToast('Receita excluída.', 'info')
      } else {
        showToast('Erro ao excluir: ' + result.error, 'error')
      }
    })
  }

  const handleUpdateLimits = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
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
        showToast('Configurações atualizadas!')
      } else {
        showToast('Erro: ' + result.error, 'error')
      }
    })
  }

  const handleAddRecurring = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = recurringToEdit ? await updateRecurringExpense(recurringToEdit.id, formData) : await addRecurringExpense(formData)
      if (result.success && result.data) {
        if (recurringToEdit) {
          setRecurringExpenses(prev => prev.map(r => r.id === recurringToEdit.id ? result.data : r))
          setRecurringToEdit(null)
        } else {
          setRecurringExpenses(prev => [...prev, result.data])
        }
        showToast('Gasto fixo salvo!')
      } else {
        showToast('Erro: ' + result.error, 'error')
      }
    })
  }

  const handleDeleteRecurring = async (id: string) => {
    if (!confirm('Excluir este gasto fixo?')) return
    startTransition(async () => {
      const result = await deleteRecurringExpense(id)
      if (result.success) {
        setRecurringExpenses(prev => prev.filter(e => e.id !== id))
        showToast('Gasto fixo excluído.', 'info')
      } else {
        showToast('Erro: ' + result.error, 'error')
      }
    })
  }

  const handleApplyRecurring = async (expenseId?: string, specificDate?: string) => {
    startTransition(async () => {
      const dateToUse = specificDate || recurringDate
      const result = await applyRecurringExpenses(householdId, dateToUse, expenseId)
      if (result.success) {
        if (result.data) {
          setExpenses(prev => [...prev, ...result.data])
        }
        showToast(expenseId ? 'Gasto fixo lançado!' : `${result.count} gastos fixos lançados!`)
        if (!expenseId) setIsRecurringOpen(false)
      } else {
        showToast('Erro: ' + result.error, 'error')
      }
    })
  }

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    startTransition(async () => {
      const result = await inviteUser(householdId, email)
      if (result.success) {
        showToast('Convite enviado!')
        setIsInviteOpen(false)
      } else {
        showToast(result.error || 'Erro ao enviar convite', 'error')
      }
    })
  }

  const handleUpdateProfile = async (name: string) => {
    const formData = new FormData()
    formData.append('display_name', name)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        setDisplayName(name)
        showToast('Perfil atualizado!')
      } else {
        showToast('Erro ao atualizar: ' + result.error, 'error')
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return {
    expenses, setExpenses, incomes, setIncomes, members, setMembers, recurringExpenses, setRecurringExpenses,
    monthlyBudget, setMonthlyBudget, weeklyBudget, setWeeklyBudget, currency, setCurrency,
    categoryBudgets, setCategoryBudgets, localMonthly, setLocalMonthly, localWeekly, setLocalWeekly,
    localCurrency, setLocalCurrency, currentDate, setCurrentDate, isFormOpen, setIsFormOpen,
    isSettingsOpen, setIsSettingsOpen, expenseToEdit, setExpenseToEdit, isImportOpen, setIsImportOpen,
    pendingImports, setPendingImports, detectedHeaders, setDetectedHeaders, isInviteOpen, setIsInviteOpen,
    isRecurringOpen, setIsRecurringOpen, recurringToEdit, setRecurringToEdit, recurringDate, setRecurringDate,
    categoryFilter, setCategoryFilter, isIncomeFormOpen, setIsIncomeFormOpen, incomeToEdit, setIncomeToEdit,
    mainTab, setMainTab, recurringTab, setRecurringTab, viewMode, setViewMode,
    settingsTab, setSettingsTab, payerFilter, setPayerFilter, activeTab, setActiveTab, searchTerm, setSearchTerm,
    toast, setToast, isPending, totals, weeks, groupedExpenses, filteredExpenses, filteredIncomes,
    totalWeeksInMonth, handleAddExpense, handleDeleteExpense, handleAddIncome, handleDeleteIncome,
    handleUpdateLimits, handleAddRecurring, handleDeleteRecurring, handleApplyRecurring, handleInvite, handleSignOut,
    handleUpdateProfile, displayName, setDisplayName,
    showToast, supabase, householdId, userEmail, loading: false
  }
}
