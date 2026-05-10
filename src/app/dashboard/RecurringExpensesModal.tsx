'use client'
import { X, Receipt, Settings, Repeat, Edit2, Trash2, Calendar, DollarSign, Type, Tag, User } from 'lucide-react'

interface RecurringExpensesModalProps {
  isRecurringOpen: boolean
  setIsRecurringOpen: (open: boolean) => void
  recurringTab: 'launch' | 'manage'
  setRecurringTab: (tab: 'launch' | 'manage') => void
  recurringExpenses: any[]
  recurringToEdit: any
  setRecurringToEdit: (exp: any) => void
  recurringDate: string
  setRecurringDate: (date: string) => void
  handleApplyRecurring: (id?: string, specificDate?: string) => void
  handleAddRecurring: (e: React.FormEvent<HTMLFormElement>) => void
  handleDeleteRecurring: (id: string) => void
  formatMoney: (v: number) => string
  CATEGORIES: string[]
  isPending: boolean
  members: any[]
}

export default function RecurringExpensesModal({
  isRecurringOpen,
  setIsRecurringOpen,
  recurringTab,
  setRecurringTab,
  recurringExpenses,
  recurringToEdit,
  setRecurringToEdit,
  recurringDate,
  setRecurringDate,
  handleApplyRecurring,
  handleAddRecurring,
  handleDeleteRecurring,
  formatMoney,
  CATEGORIES,
  isPending,
  members
}: RecurringExpensesModalProps) {
  if (!isRecurringOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => setIsRecurringOpen(false)}>
      <div className="glass-morphism p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-black text-3xl text-white tracking-tighter uppercase">Contas Fixas</h3>
            <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-80">Gerenciamento de Despesas Mensais Recorrentes</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsRecurringOpen(false)} 
            className="p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-slate-400 transition-all group"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Seletor de Abas Premium */}
        <div className="flex gap-2 bg-white/5 p-2 rounded-3xl mb-10 border border-white/5">
          <button 
            onClick={() => setRecurringTab('launch')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${recurringTab === 'launch' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Receipt size={16} />
            Pagar / Lançar
          </button>
          <button 
            onClick={() => setRecurringTab('manage')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${recurringTab === 'manage' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={16} />
            Configurar Modelos
          </button>
        </div>

        {recurringTab === 'launch' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-4 mb-12">
              {recurringExpenses.length === 0 ? (
                <div className="text-center py-20 px-6 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
                  <p className="text-slate-400 font-bold text-lg mb-6 italic opacity-60">Nenhum gasto fixo cadastrado.</p>
                  <button 
                    onClick={() => setRecurringTab('manage')} 
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
                  >
                    Configurar Primeiro Modelo
                  </button>
                </div>
              ) : (
                recurringExpenses.map(req => (
                  <div key={req.id} className="group glass-card p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-white text-xl tracking-tight leading-tight">{req.description}</p>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-lg uppercase tracking-widest border border-indigo-500/20">{req.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pagador: <span className="text-slate-300">{req.payer}</span></p>
                    </div>

                    <div className="flex flex-wrap items-end lg:items-center gap-6">
                      <div className="flex flex-col">
                        <p className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest text-center">Valor Base</p>
                        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 min-w-[120px] text-center">
                          <p className="font-black text-white text-lg tracking-tight">{formatMoney(Number(req.amount))}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <p className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest text-center">Data</p>
                        <input 
                          type="date" 
                          id={`date-${req.id}`}
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="p-3 text-sm border border-white/10 rounded-2xl bg-white/5 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <button 
                        onClick={() => {
                          const dateVal = (document.getElementById(`date-${req.id}`) as HTMLInputElement).value
                          handleApplyRecurring(req.id, dateVal)
                        }} 
                        className="bg-emerald-500 text-white hover:bg-emerald-400 px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 group/btn active:scale-95"
                      >
                        <Repeat size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                        <span className="text-xs font-black uppercase tracking-widest">Lançar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {recurringExpenses.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                
                <div className="relative z-10 text-center md:text-left">
                  <h4 className="font-black text-white uppercase text-xl tracking-widest mb-2">Lançamento em Lote</h4>
                  <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest">Processar todas as contas fixas agora</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative z-10">
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-[9px] font-black text-indigo-200 uppercase tracking-widest ml-1">Data Global</label>
                    <input 
                      type="date" 
                      value={recurringDate}
                      onChange={(e) => setRecurringDate(e.target.value)}
                      className="p-4 text-sm border-none rounded-2xl bg-white/10 text-white font-black outline-none focus:ring-4 focus:ring-white/20 backdrop-blur-xl shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={() => handleApplyRecurring()} 
                    disabled={isPending}
                    className="w-full md:w-auto bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black shadow-xl hover:shadow-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 whitespace-nowrap"
                  >
                    <Repeat size={20} className={isPending ? "animate-spin" : ""} /> 
                    <span className="text-xs uppercase tracking-widest">Pagar Todas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 pb-10">
            <form 
              onSubmit={handleAddRecurring} 
              className={`p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 shadow-inner ${recurringToEdit ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-white/10'}`}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h4 className="font-black text-white uppercase text-lg tracking-tighter">{recurringToEdit ? 'Editando Modelo' : 'Novo Gasto Fixo'}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest opacity-80">Configuração de Gasto Recorrente</p>
                </div>
                {recurringToEdit && (
                  <button 
                    type="button" 
                    onClick={() => setRecurringToEdit(null)} 
                    className="bg-white/5 px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all uppercase tracking-widest border border-white/10 active:scale-95"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                    <Type size={12} className="text-indigo-400" /> Descrição
                  </label>
                  <input 
                    type="text" 
                    name="description" 
                    required 
                    defaultValue={recurringToEdit?.description || ''} 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all" 
                    placeholder="Ex: Aluguel" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                      <DollarSign size={12} className="text-emerald-400" /> Valor
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="amount" 
                      required 
                      defaultValue={recurringToEdit?.amount || ''} 
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all" 
                      placeholder="0,00" 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                      <User size={12} className="text-indigo-400" /> Pagador
                    </label>
                    <select 
                      name="payer" 
                      defaultValue={recurringToEdit?.payer || (members[0]?.display_name || members[0]?.email?.split('@')[0])} 
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {members.map(m => {
                        const name = m.display_name || m.email.split('@')[0]
                        return <option key={m.user_id} value={name} className="bg-slate-900">{name}</option>
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-[0.2em] ml-1">
                      <Tag size={12} className="text-indigo-400" /> Categoria
                    </label>
                    <select 
                      name="category" 
                      defaultValue={recurringToEdit?.category || 'Contas'} 
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full p-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  {recurringToEdit ? 'Atualizar Modelo' : 'Salvar Modelo Fixo'}
                </button>
              </div>
            </form>

            <div className="pt-4">
              <h4 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.4em] mb-10 text-center opacity-60">Modelos Cadastrados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recurringExpenses.map(req => (
                  <div key={req.id} className="p-6 glass-card rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div>
                      <p className="font-black text-white text-xl tracking-tight leading-tight mb-1">{req.description}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{formatMoney(Number(req.amount))} • {req.payer}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setRecurringToEdit(req)} className="p-3 bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-2xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteRecurring(req.id)} className="p-3 bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
