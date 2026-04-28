'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { login, signup, resetPassword } from './actions'
import Image from 'next/image'
import { Suspense } from 'react'
import { Eye, EyeOff, ShieldCheck, Lock, Mail, CheckCircle2 } from 'lucide-react'

type Mode = 'login' | 'signup' | 'reset'

function SubmitButton({ text, loadingText, className, formAction }: { text: string, loadingText: string, className: string, formAction?: any }) {
  const { pending } = useFormStatus()
  
  return (
    <button
      formAction={formAction}
      disabled={pending}
      className={`${className} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {pending && (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {pending ? loadingText : text}
    </button>
  )
}

function LoginContent() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const initialMode = searchParams.get('mode') as Mode

  // Se houver uma mensagem de erro/sucesso ou modo inicial na URL
  useEffect(() => {
    if (initialMode) setMode(initialMode)
  }, [initialMode])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060608] p-4 relative overflow-hidden font-sans">
      {/* Background Decorativo - Blindagem Visual */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        {/* Logo e Badge de Segurança */}
        <div className="text-center mb-6">
          <div className="relative inline-flex mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl">
              <div className="w-full h-full bg-[#0d0d10] rounded-[22px] flex items-center justify-center overflow-hidden">
                <Image src="/icon.png" alt="Dividi Logo" width={56} height={56} className="object-contain" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-4 border-[#060608]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">Dividi</h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <Lock size={12} className="text-emerald-500/70" />
            <span>Conexão Criptografada</span>
          </div>
        </div>

        {/* Card Pro */}
        <div className="bg-[#111114]/90 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-3xl transition-all duration-500 ring-1 ring-white/5">
          
          {/* Seletor de Modo */}
          {mode !== 'reset' && (
            <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5 shadow-inner">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                LOGIN
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 ${mode === 'signup' ? 'bg-purple-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                CADASTRO
              </button>
            </div>
          )}

          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 leading-relaxed animate-in fade-in duration-300 ${message.includes('Erro') || message.includes('Segurança') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              <div className="mt-0.5 shrink-0">
                {message.includes('Erro') ? '⚠️' : '✅'}
              </div>
              {message}
            </div>
          )}

          <form className="space-y-6">
            <div className="space-y-5">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  <Mail size={12} className="text-indigo-500" />
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Campo Senha */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <Lock size={12} className="text-indigo-500" />
                      Senha de Acesso
                    </label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-wider transition-colors"
                      >
                        Recuperar?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? "current-password" : "new-password"}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium pr-12"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Campo Confirmar Senha (Apenas Cadastro) */}
              {mode === 'signup' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    <CheckCircle2 size={12} className="text-purple-500" />
                    Confirmar Senha
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 font-medium"
                    placeholder="Repita sua senha"
                  />
                </div>
              )}

              {/* Checkbox Termos (Apenas Cadastro) */}
              {mode === 'signup' && (
                <div className="flex items-center gap-3 px-1 animate-in fade-in duration-500 pt-2">
                  <label className="relative flex items-center cursor-pointer">
                    <input type="checkbox" name="terms" required className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-white/10 rounded-md bg-black/40 peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all"></div>
                    <CheckCircle2 size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Li e aceito os <button type="button" onClick={() => setShowTerms(true)} className="text-purple-400 hover:underline">Termos e Condições</button>
                  </span>
                </div>
              )}
            </div>

            {/* Modal de Termos e Condições */}
            {showTerms && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-[#0d0d10]/95 border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(79,70,229,0.15)] max-h-[85vh] overflow-y-auto custom-scrollbar relative ring-1 ring-white/10">
                  <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#0d0d10]/50 backdrop-blur-md py-2 -mt-2 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <ShieldCheck size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Diretrizes & Segurança</h3>
                    </div>
                    <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-8 text-slate-400 text-base leading-relaxed">
                    <section className="space-y-3">
                      <p className="font-black text-indigo-400 text-xs uppercase tracking-[0.2em]">01. Compromisso de Transparência</p>
                      <h4 className="text-lg font-bold text-white">Aceitação dos Termos</h4>
                      <p>Ao utilizar a plataforma Dividi, você concorda plenamente com o compartilhamento de registros financeiros exclusivamente com os membros que você autorizar dentro da sua célula familiar (Household).</p>
                    </section>
                    
                    <section className="space-y-3">
                      <p className="font-black text-purple-400 text-xs uppercase tracking-[0.2em]">02. Blindagem de Dados</p>
                      <h4 className="text-lg font-bold text-white">Privacidade e Criptografia</h4>
                      <p>Sua segurança é nossa prioridade core. Todos os dados são protegidos por camadas de RLS (Row Level Security) do Supabase. Nós não processamos, vendemos ou compartilhamos seus dados com parceiros externos sob nenhuma circunstância.</p>
                    </section>
                    
                    <section className="space-y-3">
                      <p className="font-black text-emerald-400 text-xs uppercase tracking-[0.2em]">03. Integridade das Informações</p>
                      <h4 className="text-lg font-bold text-white">Responsabilidade do Usuário</h4>
                      <p>O Dividi atua como uma ferramenta de organização. A precisão dos dados inseridos é de responsabilidade do usuário, assim como as decisões financeiras derivadas destas informações.</p>
                    </section>

                    <section className="space-y-3">
                      <p className="font-black text-indigo-400 text-xs uppercase tracking-[0.2em]">04. Continuidade do Serviço</p>
                      <h4 className="text-lg font-bold text-white">Uso Ético e Lícito</h4>
                      <p>Reservamos o direito de suspender acessos que violem a integridade do sistema ou tentem burlar as proteções de criptografia implementadas.</p>
                    </section>
                  </div>
                  <div className="mt-12 sticky bottom-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10] to-transparent pt-6 pb-2">
                    <button 
                      type="button"
                      onClick={() => setShowTerms(false)}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 tracking-widest uppercase text-xs active:scale-[0.98]"
                    >
                      LI E ESTOU DE ACORDO
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              {mode === 'login' && (
                <SubmitButton
                  formAction={login}
                  text="LOGIN SEGURO"
                  loadingText="AUTENTICANDO..."
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[1.25rem] shadow-2xl shadow-indigo-600/40 active:scale-[0.98] transition-all duration-300 tracking-[0.1em]"
                />
              )}

              {mode === 'signup' && (
                <SubmitButton
                  formAction={signup}
                  text="CRIAR MINHA CONTA"
                  loadingText="PROCESSANDO..."
                  className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-[1.25rem] shadow-2xl shadow-purple-600/40 active:scale-[0.98] transition-all duration-300 tracking-[0.1em]"
                />
              )}

              {mode === 'reset' && (
                <div className="space-y-4">
                  <SubmitButton
                    formAction={resetPassword}
                    text="RECUPERAR ACESSO"
                    loadingText="ENVIANDO..."
                    className="w-full py-5 bg-slate-100 text-slate-900 font-black rounded-[1.25rem] active:scale-[0.98] transition-all duration-300 tracking-[0.1em]"
                  />
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-2 text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Voltar ao Login
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-slate-800"></span>
            Dividi Security Core v2.0
            <span className="w-8 h-px bg-slate-800"></span>
          </p>
        </div>
      </div>
    </div>
  )
}



export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
