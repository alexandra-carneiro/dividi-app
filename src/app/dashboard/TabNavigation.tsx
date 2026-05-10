'use client'
import { Wallet, TrendingUp, Sparkles } from 'lucide-react'

interface TabNavigationProps {
  activeTab: 'expenses' | 'incomes'
  setActiveTab: (tab: 'expenses' | 'incomes') => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex justify-center mb-16 mt-12 relative">
      {/* Decoração de fundo luminescente */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white/[0.03] p-2.5 rounded-[3rem] flex gap-3 backdrop-blur-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`group flex items-center gap-4 px-12 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-700 relative overflow-hidden ${activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] scale-[1.05]' : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'}`}
        >
          {activeTab === 'expenses' && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-shimmer"></div>}
          <Wallet size={18} className={`${activeTab === 'expenses' ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-500`} /> 
          Gastos
          {activeTab === 'expenses' && <Sparkles size={12} className="absolute top-3 right-3 text-white/40" />}
        </button>
        
        <button 
          onClick={() => setActiveTab('incomes')}
          className={`group flex items-center gap-4 px-12 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-700 relative overflow-hidden ${activeTab === 'incomes' ? 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] scale-[1.05]' : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'}`}
        >
          {activeTab === 'incomes' && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-shimmer"></div>}
          <TrendingUp size={18} className={`${activeTab === 'incomes' ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-500`} /> 
          Receitas
          {activeTab === 'incomes' && <Sparkles size={12} className="absolute top-3 right-3 text-white/40" />}
        </button>
      </div>
    </div>
  )
}
