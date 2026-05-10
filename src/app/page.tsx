'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Download, MousePointer2, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Logo from './dashboard/components/Logo'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Refined Background Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Modern Fixed Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-10'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="/login" className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">
              Entrar
            </Link>
            <Link href="/login?mode=signup" className="px-7 py-3 bg-white text-indigo-950 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-indigo-50 transition-all active:scale-95 shadow-lg shadow-white/5">
              Começar Grátis
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-slate-300"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Minimalist Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-20">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)} className="text-white p-2">
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col gap-10">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white uppercase tracking-tighter">Entrar</Link>
            <Link href="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="px-8 py-6 bg-indigo-600 text-white font-black text-lg uppercase tracking-widest rounded-xl text-center">Criar Minha Casa</Link>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-48 md:pt-64">
        
        {/* Elegant Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full animate-in zoom-in duration-700">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em]">Elite Edition 2026</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] uppercase pt-2">
              Sua Casa em Sintonia. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-flow">Suas Contas em Dia.</span>
            </h1>
            
            <p className="text-sm md:text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              A plataforma definitiva para casais e residências compartilhadas. <br className="hidden md:block" />
              Gestão inteligente, transparência total e paz financeira.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4 animate-in fade-in duration-1000 delay-500">
            <Link href="/login?mode=signup" className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-3">
              Começar Agora <ArrowRight size={16} />
            </Link>
            <div className="flex items-center gap-4 text-slate-500 font-black text-[9px] uppercase tracking-widest border-l border-white/10 pl-6 h-10">
              <ShieldCheck size={18} className="text-emerald-500" />
              Segurança RLS Ativa
            </div>
          </div>
        </section>

        {/* Bento Grid Visual Presentation (Fixed Scaling & Alignment) */}
        <section className="max-w-6xl mx-auto px-6 py-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Main Balance (Glass) */}
            <div className="col-span-1 md:col-span-8 glass-card rounded-3xl p-8 md:p-12 border-white/5 flex flex-col md:flex-row items-center gap-12 group hover:border-indigo-500/20 transition-all">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="452" strokeDashoffset="140" className="text-indigo-500" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black italic">72%</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orçamento</span>
                </div>
              </div>
              <div className="space-y-6 text-center md:text-left">
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight italic text-indigo-400">Radar de Despesas</h3>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-sm">Ana pagou as contas do mês. O balanço da casa está positivo em R$ 840,00.</p>
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  {['Luz', 'Internet', 'Aluguel'].map(t => (
                    <span key={t} className="px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Members List */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-3xl p-8 border-white/5 flex flex-col justify-between group hover:border-emerald-500/20 transition-all">
              <div className="space-y-6">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Membros Ativos</h4>
                <div className="space-y-4">
                  {[
                    { n: 'Alê', v: 'R$ 1.250', c: 'bg-indigo-500' },
                    { n: 'Ana', v: 'R$ 2.800', c: 'bg-emerald-500' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full ${m.c} flex items-center justify-center text-[10px] font-black`}>{m.n[0]}</div>
                        <span className="text-xs font-black uppercase tracking-tight">{m.n}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-emerald-500"></div>
                </div>
              </div>
            </div>

            {/* Card 3: Small Features */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-3xl p-8 border-white/5 text-center space-y-4">
               <Download className="mx-auto text-indigo-400" size={24} />
               <h4 className="text-[10px] font-black uppercase tracking-widest italic">Importação IA</h4>
            </div>
            <div className="col-span-1 md:col-span-4 glass-card rounded-3xl p-8 border-white/5 text-center space-y-4">
               <TrendingUp className="mx-auto text-emerald-400" size={24} />
               <h4 className="text-[10px] font-black uppercase tracking-widest italic">Análise de Fluxo</h4>
            </div>
            <div className="col-span-1 md:col-span-4 glass-card rounded-3xl p-8 border-white/5 text-center space-y-4">
               <Users className="mx-auto text-purple-400" size={24} />
               <h4 className="text-[10px] font-black uppercase tracking-widest italic">Multi-usuários</h4>
            </div>

          </div>
        </section>

        {/* Elegant Footer */}
        <footer className="border-t border-white/5 py-20 bg-[#020617]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <Logo />
              <div className="flex gap-12">
                {['Termos', 'Privacidade', 'Suporte'].map(item => (
                  <a key={item} href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">{item}</a>
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
                © 2026 Dividi Elite. Avante Digital.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          animation: gradient-flow 6s ease infinite;
        }
      `}</style>
    </div>
  )
}
