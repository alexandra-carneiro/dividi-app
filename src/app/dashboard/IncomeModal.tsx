'use client'
import { X, TrendingUp, Calendar, DollarSign, Type } from 'lucide-react'

interface IncomeModalProps {
  isIncomeFormOpen: boolean
  setIsIncomeFormOpen: (open: boolean) => void
  incomeToEdit: any
  setIncomeToEdit: (income: any) => void
  handleAddIncome: (e: React.FormEvent<HTMLFormElement>) => void
  householdId: string
  currency: string
  isPending: boolean
  members: any[]
}

export default function IncomeModal({
  isIncomeFormOpen,
  setIsIncomeFormOpen,
  incomeToEdit,
  setIncomeToEdit,
  handleAddIncome,
  householdId,
  currency,
  isPending,
  members
}: IncomeModalProps) {
  if (!isIncomeFormOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }}>
      <form 
        onSubmit={handleAddIncome} 
        onClick={(e) => e.stopPropagation()} 
        className="glass-morphism p-8 md:p-10 rounded-[2.5rem] w-full max-w-xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl"
      >
        <div className="relative mb-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-emerald-500/20 transform -rotate-3">
            <TrendingUp size={40} />
          </div>
          <h3 className="font-black text-3xl text-white tracking-tighter">{incomeToEdit ? 'Editar Receita' : 'Nova Receita'}</h3>
          <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-80">Lançamento de Entrada de Capital</p>
          <button 
            type="button" 
            onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }} 
            className="absolute -top-2 -right-2 p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-slate-400 transition-all group"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        <input type="hidden" name="household_id" value={householdId} />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                <Calendar size={12} className="text-emerald-400" /> Data
              </label>
              <input 
                type="date" 
                name="date" 
                required 
                defaultValue={incomeToEdit?.date || new Date().toISOString().split('T')[0]} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-emerald-500 focus:bg-white/10 outline-none transition-all" 
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                <DollarSign size={12} className="text-emerald-400" /> Valor
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</span>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01" 
                  min="0.01" 
                  required 
                  placeholder="0,00" 
                  defaultValue={incomeToEdit?.amount || ''} 
                  className="w-full p-4 pl-16 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-emerald-500 focus:bg-white/10 outline-none transition-all text-xl" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">Quem recebeu?</label>
            <div className="flex flex-wrap gap-3">
              {members.map((m) => {
                const name = m.display_name || m.email.split('@')[0]
                return (
                  <label key={m.user_id} className="flex-1 min-w-[100px] group cursor-pointer">
                    <input type="radio" name="payer" value={name} className="peer hidden" required defaultChecked={incomeToEdit?.payer === name} /> 
                    <div className="flex items-center justify-center p-4 border border-white/10 bg-white/5 rounded-2xl peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 text-slate-400 font-black transition-all hover:bg-white/10 text-xs uppercase tracking-widest text-center">
                      {name}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
              <Type size={12} className="text-emerald-400" /> Descrição
            </label>
            <input 
              type="text" 
              name="description" 
              placeholder="Ex: Salário Mensal" 
              defaultValue={incomeToEdit?.description || ''} 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-emerald-500 focus:bg-white/10 outline-none transition-all" 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => { setIsIncomeFormOpen(false); setIncomeToEdit(null) }} 
              className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 p-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : incomeToEdit ? 'Atualizar' : 'Lançar Receita'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
