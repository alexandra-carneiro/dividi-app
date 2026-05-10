'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Zap, LayoutGrid, Receipt, Calendar, Download, MousePointer2, Menu, X, ChevronRight, PieChart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          
          <div className="hidden md:flex items-center gap-12">
            <div className="flex gap-8">
              {['Funcionalidades', 'Elite', 'Segurança'].map(item => (
                <button key={item} className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">
                  {item}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-xs font-black text-slate-300 hover:text-white transition-colors uppercase tracking-widest">
                Entrar
              </Link>
              <Link href="/login?mode=signup" className="px-8 py-3.5 bg-white text-indigo-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                Começar Grátis
              </Link>
            </div>
          </div>

          <button 
            className="md:hidden p-2 text-slate-300"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617] p-8 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-16">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)} className="text-white p-2">
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-10 text-center">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-white uppercase tracking-tighter italic">Entrar</Link>
            <Link href="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="px-8 py-6 bg-indigo-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/20">Criar Minha Casa</Link>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-32 md:pt-48">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-full animate-in zoom-in duration-700">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Redefinindo o Fluxo Doméstico</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[1.05] italic uppercase animate-in slide-in-from-bottom-8 duration-700 pt-2">
              Sua Casa. Suas Contas. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-flow">Em Perfeita Ordem.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
              A ferramenta de gestão financeira feita para quem divide a vida. <br className="hidden md:block" />
              Simples como uma conversa, poderosa como uma planilha.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-in fade-in duration-1000 delay-500">
            <Link href="/login?mode=signup" className="px-14 py-7 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center gap-3 group">
              CRIAR MINHA CONTA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <Sparkles key={i} size={12} className="text-amber-400 fill-amber-400" />)}
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grátis para sempre na versão base</span>
            </div>
          </div>

          {/* CSS-ONLY SMART DASHBOARD (NO IMAGES = PERFORMANCE 100) */}
          <div className="relative mt-32 max-w-5xl mx-auto animate-in slide-in-from-bottom-12 duration-1000 delay-700">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[150px] opacity-20 pointer-events-none"></div>
            
            <div className="grid grid-cols-12 gap-6 relative">
              {/* Main Gauge Card */}
              <div className="col-span-12 md:col-span-8 glass-card rounded-[3rem] p-8 md:p-12 border-white/10 flex flex-col md:flex-row items-center gap-12 overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="552" strokeDashoffset="180" className="text-indigo-500" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black">68%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizado</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Radar de Gastos</h3>
                    <p className="text-sm font-medium text-slate-400">Ana pagou o Aluguel, você deve R$ 450,00.</p>
                  </div>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <div className="px-4 py-2 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">Aluguel: R$ 2.400</div>
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pago</div>
                  </div>
                </div>
              </div>

              {/* Members Bento */}
              <div className="col-span-12 md:col-span-4 glass-card rounded-[3rem] p-8 border-white/10 flex flex-col justify-between">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Membros Ativos</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Alê', status: 'R$ 1.250', color: 'bg-indigo-500' },
                      { name: 'Ana', status: 'R$ 2.800', color: 'bg-emerald-500' },
                      { name: 'Caio', status: 'Pendente', color: 'bg-slate-700' }
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-[10px] font-black shadow-lg`}>{m.name[0]}</div>
                          <span className="text-sm font-black italic uppercase">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[80%] h-full bg-emerald-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-6 py-48 grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <Download className="text-emerald-400" />,
              title: "Importação Inteligente",
              description: "Arraste sua planilha do banco e nossa IA categoriza tudo automaticamente. Chega de digitação manual."
            },
            {
              icon: <LayoutGrid className="text-indigo-400" />,
              title: "Gestão Multiusuário",
              description: "Sem limites de membros. Adicione todos que compartilham a casa e mantenha a transparência total."
            },
            {
              icon: <ShieldCheck className="text-purple-400" />,
              title: "Privacidade RLS",
              description: "Seus dados são protegidos por Row Level Security de nível bancário. O que é seu, fica com você."
            }
          ].map((item, i) => (
            <div key={i} className="group space-y-6 p-8 rounded-[2rem] hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">{item.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        {/* Elite CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-48">
           <div className="glass-card rounded-[4rem] p-12 md:p-24 text-center space-y-12 relative overflow-hidden border-white/5 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight pt-2">
                  Pronto para a <br />
                  <span className="text-indigo-400">Elite Edition?</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                  Automatize o financeiro do seu lar com ferramentas que você realmente vai usar. Sem complicação, apenas clareza.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                 <Link href="/login?mode=signup" className="px-14 py-7 bg-white text-indigo-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 flex items-center gap-3">
                    GARANTIR ACESSO <MousePointer2 size={20} />
                 </Link>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sem cartão de crédito</span>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Logo />
            <div className="flex gap-12">
              {['Termos', 'Privacidade', 'Suporte'].map(item => (
                <a key={item} href="#" className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">{item}</a>
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              © 2026 Dividi Elite. Built with pride.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          animation: gradient-flow 6s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
