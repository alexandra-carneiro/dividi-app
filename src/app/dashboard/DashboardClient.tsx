'use client'
import { useState } from 'react'
import { LogOut, Settings, Download, ChevronLeft, ChevronRight, Search, CheckCircle, Receipt, Sparkles, TrendingUp, TrendingDown, Target, LayoutGrid, Calendar, HelpCircle, User } from 'lucide-react'
import Sidebar from './components/Sidebar'
import SummaryCards from './SummaryCards'
import TabNavigation from './TabNavigation'
import IncomesTab from './IncomesTab'
import ExpensesTab from './ExpensesTab'
import RecurringExpensesModal from './RecurringExpensesModal'
import SettingsModal from './SettingsModal'
import ImportModal from './ImportModal'
import IncomeModal from './IncomeModal'
import ExpenseModal from './ExpenseModal'
import InviteModal from './InviteModal'
import DashboardSkeleton from './components/SkeletonLoader'
import BottomNavigation from './components/BottomNavigation'
import Logo from './components/Logo'

import { useDashboardState } from './hooks/useDashboardState'
import { handleFileImport } from './utils/ImportLogic'
import { exportExpensesToExcel } from './utils/ExportLogic'
import { CATEGORIES, formatCurrency } from './utils/constants'
import { updateCategoryBudget } from '../actions/budgets'

