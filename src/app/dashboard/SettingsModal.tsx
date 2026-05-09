'use client'
import { X, Wallet, Users, Settings, LogOut, ShieldCheck, Mail, User, CheckCircle2, ChevronRight, Camera, Bell, Shield, ArrowUpRight, HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface SettingsModalProps {
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  settingsTab: 'budget' | 'family' | 'account'
  setSettingsTab: (tab: 'budget' | 'family' | 'account') => void
  localCurrency: string
  setLocalCurrency: (c: string) => void
  CATEGORIES: string[]
  categoryBudgets: any[]
  updateCategoryBudget: (hId: string, cat: string, val: number) => Promise<any>
  setCategoryBudgets: (cb: any) => void
  householdId: string
  currency: string
  members: any[]
  userEmail: string | undefined
  handleInvite: (e: React.FormEvent<HTMLFormElement>) => void
  handleSignOut: () => void
  displayName: string
  handleUpdateProfile: (name: string) => void
  supabase: any
}

export default function SettingsModal({
  isSettingsOpen,
  setIsSettingsOpen,
  settingsTab,
  setSettingsTab,
  localCurrency,
  setLocalCurrency,
  CATEGORIES,
  categoryBudgets,
  updateCategoryBudget,
  setCategoryBudgets,
  householdId,
  currency,
  members,
  userEmail,
  handleInvite,
  handleSignOut,
  displayName,
  handleUpdateProfile,
  supabase
}: SettingsModalProps) {
  const [userName, setUserName] = useState(displayName)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSendingSupport, setIsSendingSupport] = useState(false)

  if (!isSettingsOpen) return null

  const safeEmail = userEmail || 'usuário@dividi.com'

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.")
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) alert("Erro: " + error.message)
    else {
      alert("Senha atualizada com sucesso! Por segurança, você pode ser solicitado a logar novamente.")
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingSupport(true)
    // Simulação de envio - no futuro o usuário dirá o e-mail
    setTimeout(() => {
      alert("Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.")
      setSupportMessage('')
      setSettingsTab('account')
      setIsSendingSupport(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[300] flex items-center justify-center md:p-8" onClick={() => setIsSettingsOpen(false)}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-slate-900 md:rounded-[3rem] shadow-2xl w-full max-w-5xl border-white/10 overflow-hidden flex flex-col md:flex-row h-full md:h-[85vh]"
      >
        
        {/* Sidebar / Mobile Tabs */}
        <div className="w-full md:w-72 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-8 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3 md:mb-12">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white">
              <Settings size={18} />
            </div>
            <h3 className="font-black text-white text-sm md:text-xl uppercase tracking-tighter">Ajustes</h3>
          </div>
 
          <nav className="flex md:flex-col gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'budget', label: 'Orçamento', icon: <Wallet size={16} /> },
              { id: 'family', label: 'Família', icon: <Users size={16} /> },
              { id: 'account', label: 'Perfil', icon: <User size={16} /> }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setSettingsTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest whitespace-nowrap ${settingsTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
 
          <button onClick={handleSignOut} className="flex md:w-full items-center gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all md:mt-8">
            <LogOut size={16} /> <span className="hidden md:inline">Sair</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto scrollbar-hide relative">
          <button 
            type="button" 
            onClick={() => setIsSettingsOpen(false)} 
            className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl text-slate-500 transition-all"
          >
             <X size={20} />
          </button>

          {settingsTab === 'budget' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl">
              <header className="mb-12">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Financeiro</p>
                <h4 className="font-black text-white text-3xl tracking-tighter mb-4 uppercase">Configurações de Fluxo</h4>
              </header>

              <div className="space-y-10">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Moeda do Sistema</label>
                  <select 
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl font-black text-white focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dólar Americano (US$)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CATEGORIES.map(cat => {
                    const budget = categoryBudgets.find(b => b.category === cat)
                    return (
                      <div key={cat} className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <span className="font-black text-slate-500 text-[9px] uppercase tracking-widest block mb-3">{cat}</span>
                        <div className="flex items-center">
                          <span className="text-lg font-black text-slate-600 mr-2">{currency}</span>
                          <input 
                            type="number" 
                            defaultValue={budget?.monthly_limit || ''}
                            onBlur={(e) => updateCategoryBudget(householdId, cat, parseFloat(e.target.value))}
                            className="w-full bg-transparent font-black text-xl text-white focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'family' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl">
              <header className="mb-12">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Social</p>
                <h4 className="font-black text-white text-3xl tracking-tighter mb-4 uppercase">Gestão de Membros</h4>
              </header>

              <form onSubmit={handleInvite} className="mb-12">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="Convidar por e-mail..." 
                    className="flex-1 p-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">
                    Enviar Convite
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.user_id} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">{member.email}</p>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Membro Ativo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 max-w-2xl">
               <header className="mb-12">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Conta</p>
                  <h4 className="font-black text-white text-3xl tracking-tighter mb-4 uppercase italic">Meu Perfil</h4>
                </header>

                <div className="space-y-8">
                   {!isChangingPassword ? (
                      <>
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-10 bg-white/5 rounded-[3rem] border border-white/5 relative group">
                           <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
                           <div className="relative">
                             <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center font-black text-white text-4xl shadow-2xl ring-4 ring-white/5">
                               {userName.charAt(0).toUpperCase()}
                             </div>
                             <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                               <Camera size={18} />
                             </button>
                           </div>
                           <div className="flex-1 text-center sm:text-left">
                             <input 
                               type="text" 
                               value={userName}
                               onChange={(e) => setUserName(e.target.value)}
                               className="bg-transparent font-black text-4xl text-white border-b-2 border-transparent focus:border-indigo-500 outline-none w-full italic mb-2"
                               placeholder="Seu Nome"
                             />
                             <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500">
                               <Mail size={12} />
                               <p className="font-bold text-xs uppercase tracking-widest">{safeEmail}</p>
                             </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <button onClick={() => setIsChangingPassword(true)} className="w-full flex items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 transition-all text-slate-400 hover:text-white group relative overflow-hidden text-left">
                              <div className="relative z-10 flex flex-col items-start gap-2">
                                 <ShieldCheck size={20} className="text-indigo-400" />
                                 <span className="font-black text-[10px] uppercase tracking-widest">Segurança & Senha</span>
                              </div>
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </button>

                           <button onClick={() => setSettingsTab('support')} className="w-full flex items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 transition-all text-slate-400 hover:text-white group relative overflow-hidden text-left">
                              <div className="relative z-10 flex flex-col items-start gap-2">
                                 <HelpCircle size={20} className="text-indigo-400" />
                                 <span className="font-black text-[10px] uppercase tracking-widest">Ajuda & Suporte</span>
                              </div>
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                      </>
                   ) : (
                      <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                         <button 
                           onClick={() => setIsChangingPassword(false)}
                           className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
                         >
                            <ChevronRight size={16} className="rotate-180" /> Voltar ao Perfil
                         </button>

                         <div className="bg-white/5 p-10 rounded-[3rem] border border-indigo-500/20 space-y-8">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                  <Shield size={24} />
                               </div>
                               <div>
                                  <h5 className="font-black text-white text-xl uppercase tracking-tight italic">Atualizar Segurança</h5>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proteja sua conta com uma senha forte</p>
                               </div>
                            </div>

                            <div className="space-y-6">
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
                                  <div className="relative">
                                     <ShieldCheck size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                     <input 
                                       type="password" 
                                       value={newPassword}
                                       onChange={(e) => setNewPassword(e.target.value)}
                                       className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                                       placeholder="Mínimo 6 caracteres"
                                     />
                                  </div>
                               </div>

                               <div className="space-y-3">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                                  <div className="relative">
                                     <ShieldCheck size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                     <input 
                                       type="password" 
                                       value={confirmPassword}
                                       onChange={(e) => setConfirmPassword(e.target.value)}
                                       className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                                       placeholder="Repita a nova senha"
                                     />
                                  </div>
                               </div>

                               <button 
                                 onClick={handlePasswordUpdate}
                                 className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[2rem] transition-all uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-600/20"
                               >
                                  ATUALIZAR SENHA AGORA
                               </button>
                            </div>
                         </div>
                      </div>
                   )}

                   {!isChangingPassword && (
                     <button 
                       onClick={() => handleUpdateProfile(userName)}
                       className="w-full py-6 bg-white text-indigo-950 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                        Salvar Alterações do Perfil
                     </button>
                   )}
                </div>
            </div>
          )}

          {settingsTab === ('support' as any) && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl">
               <header className="mb-12 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-2">Ajuda</p>
                    <h4 className="font-black text-white text-3xl tracking-tighter mb-4 uppercase italic">Central de Suporte</h4>
                  </div>
                  <button 
                    onClick={() => setSettingsTab('account')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-[9px] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl"
                  >
                     <ChevronRight size={14} className="rotate-180" /> Voltar
                  </button>
                </header>

                <form onSubmit={handleSupportSubmit} className="space-y-6">
                   <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Como podemos ajudar?</label>
                         <textarea 
                           required
                           value={supportMessage}
                           onChange={(e) => setSupportMessage(e.target.value)}
                           className="w-full bg-slate-950 border border-white/10 rounded-[2rem] p-8 text-white text-sm font-bold outline-none focus:border-amber-500 min-h-[180px] transition-all scrollbar-hide"
                           placeholder="Descreva seu problema, sugestão ou feedback detalhadamente..."
                         />
                      </div>
                      <button 
                        disabled={isSendingSupport}
                        type="submit" 
                        className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-[2rem] transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
                      >
                         {isSendingSupport ? (
                           <>
                             <div className="w-5 h-5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin"></div>
                             PROCESSANDO...
                           </>
                         ) : (
                           <>
                             ENVIAR SOLICITAÇÃO <ArrowUpRight size={16} />
                           </>
                         )}
                      </button>
                   </div>

                   <div className="p-8 bg-indigo-600/10 border border-indigo-600/20 rounded-[2.5rem] flex items-start gap-4">
                      <HelpCircle className="text-indigo-400 shrink-0" size={20} />
                      <p className="text-[11px] font-bold text-indigo-300 leading-relaxed uppercase tracking-tight">
                         Nossa equipe de especialistas revisa todos os chamados em até 24h úteis. Você receberá uma cópia da resposta no seu e-mail cadastrado ({safeEmail}).
                      </p>
                   </div>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
