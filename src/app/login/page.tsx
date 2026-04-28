'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { login, signup, resetPassword } from './actions'
import Image from 'next/image'
import { Suspense } from 'react'

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
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  // Se houver uma mensagem de erro/sucesso, podemos querer focar nela
  useEffect(() => {
    if (message?.includes('cadastro')) setMode('signup')
    if (message?.includes('recuperação')) setMode('reset')
  }, [message])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] p-4 relative overflow-hidden font-sans">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl">
            <div className="w-full h-full bg-[#111114] rounded-[14px] flex items-center justify-center overflow-hidden">
              <Image src="/icon.png" alt="Dividi Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Dividi</h1>
          <p className="text-slate-400 text-sm font-medium">
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'signup' && 'Comece sua jornada hoje.'}
            {mode === 'reset' && 'Não se preocupe, acontece.'}
          </p>
        </div>

        {/* Card com Transição Suave */}
        <div className="bg-[#16161a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl transition-all duration-500">
          
          {/* Seletor de Modo (Apenas para Login/Cadastro) */}
          {mode !== 'reset' && (
            <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Cadastrar
              </button>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl text-center">
              {message}
            </div>
          )}

          <form className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Senha
                    </label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        Esqueceu?
                      </button>
                    )}
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              {mode === 'login' && (
                <SubmitButton
                  formAction={login}
                  text="Acessar Minha Conta"
                  loadingText="Entrando..."
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
                />
              )}

              {mode === 'signup' && (
                <SubmitButton
                  formAction={signup}
                  text="Criar Cadastro Grátis"
                  loadingText="Criando Conta..."
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all duration-200"
                />
              )}

              {mode === 'reset' && (
                <div className="space-y-3">
                  <SubmitButton
                    formAction={resetPassword}
                    text="Enviar Link de Recuperação"
                    loadingText="Enviando..."
                    className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold rounded-xl active:scale-[0.98] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors"
                  >
                    Voltar para o Login
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs font-medium">
          Ao continuar, você concorda com nossos termos.
        </p>
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
