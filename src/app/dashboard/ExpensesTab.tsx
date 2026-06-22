'use client'
import { Plus, Edit2, Trash2, ShoppingBag, ArrowUpRight, ArrowDownRight, Calendar, Clock, LayoutGrid } from 'lucide-react'

interface ExpensesTabProps {
  payerFilter: string
  setPayerFilter: (p: any) => void
  members: any[]
  filteredExpenses: any[]
  weeks: any[]
  totals: any
  monthlyBudget: number
  totalWeeksInMonth: number
  currency: string
  formatMoney: (v: number) => string
  setIsFormOpen: (open: boolean) => void
  openEditExpense: (exp: any) => void
  handleDelete: (id: string) => void
  viewMode: 'day' | 'week' | 'month'
  groupedExpenses: any[]
}

export default function ExpensesTab({
  payerFilter,
  setPayerFilter,
  members,
  filteredExpenses,
  formatMoney,
  setIsFormOpen,
  openEditExpense,
  handleDelete,
  viewMode,
  groupedExpenses,
  totals
}: ExpensesTabProps) {
  
  const getIcon = () => {
    if (viewMode === 'day') return <Clock size={16} className="text-indigo-500" />
    if (viewMode === 'week') return <Calendar size={16} className="text-indigo-500" />
    return <LayoutGrid size={16} className="text-indigo-500" />
  }

  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-slate-600'
    const colors = ['bg-indigo-600/80', 'bg-rose-600/80', 'bg-emerald-600/80', 'bg-amber-600/80', 'bg-purple-600/80', 'bg-cyan-600/80']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-24">
      {/* HEADER DE DESPESAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
        <div>
          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Monitor de Capital</p>
          <h4 className="text-4xl font-black text-white tracking-tighter italic uppercase">Gestão de Despesas</h4>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="group relative flex items-center gap-4 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all duration-500"
        >
          <Plus size={18} />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* RESUMO DE DESPESAS POR PAGADOR - BENTO STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div 
          onClick={() => setPayerFilter('Todos')}
          className={`cursor-pointer glass-card rounded-[3rem] p-8 border transition-all duration-700 hover:scale-[1.02] active:scale-95 flex items-center gap-6 shadow-2xl relative overflow-hidden ${payerFilter === 'Todos' ? 'border-indigo-500/40 bg-indigo-500/5 glow-indigo' : 'border-white/5 opacity-50 hover:opacity-80'}`}
        >
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${payerFilter === 'Todos' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 rotate-6' : 'bg-white/5 text-slate-400'}`}>
            <ShoppingBag size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Consolidado</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">{formatMoney(totals.globalTotal)}</p>
          </div>
        </div>

        {members.map((m, idx) => {
          const name = m.display_name || m.email.split('@')[0]
          const isSelected = payerFilter === name
          const colorClass = getAvatarColor(name)
          const shadowClass = colorClass.replace('bg-', 'shadow-').replace('-600', '-500/30').replace('-600/80', '-500/30')
          const glowClass = colorClass.replace('bg-', 'border-').replace('-600', '-500/40').replace('-600/80', '-500/40')
          const bgGlowClass = colorClass.replace('bg-', 'bg-').replace('-600', '-500/5').replace('-600/80', '-500/5')

          return (
            <div 
              key={name}
              onClick={() => setPayerFilter(name)}
              className={`cursor-pointer glass-card rounded-[3rem] p-8 border transition-all duration-700 hover:scale-[1.02] active:scale-95 flex items-center gap-6 shadow-2xl relative overflow-hidden ${isSelected ? `${glowClass} ${bgGlowClass}` : 'border-white/5 opacity-50 hover:opacity-80'}`}
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${isSelected ? `${colorClass} text-white shadow-xl ${shadowClass} rotate-6` : 'bg-white/5 text-slate-400'}`}>
                <span className="font-black text-3xl italic">{name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Gasto {name}</p>
                <p className="text-3xl font-black text-white tracking-tighter italic">{formatMoney((totals.expensesByMember && totals.expensesByMember[name]) || 0)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass-card rounded-[4rem] p-10 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden bg-white/[0.01] mt-12">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px]"></div>
        
        <div className="flex justify-between items-center mb-16">
          <h4 className="text-3xl font-black text-white tracking-tighter italic flex items-center gap-4">
             Detalhamento <ArrowDownRight className="text-indigo-500" size={24} />
          </h4>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {groupedExpenses.length === 0 || (groupedExpenses.length === 1 && groupedExpenses[0].expenses.length === 0) ? (
          <div className="text-center py-24 glass-card rounded-[3rem] border border-dashed border-white/5 md:col-span-2 xl:col-span-3">
            <ShoppingBag size={40} className="mx-auto mb-6 text-slate-800" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Nenhum registro encontrado</p>
          </div>
        ) : (
          groupedExpenses.map((group, idx) => (
            <div 
              key={group.label} 
              className="glass-card rounded-[2.5rem] p-8 border border-white/5 hover:border-white/10 transition-all duration-500 group shadow-xl"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-6">
                <div className="flex items-center gap-3">
                   {getIcon()}
                   <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">{group.label}</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {group.expenses.length} itens
                </div>
              </div>
              
              <div className="space-y-4">
                {group.expenses.map((exp: any) => (
                  <div key={exp.id} className="p-4 hover:bg-white/[0.03] rounded-2xl transition-all duration-300 group/item relative">
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-white text-[10px] shadow-lg ${getAvatarColor(exp.payer)}`}>
                        {exp.payer ? exp.payer.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-slate-200 truncate">{exp.description || 'Gasto'}</p>
                          <span className="font-black text-sm text-white tracking-tighter italic">{formatMoney(Number(exp.amount))}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[8px] font-black px-2 py-0.5 bg-white/5 text-slate-400 uppercase rounded-md tracking-widest shrink-0">{exp.category || 'Outros'}</span>
                            <span className="text-[8px] font-black px-2 py-0.5 bg-white/5 text-slate-400 uppercase rounded-md tracking-widest flex items-center gap-1 opacity-80 min-w-0">
                              <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${getAvatarColor(exp.payer).replace('/80', '')}`}></div> 
                              <span className="truncate">{exp.payer || 'Desconhecido'}</span>
                            </span>
                            {viewMode !== 'day' && <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest shrink-0">{exp.date.split('-').reverse().slice(0,2).join('/')}</span>}
                          </div>
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => openEditExpense(exp)} className="p-2 hover:text-indigo-400 transition-colors"><Edit2 size={12} /></button>
                            <button onClick={() => handleDelete(exp.id)} className="p-2 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
