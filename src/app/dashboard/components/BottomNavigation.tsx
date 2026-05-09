'use client'
import { Plus, User, Receipt, LayoutGrid, Calendar } from 'lucide-react'

interface BottomNavigationProps {
  mainTab: 'overview' | 'history'
  setMainTab: (tab: 'overview' | 'history') => void
  setIsFormOpen: (open: boolean) => void
  setIsSettingsOpen: (open: boolean) => void
  setIsRecurringOpen: (open: boolean) => void
}

export default function BottomNavigation({
  mainTab,
  setMainTab,
  setIsFormOpen,
  setIsSettingsOpen,
  setIsRecurringOpen
}: BottomNavigationProps) {
  return (
    <>
      {/* Mobile: Solid Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#020617] border-t border-white/5 px-4 py-4 flex items-center justify-around backdrop-blur-xl">
        <button 
          onClick={() => setMainTab('overview')}
          className={`flex flex-col items-center gap-1 transition-all ${mainTab === 'overview' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <LayoutGrid size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => setIsRecurringOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <Calendar size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Fixos</span>
        </button>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl -mt-10 border-4 border-[#020617] transform active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
        <button 
          onClick={() => setMainTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${mainTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Receipt size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <User size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
        </button>
      </div>
    </>
  )
}
