'use client'
import { Plus, Edit2, Trash2, ShoppingBag, ArrowUpRight, ArrowDownRight, Calendar, Clock, LayoutGrid } from 'lucide-react'

interface ExpensesTabProps {
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
  filteredExpenses,
  formatMoney,
  setIsFormOpen,
  openEditExpense,
  handleDelete,
  viewMode,
  groupedExpenses
}: ExpensesTabProps) {
  
  const getIcon = () => {
    if (viewMode === 'day') return <Clock size={16} className="text-indigo-500" />
    if (viewMode === 'week') return <Calendar size={16} className="text-indigo-500" />
    return <LayoutGrid size={16} className="text-indigo-500" />
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Monitoramento</p>
          <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">Detalhamento de Gastos</h4>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="group relative flex items-center gap-4 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all duration-500"
        >
          <Plus size={18} /> 
          <span>Novo Lançamento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {groupedExpenses.length === 0 || (groupedExpenses.length === 1 && groupedExpenses[0].expenses.length === 0) ? (
          <div className="text-center py-24 glass-card rounded-[3rem] border border-dashed border-white/5 md:col-span-2 xl:col-span-3">
            <ShoppingBag size={40} className="mx-auto mb-6 text-slate-800" />
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Nenhum registro encontrado</p>
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
                <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {group.expenses.length} itens
                </div>
              </div>
              
              <div className="space-y-4">
                {group.expenses.map((exp: any) => (
                  <div key={exp.id} className="p-4 hover:bg-white/[0.03] rounded-2xl transition-all duration-300 group/item relative">
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-white text-[10px] shadow-lg ${exp.payer === 'Alê' ? 'bg-indigo-600/80' : 'bg-rose-600/80'}`}>
                        {exp.payer.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-slate-200 truncate">{exp.description || 'Gasto'}</p>
                          <span className="font-black text-sm text-white tracking-tighter italic">{formatMoney(Number(exp.amount))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black px-2 py-0.5 bg-white/5 text-slate-500 uppercase rounded-md tracking-widest">{exp.category || 'Outros'}</span>
                            {viewMode !== 'day' && <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest">{exp.date.split('-').reverse().slice(0,2).join('/')}</span>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
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
  )
}
