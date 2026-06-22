'use client'
import { TrendingUp, Edit2, Trash2, Wallet, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react'

interface IncomesTabProps {
  payerFilter: string
  setPayerFilter: (p: any) => void
  filteredIncomes: any[]
  totals: any
  members: any[]
  formatMoney: (v: number) => string
  openEditIncome: (income: any) => void
  handleDeleteIncome: (id: string) => void
  setIsIncomeFormOpen: (open: boolean) => void
}

export default function IncomesTab({
  payerFilter,
  setPayerFilter,
  filteredIncomes,
  totals,
  formatMoney,
  openEditIncome,
  handleDeleteIncome,
  setIsIncomeFormOpen,
  members
}: IncomesTabProps) {
  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-slate-600'
    const colors = ['bg-indigo-600', 'bg-rose-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-cyan-600']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-24">
      {/* HEADER DE RECEITAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
        <div>
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Monitor de Capital</p>
          <h4 className="text-4xl font-black text-white tracking-tighter italic">Gestão de Receitas</h4>
        </div>
        <button
          onClick={() => setIsIncomeFormOpen(true)}
          className="group relative flex items-center gap-4 bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all duration-500"
        >
          <Plus size={18} />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* RESUMO DE RECEITAS POR PAGADOR - BENTO STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div 
          onClick={() => setPayerFilter('Todos')}
          className={`cursor-pointer glass-card rounded-[3rem] p-8 border transition-all duration-700 hover:scale-[1.02] active:scale-95 flex items-center gap-6 shadow-2xl relative overflow-hidden ${payerFilter === 'Todos' ? 'border-emerald-500/40 bg-emerald-500/5 glow-emerald' : 'border-white/5 opacity-50 hover:opacity-80'}`}
        >
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${payerFilter === 'Todos' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 rotate-6' : 'bg-white/5 text-slate-400'}`}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Consolidado</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">{formatMoney(totals.globalIncome)}</p>
          </div>
          {payerFilter === 'Todos' && <div className="absolute top-4 right-4"><CheckCircle2 size={16} className="text-emerald-500/50" /></div>}
        </div>

        {members.map((m, idx) => {
          const name = m.display_name || m.email.split('@')[0]
          const isSelected = payerFilter === name
          const colorClass = getAvatarColor(name)
          const shadowClass = colorClass.replace('bg-', 'shadow-').replace('-600', '-500/30')
          const glowClass = colorClass.replace('bg-', 'border-').replace('-600', '-500/40')
          const bgGlowClass = colorClass.replace('bg-', 'bg-').replace('-600', '-500/5')

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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Renda {name}</p>
                <p className="text-3xl font-black text-white tracking-tighter italic">{formatMoney((totals.incomeByMember && totals.incomeByMember[name]) || 0)}</p>
              </div>
              {isSelected && <div className="absolute top-4 right-4"><CheckCircle2 size={16} className={`opacity-50 ${colorClass.replace('bg-', 'text-')}`} /></div>}
            </div>
          )
        })}
      </div>

      {/* LISTA DE RECEITAS - ELITE STYLE */}
      <div className="glass-card rounded-[4rem] p-10 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden bg-white/[0.01]">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]"></div>
        
        <div className="flex justify-between items-center mb-16">
          <h4 className="text-3xl font-black text-white tracking-tighter italic flex items-center gap-4">
             Extrato de Receitas <ArrowUpRight className="text-emerald-500" size={24} />
          </h4>
        </div>

        <div className="space-y-6">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-700 animate-pulse">
                <Wallet size={48} />
              </div>
              <p className="text-slate-400 font-bold text-xl tracking-tight">Sem entradas registradas.</p>
              <p className="text-slate-400 text-[10px] mt-3 font-black uppercase tracking-[0.3em] opacity-80">Seu fluxo de caixa está aguardando novos lançamentos.</p>
            </div>
          ) : (
            filteredIncomes
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((income, idx) => (
                <div 
                  key={income.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all duration-700 group animate-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-6 mb-6 sm:mb-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${getAvatarColor(income.payer)}`}>
                      {income.payer ? income.payer.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-black text-xl text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-500">{income.description || 'Receita Financeira'}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">
                        {new Date(income.date + 'T12:00:00').toLocaleDateString('pt-BR')} <span className="mx-2 opacity-30">•</span> {income.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-10">
                    <div className="text-right">
                       <p className="text-3xl font-black text-emerald-400 tracking-tighter italic drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{formatMoney(Number(income.amount))}</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0 duration-500">
                      <button onClick={() => openEditIncome(income)} className="p-4 bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all border border-white/5"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteIncome(income.id)} className="p-4 bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all border border-white/5"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  )
}
