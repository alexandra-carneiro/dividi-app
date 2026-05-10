'use client'
import { X, UserPlus, Mail } from 'lucide-react'

interface InviteModalProps {
  isInviteOpen: boolean
  setIsInviteOpen: (open: boolean) => void
  handleInvite: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function InviteModal({
  isInviteOpen,
  setIsInviteOpen,
  handleInvite
}: InviteModalProps) {
  if (!isInviteOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => setIsInviteOpen(false)}>
      <form 
        onSubmit={handleInvite} 
        onClick={(e) => e.stopPropagation()} 
        className="glass-morphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 relative border border-white/5"
      >
        <div className="relative mb-8 text-center">
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5 transform -rotate-3">
            <UserPlus size={40} />
          </div>
          <h3 className="font-black text-3xl text-white tracking-tighter">Convidar para a Casa</h3>
          <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-80">Compartilhar Gestão Financeira</p>
          <button 
            type="button" 
            onClick={() => setIsInviteOpen(false)} 
            className="absolute -top-2 -right-2 p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-slate-400 transition-all group"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        <p className="text-slate-400 font-bold text-sm mb-8 text-center leading-relaxed">Insira o e-mail da pessoa que você deseja convidar para visualizar e gerenciar estes dados junto com você.</p>
        
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-widest ml-1">
              <Mail size={12} className="text-indigo-400" /> E-mail do convidado
            </label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="email@exemplo.com" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all" 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsInviteOpen(false)} 
              className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 p-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-95"
            >
              Enviar Convite
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
