'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Zap, LayoutGrid, Receipt, Calendar, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from './dashboard/components/Logo'

export default function Home() {
  const features = [
    {
      icon: <Users className="text-indigo-400" size={24} />,
      title: "Sincronização em Tempo Real",
      description: "Compartilhe despesas instantaneamente com seu parceiro ou colegas de casa."
    },
    {
      icon: <LayoutGrid className="text-emerald-400" size={24} />,
      title: "Categorização Inteligente",
      description: "Organize seus gastos automaticamente por categorias personalizadas."
    },
    {
      icon: <TrendingUp className="text-purple-400" size={24} />,
      title: "Radar Estratégico",
      description: "Insights em tempo real sobre a saúde financeira do seu lar."
    }
  ]

  const eliteFeatures = [
    "Exportação para Excel/CSV",
    "Gestão de Contas Fixas",
    "Relatórios Mensais Detalhados",
    "Suporte Prioritário Elite",
    "Multi-usuários Ilimitados",
    "Backup na Nuvem Criptografado"
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Background Decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
            Entrar
          </Link>
          <Link href="/login" className="px-8 py-3 bg-white text-indigo-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
            Começar Grátis
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Dividi Elite Edition 2026</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase">
              O Controle <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Total do seu</span> <br />
              Fluxo.
            </h1>
            
            <p className="text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              Diga adeus às planilhas complexas. Dividi é a plataforma definitiva para casais e residências que buscam transparência financeira total.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login?mode=signup" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 group">
                Criar Conta Agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={20} className="text-emerald-500" />
                Segurança Nível Bancário
              </div>
            </div>

            <div className="flex items-center gap-6 pt-10">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-black overflow-hidden relative">
                    <Image 
                      src={`https://i.pravatar.cc/100?u=${i}`} 
                      alt="User avatar" 
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-white">+5.000</span> usuários economizando hoje
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative glass-card rounded-[3rem] p-4 overflow-hidden shadow-2xl">
              <Image 
                src="/app-mockup.png" 
                alt="Dividi App Interface" 
                width={800}
                height={600}
                priority
                className="w-full h-auto rounded-[2.2rem] shadow-2xl border border-white/5"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform md:hidden">
                 <Zap size={32} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white/[0.02] border-y border-white/5 py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Funcionalidades</h2>
              <p className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Engenharia Financeira Pro</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="glass-card p-10 rounded-[2.5rem] group hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight italic">{f.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elite Advantage */}
        <section className="max-w-7xl mx-auto px-6 py-40">
           <div className="glass-card rounded-[4rem] overflow-hidden grid lg:grid-cols-2">
              <div className="p-16 md:p-24 space-y-10">
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Upgrade para a <br />
                    <span className="text-indigo-400">Elite Edition.</span>
                 </h2>
                 <p className="text-lg text-slate-300 font-medium">
                    A versão mais poderosa do Dividi, projetada para quem leva a gestão doméstica a sério. Recursos que automatizam o que importa.
                 </p>
                 <ul className="grid sm:grid-cols-2 gap-6">
                    {eliteFeatures.map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
                 <div className="pt-6">
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-4 px-12 py-5 bg-white text-indigo-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-colors shadow-2xl shadow-white/5">
                       Garantir Acesso Elite
                    </Link>
                 </div>
              </div>
              <div className="bg-indigo-600/10 relative flex items-center justify-center p-12 overflow-hidden border-l border-white/5">
                 <div className="absolute w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                 <div className="relative grid grid-cols-2 gap-4 w-full animate-float">
                    <div className="space-y-4">
                       <div className="h-32 glass-card rounded-3xl p-6 flex flex-col justify-end">
                          <Download size={24} className="text-indigo-400 mb-2" />
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[80%] h-full bg-indigo-500"></div>
                          </div>
                       </div>
                       <div className="h-48 glass-card rounded-3xl p-6 flex flex-col justify-between">
                          <Receipt size={24} className="text-emerald-400" />
                          <div className="space-y-2">
                             <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                             <div className="w-[60%] h-1.5 bg-white/5 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-12">
                       <div className="h-48 glass-card rounded-3xl p-6 flex flex-col justify-between">
                          <Calendar size={24} className="text-purple-400" />
                          <div className="grid grid-cols-4 gap-2">
                             {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-white/5 rounded-md"></div>)}
                          </div>
                       </div>
                       <div className="h-32 glass-card rounded-3xl p-6 flex flex-col justify-center items-center">
                          <Zap size={24} className="text-amber-400" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-40 text-center space-y-12">
           <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
              Pronto para ter o <br />
              Controle?
           </h2>
           <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
              Junte-se a milhares de pessoas que transformaram sua relação com o dinheiro.
           </p>
           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login?mode=signup" className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all active:scale-95">
                 Criar Minha Conta Grátis
              </Link>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem cartão de crédito necessário</span>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo size="small" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            © 2026 Dividi Inc. Desenvolvido por Avante Digital.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Termos</a>
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Privacidade</a>
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
