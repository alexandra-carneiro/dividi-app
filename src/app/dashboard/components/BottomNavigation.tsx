'use client'
import { TrendingUp, User, Receipt, LayoutGrid, Calendar } from 'lucide-react'

interface BottomNavigationProps {
  mainTab: 'overview' | 'history'
  setMainTab: (tab: 'overview' | 'history') => void
  setIsFormOpen: (open: boolean) => void
  setIsIncomeFormOpen: (open: boolean) => void
  setIsSettingsOpen: (open: boolean) => void
  setIsRecurringOpen: (open: boolean) => void
}

export default function BottomNavigation({
  mainTab,
  setMainTab,
  setIsFormOpen,
  setIsIncomeFormOpen,
  setIsSettingsOpen,
  setIsRecurringOpen
}: BottomNavigationProps) {
  return (
    <>
      {/* Mobile: Solid Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#020617] border-t border-white/5 px-4 py-4 flex items-center justify-around backdrop-blur-xl">
        <button 
          onClick={() => setMainTab('overview')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all ${mainTab === 'overview' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <LayoutGrid size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => setIsRecurringOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2 text-slate-400"
        >
          <Calendar size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Fixos</span>
        </button>

        {/* Dois botões centrais: Gasto e Receita */}
        <div className="flex items-center gap-3 -mt-8 shrink-0">
          <button 
            onClick={() => setIsFormOpen(true)}
            aria-label="Adicionar novo gasto"
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl border-4 border-[#020617] transform active:scale-95 transition-all"
          >
            <Receipt size={18} />
            <span className="text-[6px] font-black uppercase tracking-widest mt-0.5">Gasto</span>
          </button>
          <button 
            onClick={() => setIsIncomeFormOpen(true)}
            aria-label="Adicionar nova receita"
            className="w-12 h-12 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl border-4 border-[#020617] transform active:scale-95 transition-all"
          >
            <TrendingUp size={18} />
            <span className="text-[6px] font-black uppercase tracking-widest mt-0.5">Receita</span>
          </button>
        </div>

        <button 
          onClick={() => setMainTab('history')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all ${mainTab === 'history' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          <Receipt size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2 text-slate-400"
        >
          <User size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
        </button>
      </div>
    </>
  )
}
