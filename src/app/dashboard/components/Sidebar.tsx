'use client'
import { Plus, Receipt, LayoutGrid, LogOut, Settings, Calendar } from 'lucide-react'
import Logo from './Logo'

interface SidebarProps {
  mainTab: 'overview' | 'history'
  setMainTab: (tab: 'overview' | 'history') => void
  setIsFormOpen: (open: boolean) => void
  setIsSettingsOpen: (open: boolean) => void
  setIsRecurringOpen: (open: boolean) => void
  handleSignOut: () => void
}

export default function Sidebar({
  mainTab,
  setMainTab,
  setIsFormOpen,
  setIsSettingsOpen,
  setIsRecurringOpen,
  handleSignOut
}: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutGrid size={22} />, action: () => setMainTab('overview') },
    { id: 'history', label: 'Histórico', icon: <Receipt size={22} />, action: () => setMainTab('history') },
    { id: 'recurring', label: 'Contas Fixas', icon: <Calendar size={22} />, action: () => setIsRecurringOpen(true) },
  ]

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-80 bg-[#020617] border-r border-white/5 flex-col z-[250] shadow-2xl">
      {/* Branding Area */}
      <div className="p-10 mb-6">
        <Logo size="small" />
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 px-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${
              item.id === mainTab 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`${mainTab === item.id ? 'text-white' : 'text-slate-600 group-hover:text-white'} transition-colors`}>
              {item.icon}
            </div>
            {item.label}
          </button>
        ))}

        <div className="pt-10">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Ações Rápidas</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white text-indigo-950 font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            <div className="bg-indigo-600 rounded-lg p-1.5 text-white">
              <Plus size={18} />
            </div>
            Lançar Gasto
          </button>
        </div>
      </nav>

      {/* Footer Area (Account & Settings) */}
      <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.01]">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all font-black text-[11px] uppercase tracking-widest group"
        >
          <Settings size={22} className="group-hover:rotate-45 transition-transform" />
          Configurações
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[11px] uppercase tracking-widest mt-2"
        >
          <LogOut size={22} />
          Sair do App
        </button>
      </div>
    </aside>
  )
}
