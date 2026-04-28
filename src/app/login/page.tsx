import { login, signup } from './actions'
import Image from 'next/image'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] p-4 relative overflow-hidden font-sans">
      {/* Background Decorativo - Gradientes Suaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10">
        {/* Logo e Cabeçalho */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/20">
            <div className="w-full h-full bg-[#111114] rounded-[14px] flex items-center justify-center overflow-hidden">
              <Image 
                src="/icon.png" 
                alt="Dividi Logo" 
                width={60} 
                height={60}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
            Dividi
          </h1>
          <p className="text-slate-400 font-medium">
            Gastos Compartilhados sem Complicação
          </p>
        </div>

        {/* Card de Login com Glassmorphism */}
        <div className="bg-[#16161a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {message && (
            <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm rounded-xl text-center leading-relaxed">
              {message}
            </div>
          )}

          <form className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 ml-1">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 ml-1">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                formAction={login}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
              >
                Entrar
              </button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#16161a] px-3 text-slate-500 font-bold tracking-widest">OU</span>
                </div>
              </div>

              <button
                formAction={signup}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl active:scale-[0.98] transition-all duration-200"
              >
                Criar Nova Conta
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Feito com ❤️ para facilitar suas contas.
        </p>
      </div>
    </div>
  )
}
