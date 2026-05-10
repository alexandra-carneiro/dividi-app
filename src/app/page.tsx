'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Zap, LayoutGrid, Receipt, Calendar, Download, MousePointer2, Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from './dashboard/components/Logo'
import { useState } from 'react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: <Users className="text-indigo-400" size={24} />,
      title: "Membros Dinâmicos",
      description: "Adicione parceiros, colegas ou família. Sem nomes fixos, gestão 100% personalizada por casa."
    },
    {
      icon: <Download className="text-emerald-400" size={24} />,
      title: "Importação via IA",
      description: "Arraste sua planilha do banco e deixe nossa lógica de reconhecimento categorizar tudo em segundos."
    },
    {
      icon: <TrendingUp className="text-purple-400" size={24} />,
      title: "Radar de Balanço",
      description: "Saiba exatamente quem pagou o quê e quem deve a quem, com acerto de contas instantâneo."
    }
  ]

  const eliteFeatures = [
    "Reconhecimento Inteligente de Membros",
    "Gestão de Contas Fixas & Aluguéis",
    "Exportação para Excel/CSV Ilimitada",
    "Painel de Radar Financeiro 360°",
    "Membros da Casa Ilimitados",
    "Segurança Bancária de Ponta (RLS)"
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Background Decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-[100] max-w-7xl mx-auto px-6 py-6 md:py-8 flex justify-between items-center backdrop-blur-sm">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/login" className="text-sm font-black text-slate-300 hover:text-white transition-colors uppercase tracking-widest">
            Entrar
          </Link>
          <Link href="/login?mode=signup" className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">
            Começar Grátis
          </Link>
        </div>

        {/* Mobile Nav Button */}
        <button 
          className="md:hidden p-2 text-slate-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Abrir menu"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-[#020617] p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-12">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)} className="text-white">
              <Zap size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-8 text-center">
            <Link href="/login" className="text-2xl font-black text-white uppercase tracking-widest">Entrar</Link>
            <Link href="/login?mode=signup" className="px-8 py-6 bg-indigo-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl">Começar Grátis</Link>
          </div>
        </div>
      )}

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Dividi Elite Edition v2.0</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.1] italic uppercase pt-2">
                Finanças em <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Sintonia,</span> <br />
                Casa em <span className="text-white">Paz.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
                A plataforma definitiva para casais e residências compartilhadas. Divida gastos, planeje o futuro e tenha clareza total do seu fluxo financeiro.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link href="/login?mode=signup" className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 group">
                Criar Minha Casa <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-2 text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                <ShieldCheck size={24} className="text-emerald-500" />
                <span>Privacidade de <br /> Nível Bancário</span>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden relative shadow-lg">
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                      alt="User avatar" 
                      width={48}
                      height={48}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">+1.200 Residências</p>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gerindo finanças com transparência</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-[4rem] blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative glass-card rounded-[3rem] p-3 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] aspect-[1.4/1]">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent z-10 pointer-events-none"></div>
              <Image 
                src="/dashboard-mockup.png" 
                alt="Dividi Dashboard Elite Interface" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover rounded-[2.5rem] shadow-2xl"
              />
              <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Dashboard Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-slate-900/30 border-y border-white/5 py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Funcionalidades Reais</h2>
              <p className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[1.1] pt-2">Engenharia para o seu Lar</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="glass-card p-10 rounded-[2.5rem] group hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 border-white/5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600/20 group-hover:scale-110 transition-all duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight italic">{f.title}</h3>
                  <p className="text-slate-300 font-medium leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elite Advantage */}
        <section className="max-w-7xl mx-auto px-6 py-40">
           <div className="glass-card rounded-[4rem] overflow-hidden grid lg:grid-cols-2 border-white/10 shadow-2xl">
              <div className="p-10 md:p-24 space-y-12">
                 <div className="space-y-6">
                   <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-[1.1] pt-2">
                      Upgrade para a <br />
                      <span className="text-indigo-400">Elite Edition.</span>
                   </h2>
                   <p className="text-lg text-slate-300 font-medium leading-relaxed">
                      Projetada para casas que levam a gestão a sério. Automatize a importação, gerencie recorrências e visualize o balanço com o Radar Financeiro.
                   </p>
                 </div>
                 <ul className="grid sm:grid-cols-1 gap-5">
                    {eliteFeatures.map((item, i) => (
                       <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-200">
                          <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          </div>
                          {item}
                       </li>
                    ))}
                 </ul>
                 <div className="pt-4">
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-indigo-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                       Garantir Acesso Elite <ArrowRight size={18} />
                    </Link>
                 </div>
              </div>
              <div className="bg-[#020617] relative flex items-center justify-center p-12 overflow-hidden border-l border-white/5">
                 <div className="absolute inset-0 bg-indigo-600/5 blur-[120px]"></div>
                 <div className="relative w-full aspect-square max-w-md animate-float">
                    <div className="absolute inset-0 border-[20px] border-white/5 rounded-full"></div>
                    <div className="absolute inset-[10%] border border-white/10 rounded-full border-dashed animate-spin-slow"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                       <TrendingUp size={64} className="text-indigo-400 mb-4" />
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Radar Financeiro</span>
                    </div>
                    {/* Floating Indicators */}
                    <div className="absolute top-10 left-10 glass-card p-4 rounded-2xl animate-pulse">
                       <Receipt size={20} className="text-emerald-400" />
                    </div>
                    <div className="absolute bottom-20 right-5 glass-card p-4 rounded-2xl animate-pulse delay-700">
                       <Users size={20} className="text-purple-400" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-40 text-center space-y-16 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="space-y-6 relative">
             <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[1.1] pt-2">
                Pronto para ter o <br />
                <span className="text-indigo-400">Controle?</span>
             </h2>
             <p className="text-lg md:text-xl text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
                Junte-se a centenas de casas que transformaram sua relação com o dinheiro através do Dividi.
             </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative">
              <Link href="/login?mode=signup" className="px-14 py-7 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center gap-3">
                 CRIAR MINHA CONTA <MousePointer2 size={20} />
              </Link>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <Sparkles key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">Grátis para sempre na versão base</span>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="col-span-1 md:col-span-2 space-y-8 flex flex-col items-center md:items-start">
              <Logo size="normal" />
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                A ferramenta definitiva para organização financeira compartilhada. Criada para quem valoriza clareza e harmonia doméstica.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Produto</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Elite Edition</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Suporte</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center md:text-left">
              © 2026 Dividi Inc. Todos os direitos reservados.
            </p>
            <div className="flex gap-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">AVANTE DIGITAL PROUDLY BUILT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
