'use client'
import { X, Calendar, DollarSign, Tag, Type } from 'lucide-react'

interface ExpenseModalProps {
  isFormOpen: boolean
  setIsFormOpen: (open: boolean) => void
  expenseToEdit: any
  setExpenseToEdit: (exp: any) => void
  handleAddExpense: (e: React.FormEvent<HTMLFormElement>) => void
  householdId: string
  currency: string
  CATEGORIES: string[]
  isPending: boolean
  members: any[]
}

export default function ExpenseModal({
  isFormOpen,
  setIsFormOpen,
  expenseToEdit,
  setExpenseToEdit,
  handleAddExpense,
  householdId,
  currency,
  CATEGORIES,
  isPending,
  members
}: ExpenseModalProps) {
  if (!isFormOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }}>
      <form 
        id="expenseForm" 
        onSubmit={handleAddExpense} 
        onClick={(e) => e.stopPropagation()} 
        className="glass-morphism p-8 md:p-10 rounded-[2.5rem] w-full max-w-xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-black text-3xl text-white tracking-tighter">{expenseToEdit ? 'Editar Gasto' : 'Novo Gasto'}</h3>
            <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-80">Registro de Despesa Compartilhada</p>
          </div>
          <button 
            type="button" 
            onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }} 
            className="p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-slate-400 transition-all group"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        <input type="hidden" name="household_id" value={householdId} />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                <Calendar size={12} className="text-indigo-400" /> Data
              </label>
              <input 
                type="date" 
                name="date" 
                required 
                defaultValue={expenseToEdit?.date || new Date().toISOString().split('T')[0]} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all" 
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
                  defaultValue={expenseToEdit?.amount || ''} 
                  className="w-full p-4 pl-16 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all text-xl" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">Quem pagou?</label>
            <div className="flex flex-wrap gap-3">
              {members.map((m, idx) => {
                const name = m.display_name || m.email.split('@')[0]
                const colors = [
                  'peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-400',
                  'peer-checked:border-rose-500 peer-checked:bg-rose-500/10 peer-checked:text-rose-400',
                  'peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400',
                  'peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-400'
                ]
                const colorClass = colors[idx % colors.length]
                
                return (
                  <label key={m.user_id} className="flex-1 min-w-[100px] group cursor-pointer">
                    <input type="radio" name="payer" value={name} className="peer hidden" required defaultChecked={expenseToEdit?.payer === name} /> 
                    <div className={`flex items-center justify-center p-4 border border-white/10 bg-white/5 rounded-2xl ${colorClass} text-slate-400 font-black transition-all hover:bg-white/10 text-xs uppercase tracking-widest`}>
                      {name}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
              <Type size={12} className="text-indigo-400" /> Descrição
            </label>
            <input 
              type="text" 
              name="description" 
              placeholder="Ex: Mercado Semanal" 
              defaultValue={expenseToEdit?.description || ''} 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
              <Tag size={12} className="text-indigo-400" /> Categoria
            </label>
            <select 
              name="category" 
              defaultValue={expenseToEdit?.category || 'Outros'} 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => { setIsFormOpen(false); setExpenseToEdit(null) }} 
              className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 p-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : expenseToEdit ? 'Salvar Alterações' : 'Lançar Gasto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
