'use client'
import { Info } from 'lucide-react'

interface SummaryCardsProps {
  payerFilter: string
  totals: any
  formatMoney: (v: number) => string
}

export default function SummaryCards({ payerFilter, totals, formatMoney }: SummaryCardsProps) {
  const balanceValue = payerFilter === 'Todos' ? totals.globalBalance : (totals.filteredIncomeTotal - totals.filteredTotal)
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {/* SALDO */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Saldo {payerFilter === 'Todos' ? 'do Mês' : `da ${payerFilter === 'Maria' ? 'Maria' : 'Alê'}`}
          </p>
          <div className="group/info relative">
            <Info size={14} className="text-slate-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              O Saldo é o que sobra do dinheiro: <br/><br/>
              <span className="text-emerald-400">Receitas</span> - <span className="text-red-400">Gastos</span> = <span className="font-bold underline">Saldo</span>
            </div>
          </div>
        </div>
        <h3 className={`text-3xl font-black ${balanceValue < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {formatMoney(balanceValue)}
        </h3>
        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
           <div className={`h-full transition-all duration-1000 ${balanceValue < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* RECEITAS */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Receitas</p>
          <div className="group/info relative">
            <Info size={14} className="text-slate-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              {payerFilter === 'Todos' ? 'A soma de todo o dinheiro que entrou na conta da família este mês.' : `Total de receitas registradas para ${payerFilter}.`}
            </div>
          </div>
        </div>
        <h3 className="text-3xl font-black text-slate-900">{formatMoney(totals.filteredIncomeTotal)}</h3>
        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
           {payerFilter === 'Todos' ? 'Total da Família' : `Recebido por ${payerFilter}`}
        </div>
      </div>

      {/* GASTOS */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Gastos</p>
          <div className="group/info relative">
            <Info size={14} className="text-slate-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              {payerFilter === 'Todos' ? 'A soma de todas as despesas e contas pagas pela família este mês.' : `Total de gastos registrados para ${payerFilter}.`}
            </div>
          </div>
        </div>
        <h3 className="text-3xl font-black text-slate-900">{formatMoney(totals.filteredTotal)}</h3>
        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
           {payerFilter === 'Todos' ? 'Total Geral do Mês' : `Gastos de ${payerFilter}`}
        </div>
      </div>
    </div>
  )
}
