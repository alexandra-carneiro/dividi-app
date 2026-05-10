'use client'
import Link from 'next/link'
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
    { id: 'overview', label: 'Dashboard', icon: <LayoutGrid size={22} /> },
    { id: 'history', label: 'Histórico', icon: <Receipt size={22} /> },
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
          <Link
            key={item.id}
            href="#"
            onClick={(e) => { e.preventDefault(); setMainTab(item.id as any); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group ${
              mainTab === item.id 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`${mainTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
              {item.icon}
            </div>
            {item.label}
          </Link>
        ))}

        <div className="pt-10">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Ações Rápidas</p>
          <div className="space-y-2">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-[11px] uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Receipt size={16} />
              </div>
              Novo Gasto
            </button>
            <button 
              onClick={() => setIsRecurringOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-[11px] uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Calendar size={16} />
              </div>
              Contas Fixas
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-[11px] uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-white/5 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all">
                <Settings size={16} />
              </div>
              Ajustes
            </button>
          </div>
        </div>
      </nav>

      {/* Footer Area (Account & Settings) */}
      <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.01]">
        <button 
          onClick={handleSignOut}
          aria-label="Sair da conta"
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-[11px] uppercase tracking-widest group"
        >
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          Sair do App
        </button>
      </div>
    </aside>
  )
}