export default function DashboardClient(props: any) {
  const state = useDashboardState(props)
  const [showRadarInfo, setShowRadarInfo] = useState(false)
  
  const {
    householdId, userEmail, currency, currentDate, setCurrentDate, 
    isFormOpen, setIsFormOpen, isSettingsOpen, setIsSettingsOpen,
    expenseToEdit, setExpenseToEdit, isImportOpen, setIsImportOpen,
    pendingImports, setPendingImports, detectedHeaders, setDetectedHeaders,
    isInviteOpen, setIsInviteOpen, isRecurringOpen, setIsRecurringOpen,
    recurringToEdit, setRecurringToEdit, recurringDate, setRecurringDate,
    categoryFilter, setCategoryFilter, isIncomeFormOpen, setIsIncomeFormOpen,
    incomeToEdit, setIncomeToEdit, settingsTab, setSettingsTab,
    payerFilter, setPayerFilter, activeTab, setActiveTab,
    searchTerm, setSearchTerm, toast, isPending, recurringTab, setRecurringTab,
    mainTab, setMainTab, viewMode, setViewMode,
    totals, weeks, groupedExpenses, filteredExpenses, filteredIncomes, totalWeeksInMonth,
    recurringExpenses, members, categoryBudgets, setCategoryBudgets,
    monthlyBudget, localCurrency, setLocalCurrency,
    handleAddExpense, handleDeleteExpense, handleAddIncome, handleDeleteIncome,
    handleUpdateLimits, handleAddRecurring, handleDeleteRecurring, 
    handleApplyRecurring, handleInvite, handleSignOut, supabase,
    handleUpdateProfile, displayName
  } = state

  const formatMoney = (v: number) => formatCurrency(v, currency)
  const safeExpenses = Number(totals.globalTotal || 0)
  const safeBudget = Number(monthlyBudget || 0)
  const percentage = safeBudget > 0 ? Math.round((safeExpenses / safeBudget) * 100) : 0

  const getInsights = () => {
    const insights = []
    if (totals.globalBalance < 0) {
      insights.push({ 
        icon: <TrendingDown className="text-rose-400" size={18} />, 
        text: "Fluxo de caixa sob pressão. Considere adiar compras não essenciais.",
        type: 'warning'
      })
    }
    if (percentage > 90) {
      insights.push({ 
        icon: <Target className="text-rose-500" size={18} />, 
        text: `Alerta Vermelho: Você já atingiu ${percentage}% do teto mensal!`,
        type: 'danger'
      })
    } else if (percentage > 70) {
      insights.push({ 
        icon: <Target className="text-amber-400" size={18} />, 
        text: `Atenção: ${percentage}% do orçamento consumido. Reduza o passo.`,
        type: 'info'
      })
    }
    if (insights.length === 0) {
      insights.push({
        icon: <Sparkles className="text-indigo-400" size={18} />,
        text: "Radar Financeiro: Sua gestão está impecável. Continue assim!",
        type: 'neutral'
      })
    }
    return insights
  }

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileImport(file, householdId, members, setDetectedHeaders, setPendingImports)
  }

  const onExportExcel = () => {
    exportExpensesToExcel(state.expenses.filter((exp: any) => {
        const expDate = new Date(exp.date + 'T12:00:00')
        return expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() === currentDate.getMonth()
    }), currentDate)
  }

  const confirmImport = async () => {
    const validExpenses = pendingImports.filter((e: any) => e.date && !isNaN(e.amount) && e.amount > 0 && e.payer).map(({_id, ...rest}: any) => rest)
    if (validExpenses.length === 0) return
    const { data, error } = await supabase.from('expenses').insert(validExpenses).select()
    if (!error && data) {
      state.setExpenses((prev: any) => [...prev, ...data])
      setPendingImports([])
      setIsImportOpen(false)
    }
  }

  const closeAllModals = () => {
    setIsFormOpen(false); setIsSettingsOpen(false); setIsRecurringOpen(false);
    setIsInviteOpen(false); setIsImportOpen(false); setExpenseToEdit(null);
  }

  if (state.loading) return <DashboardSkeleton />

  return (
    <div className="w-full min-h-screen bg-[#020617] md:pl-80 font-sans text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        mainTab={mainTab} setMainTab={setMainTab}
        setIsFormOpen={setIsFormOpen} setIsIncomeFormOpen={setIsIncomeFormOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        setIsRecurringOpen={setIsRecurringOpen} handleSignOut={handleSignOut}
      />

      {/* DEBUG INFO ONLY FOR HER TO SEE */}
      <div className="fixed bottom-0 right-0 z-[1000] p-2 bg-red-500 text-white text-xs font-bold rounded-tl-lg">
         DEBUG TOTAL RECEITAS: {props.initialIncomes?.length || 0}
      </div>

      {/* TOAST PREMIUM */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-[calc(50%+160px)] z-[300] animate-in fade-in slide-in-from-top-8 duration-500">
          <div className="glass-morphism px-8 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-4 glow-primary">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <CheckCircle size={16} className="text-white" />
             </div>
             <p className="font-bold text-sm tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}

      {/* MOBILE HEADER */}
      <header className="md:hidden flex justify-between items-center px-6 py-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <Logo size="small" onClick={closeAllModals} />
        <button onClick={() => setIsSettingsOpen(true)} aria-label="Abrir configurações de perfil" className="p-3 bg-white/5 rounded-xl text-slate-400">
           <User size={20} />
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 md:py-16 space-y-12 pb-32">
        
        {/* VIEW 1: OVERVIEW (CLEAN DASHBOARD) */}
        {mainTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            <div>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Dividi Elite</p>
               <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-[1.2] pt-1">Centro de Controle</h2>
            </div>

            {/* ROW 1: Smart Insights & Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 glass-card rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-8">
                        <h3 className="text-xl font-black text-white tracking-tight italic uppercase">Radar Estratégico</h3>
                        <button onClick={() => setShowRadarInfo(!showRadarInfo)} aria-label="Informações sobre o Radar Estratégico" className="text-slate-400 hover:text-indigo-400 transition-colors">
                           <HelpCircle size={18} />
                        </button>
                      </div>
                      
                      {showRadarInfo && (
                        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                           <p className="text-[10px] font-bold text-indigo-300 leading-relaxed uppercase tracking-wider">
                             O Radar analisa seu orçamento mensal e histórico de gastos para projetar sua saúde financeira e sugerir ações corretivas em tempo real.
                           </p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {getInsights().map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                             <div className="mt-1">{insight.icon}</div>
                             <p className="text-sm font-bold text-slate-400 leading-snug">{insight.text}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                         <circle 
                            cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={502} 
                            strokeDashoffset={502 - (502 * Math.min(percentage, 100)) / 100}
                            className={`${percentage > 90 ? 'text-rose-500' : 'text-indigo-500'} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                         />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                         <span className="text-4xl font-black">{percentage}%</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilizado</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 glass-card rounded-[3rem] p-10 flex flex-col justify-center items-center text-center">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                      <TrendingUp size={32} />
                   </div>
                   <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Saldo Projetado</h4>
                   <p className={`text-4xl font-black ${totals.globalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatMoney(totals.globalBalance)}
                   </p>
                </div>
                <button onClick={() => setMainTab('history')} className="w-full py-5 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-[2rem] transition-all border border-white/5 font-black text-[11px] uppercase tracking-widest group">
                   Ver Detalhamento <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <SummaryCards 
              payerFilter={payerFilter} totals={totals} formatMoney={formatMoney} 
              onNavigate={(tab: 'expenses' | 'incomes') => { setActiveTab(tab); setMainTab('history'); }}
            />
          </div>
        )}

        {/* VIEW 2: HISTORY (DETAILED TRANSACTIONS) */}
        {mainTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Auditoria</p>
                  <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-[1.2] pt-1">Histórico de Fluxo</h2>
               </div>

               {/* DATE FILTER RELOCATED HERE */}
               <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5 shadow-xl">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-3 hover:bg-white/10 rounded-xl transition-all text-indigo-400">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="px-4 text-center min-w-[120px]">
                    <span className="font-black text-sm tracking-widest text-white uppercase italic">
                      {currentDate.toLocaleString('pt-BR', { month: 'short' })} {currentDate.getFullYear()}
                    </span>
                  </div>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-3 hover:bg-white/10 rounded-xl transition-all text-indigo-400">
                    <ChevronRight size={20} />
                  </button>
               </div>
            </header>

            {/* SEARCH & CATEGORY/PAYER FILTERS */}
            <div className="space-y-8 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
               <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-700">
                      <Search size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Pesquisar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-[2rem] py-5 pl-14 pr-8 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex bg-white/5 p-1 rounded-[1.5rem] border border-white/5">
                    {['day', 'week', 'month'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setViewMode(m as any)}
                        className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        {m === 'day' ? 'Dia' : m === 'week' ? 'Semana' : 'Mês'}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-[1.5rem] border border-white/5">
                    {['Todos', ...members.map((m: any) => m.display_name || m.email.split('@')[0])].map(p => (
                      <button
                        key={p}
                        onClick={() => setPayerFilter(p as any)}
                        className={`px-8 py-2.5 rounded-[1.25rem] text-[10px] font-black transition-all uppercase tracking-widest ${
                          payerFilter === p ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
               </div>
            </div>

            <div className="animate-in fade-in duration-1000">
              {activeTab === 'incomes' && (
                <IncomesTab 
                  payerFilter={payerFilter} setPayerFilter={setPayerFilter}
                  filteredIncomes={filteredIncomes} totals={totals} members={members}
                  formatMoney={formatMoney} openEditIncome={(i: any) => { setIncomeToEdit(i); setIsIncomeFormOpen(true); }}
                  handleDeleteIncome={handleDeleteIncome}
                  setIsIncomeFormOpen={setIsIncomeFormOpen}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesTab 
                  payerFilter={payerFilter} setPayerFilter={setPayerFilter} members={members}
                  filteredExpenses={filteredExpenses} weeks={weeks} totals={totals}
                  monthlyBudget={props.initialMonthlyBudget} totalWeeksInMonth={totalWeeksInMonth}
                  currency={currency} formatMoney={formatMoney}
                  setIsFormOpen={setIsFormOpen} openEditExpense={(e: any) => { setExpenseToEdit(e); setIsFormOpen(true); }}
                  handleDelete={handleDeleteExpense}
                  viewMode={viewMode} groupedExpenses={groupedExpenses}
                />
              )}
            </div>
            
            <button onClick={onExportExcel} className="w-full py-5 flex items-center justify-center gap-3 bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-[2rem] transition-all border border-white/5 font-black text-[11px] uppercase tracking-widest group">
               <Download size={16} /> Exportar Relatório do Mês
            </button>
          </div>
        )}

        {/* MODALS */}
        <RecurringExpensesModal 
          isRecurringOpen={isRecurringOpen} setIsRecurringOpen={setIsRecurringOpen}
          recurringTab={recurringTab} setRecurringTab={setRecurringTab}
          recurringExpenses={recurringExpenses} recurringToEdit={recurringToEdit} setRecurringToEdit={setRecurringToEdit}
          recurringDate={recurringDate} setRecurringDate={setRecurringDate}
          handleApplyRecurring={handleApplyRecurring} handleAddRecurring={handleAddRecurring}
          handleDeleteRecurring={handleDeleteRecurring} formatMoney={formatMoney}
          CATEGORIES={CATEGORIES} isPending={isPending} members={members}
        />

        <SettingsModal 
          isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen}
          settingsTab={settingsTab} setSettingsTab={setSettingsTab}
          localCurrency={localCurrency} setLocalCurrency={setLocalCurrency}
          CATEGORIES={CATEGORIES} categoryBudgets={categoryBudgets}
          updateCategoryBudget={updateCategoryBudget} setCategoryBudgets={setCategoryBudgets}
          householdId={householdId} currency={currency} members={members}
          userEmail={userEmail} handleInvite={handleInvite} handleSignOut={handleSignOut}
          displayName={displayName} handleUpdateProfile={handleUpdateProfile}
          supabase={supabase}
        />

        <ImportModal 
          isImportOpen={isImportOpen} setIsImportOpen={setIsImportOpen}
          pendingImports={pendingImports} detectedHeaders={detectedHeaders}
          handleFileUpload={onFileUpload} cancelImport={() => setPendingImports([])}
          confirmImport={confirmImport} formatMoney={formatMoney}
        />

        <IncomeModal 
          isIncomeFormOpen={isIncomeFormOpen} setIsIncomeFormOpen={setIsIncomeFormOpen}
          incomeToEdit={incomeToEdit} setIncomeToEdit={setIncomeToEdit}
          handleAddIncome={handleAddIncome} householdId={householdId}
          currency={currency} isPending={isPending} members={members}
        />

        <ExpenseModal 
          isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen}
          expenseToEdit={expenseToEdit} setExpenseToEdit={setExpenseToEdit}
          handleAddExpense={handleAddExpense} householdId={householdId}
          currency={currency} CATEGORIES={CATEGORIES} isPending={isPending}
          members={members}
        />

        <InviteModal isInviteOpen={isInviteOpen} setIsInviteOpen={setIsInviteOpen} handleInvite={handleInvite} />
      </main>

      <BottomNavigation 
        mainTab={mainTab} setMainTab={setMainTab}
        setIsFormOpen={setIsFormOpen} setIsIncomeFormOpen={setIsIncomeFormOpen}
        setIsSettingsOpen={setIsSettingsOpen} setIsRecurringOpen={setIsRecurringOpen}
      />
    </div>
  )
}
