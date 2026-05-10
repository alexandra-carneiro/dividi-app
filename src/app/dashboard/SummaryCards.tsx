'use client'
import { Info, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface SummaryCardsProps {
  payerFilter: string
  totals: any
  formatMoney: (v: number) => string
}

export default function SummaryCards({ payerFilter, totals, formatMoney }: SummaryCardsProps) {
  const balanceValue = payerFilter === 'Todos' ? totals.globalBalance : (totals.filteredIncomeTotal - totals.filteredTotal)
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {/* CARD DE SALDO - ELITE STYLE */}
      <div className="glass-card rounded-[3rem] p-8 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-700 glow-primary">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${balanceValue < 0 ? 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white' : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'}`}>
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Saldo {payerFilter === 'Todos' ? 'Disponível' : `de ${payerFilter}`}
              </p>
            </div>
          </div>
          <div className="group/info relative">
            <Info size={16} className="text-slate-400 hover:text-white cursor-help transition-colors" />
            <div className="absolute bottom-full right-0 mb-4 w-56 p-5 glass-morphism text-white text-[10px] rounded-[1.5rem] opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-50 shadow-2xl border border-white/10 leading-relaxed font-bold">
              Cálculo de Liquidez: <br/><br/>
              <span className="text-emerald-400">Receitas</span> <span className="text-slate-400">-</span> <span className="text-rose-400">Gastos</span> <br/>
              <span className="text-slate-400">=</span> <span className="text-indigo-400 underline decoration-indigo-500/50 underline-offset-4">Capital Disponível</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className={`text-4xl md:text-5xl font-black tracking-tighter ${balanceValue < 0 ? 'text-rose-400' : 'text-emerald-400'} italic`}>
            {formatMoney(balanceValue)}
          </h3>
        </div>

        <div className="mt-10 flex items-center gap-3">
           <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${balanceValue < 0 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                style={{ width: '100%' }}
              ></div>
           </div>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ativo</span>
        </div>
      </div>

      {/* CARD DE RECEITAS - ELITE STYLE */}
      <div className="glass-card rounded-[3rem] p-8 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Total de Entradas</p>
            </div>
          </div>
          <ArrowUpRight size={20} className="text-emerald-500/50" />
        </div>
        
        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
          {formatMoney(totals.filteredIncomeTotal)}
        </h3>
        
        <div className="mt-8 flex items-center gap-2">
           <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
             {payerFilter === 'Todos' ? 'Consolidado' : payerFilter}
           </span>
           <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">+ Lucro Operacional</p>
        </div>
      </div>

      {/* CARD DE GASTOS - ELITE STYLE */}
      <div className="glass-card rounded-[3rem] p-8 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-inner">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Total de Gastos</p>
            </div>
          </div>
          <div className="group/info relative">
            <Info size={16} className="text-slate-400 hover:text-white cursor-help transition-colors" />
            <div className="absolute bottom-full right-0 mb-4 w-56 p-5 glass-morphism text-white text-[10px] rounded-[1.5rem] opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-50 shadow-2xl border border-white/10 leading-relaxed font-bold">
              Monitoramento de Consumo: <br/><br/>
              Soma total de todos os <span className="text-rose-400 font-black italic">débitos</span> e transações realizadas no período selecionado.
            </div>
          </div>
        </div>
        
        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-[1.2] pt-1">
          {formatMoney(totals.filteredTotal)}
        </h3>

        <div className="mt-8 flex items-center gap-2">
           <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
             {payerFilter === 'Todos' ? 'Mensal' : payerFilter}
           </span>
           <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest">Debitado</p>
        </div>
      </div>
    </div>
  )
}
