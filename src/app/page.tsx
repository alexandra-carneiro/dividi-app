'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Download, MousePointer2, Menu, X, Heart, Zap, Globe } from 'lucide-react'
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
      
      {/* Premium Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px] animate-bounce-slow"></div>
      </div>

      {/* Floating Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-4 bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5' : 'py-10'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-10">
               {['Diferenciais', 'Elite', 'Planos'].map(item => (
                 <button key={item} className="text-[10px] font-black text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-[0.3em]">{item}</button>
               ))}
            </div>
            <div className="flex items-center gap-6 border-l border-white/10 pl-10">
              <Link href="/login" className="text-[10px] font-black text-slate-300 hover:text-white transition-colors uppercase tracking-widest">
                Entrar
              </Link>
              <Link href="/login?mode=signup" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all active:scale-95">
                Começar Agora
              </Link>
            </div>
          </div>

          <button 
            className="md:hidden p-3 bg-white/5 rounded-xl text-slate-300 border border-white/10"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-2xl flex flex-col p-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-20">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)} className="text-white p-3 bg-white/5 rounded-xl border border-white/10">
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-10 items-center">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-5xl font-black text-white uppercase tracking-tighter italic">Login</Link>
            <Link href="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="w-full py-6 bg-indigo-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/30 text-center">Começar Grátis</Link>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-48 md:pt-64">
        
        {/* Emotional Hero Section */}
        <section className="max-w-6xl mx-auto px-6 text-center space-y-16">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full animate-in zoom-in duration-700">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Dividi Elite 2026 está Online</span>
          </div>
          
          <div className="space-y-10">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1] uppercase pt-2 max-w-5xl mx-auto">
              Divida a Vida. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Não as Brigas.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              A única plataforma de gestão financeira que entende a dinâmica real de um lar compartilhado. Paz, clareza e harmonia em cada centavo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-6 animate-in fade-in duration-1000 delay-500">
            <Link href="/login?mode=signup" className="px-16 py-7 bg-white text-indigo-950 font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
              CRIAR MINHA CASA <ArrowRight size={20} />
            </Link>
            <div className="flex items-center gap-6 px-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] border-l border-white/10">
              <ShieldCheck size={24} className="text-indigo-400" />
              <span>Segurança <br /> de Elite</span>
            </div>
          </div>
        </section>

        {/* Artistic Dashboard Representation */}
        <section className="max-w-6xl mx-auto px-6 py-40">
           <div className="relative group">
              <div className="absolute -inset-10 bg-indigo-600/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
                 {/* Main Balance Visual */}
                 <div className="col-span-12 md:col-span-7 glass-card rounded-[3.5rem] p-12 border-white/10 flex flex-col justify-between min-h-[400px] hover:border-indigo-500/30 transition-colors shadow-2xl">
                    <div className="flex justify-between items-start">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Saldo da Casa</p>
                          <h2 className="text-6xl font-black italic tracking-tighter">R$ 12.450</h2>
                       </div>
                       <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                          <TrendingUp size={32} className="text-emerald-400" />
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                             <Heart size={24} />
                          </div>
                          <p className="text-sm font-medium text-slate-300">"Alê, o aluguel foi pago! Seu balanço está atualizado."</p>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[75%] h-full bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                       </div>
                    </div>
                 </div>

                 {/* Members Floating Bento */}
                 <div className="col-span-12 md:col-span-5 space-y-8">
                    <div className="glass-card rounded-[3rem] p-10 border-white/10 hover:border-emerald-500/30 transition-colors shadow-xl h-full flex flex-col justify-between">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10">Harmonia dos Membros</h4>
                       <div className="space-y-8">
                          {[
                            { n: 'Alê', v: '95% em dia', c: 'bg-indigo-500', icon: <Zap size={12} /> },
                            { n: 'Ana', v: 'Dona da Casa', c: 'bg-emerald-500', icon: <Heart size={12} /> }
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between group/member">
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl ${m.c} flex items-center justify-center shadow-lg group-hover/member:scale-110 transition-transform`}>
                                     {m.icon}
                                  </div>
                                  <div>
                                     <p className="text-lg font-black italic uppercase tracking-tighter">{m.n}</p>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.v}</p>
                                  </div>
                               </div>
                               <ArrowRight size={20} className="text-white/20 group-hover/member:text-white transition-colors" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Feature Highlights */}
        <section className="max-w-6xl mx-auto px-6 py-32 border-y border-white/5 bg-white/[0.01]">
           <div className="grid md:grid-cols-3 gap-16">
              {[
                { i: <Download />, t: 'Importação Mágica', d: 'Conecte seus bancos e deixe nossa IA categorizar cada centavo do seu lar.' },
                { i: <Users />, t: 'Gestão Fluida', d: 'Adicione membros, mude perfis e gerencie casas diferentes em um só clique.' },
                { i: <Globe />, t: 'Acesso Global', d: 'Seus dados sincronizados em tempo real, em qualquer dispositivo, em qualquer lugar.' }
              ].map((f, i) => (
                <div key={i} className="space-y-6 group">
                   <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {f.i}
                   </div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">{f.t}</h3>
                   <p className="text-slate-400 font-medium leading-relaxed">{f.d}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Final Elite CTA */}
        <section className="max-w-4xl mx-auto px-6 py-60 text-center space-y-16">
           <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Dê o Próximo <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-flow">Passo.</span>
           </h2>
           <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
              Junte-se à elite da gestão financeira doméstica. <br /> Simples, elegante e focado no que importa: sua harmonia.
           </p>
           <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link href="/login?mode=signup" className="px-16 py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center gap-3">
                 COMEÇAR AGORA <MousePointer2 size={20} />
              </Link>
              <div className="text-left space-y-1">
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avaliado 5/5 por 1.200 casas</p>
              </div>
           </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
            <div className="space-y-8 max-w-sm">
              <Logo />
              <p className="text-slate-400 font-medium leading-relaxed">A ferramenta definitiva para quem valoriza clareza, transparência e harmonia nas finanças compartilhadas.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Produto</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                     <li className="hover:text-white cursor-pointer transition-colors">Elite Features</li>
                     <li className="hover:text-white cursor-pointer transition-colors">Segurança</li>
                     <li className="hover:text-white cursor-pointer transition-colors">Novidades</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Dividi</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                     <li className="hover:text-white cursor-pointer transition-colors">Suporte</li>
                     <li className="hover:text-white cursor-pointer transition-colors">Privacidade</li>
                     <li className="hover:text-white cursor-pointer transition-colors">Termos</li>
                  </ul>
               </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">© 2026 Dividi Elite. Avante Digital.</p>
            <div className="flex gap-10">
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Designed for Harmony</span>
            </div>
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
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
