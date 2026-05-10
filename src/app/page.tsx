'use client'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Zap, Heart, MousePointer2, Menu, X, PlayCircle, Download } from 'lucide-react'
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
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-[#020617]/60 backdrop-blur-2xl border-b border-white/5' : 'py-10'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="/login" className="text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">
              Entrar
            </Link>
            <Link href="/login?mode=signup" className="px-8 py-3.5 bg-white text-indigo-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
              Começar Grátis
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-300" onClick={() => setIsMenuOpen(true)} aria-label="Menu">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617]/98 backdrop-blur-3xl flex flex-col p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-16">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)} className="text-white p-2">
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-8">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white uppercase italic tracking-tighter">Entrar</Link>
            <Link href="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="px-8 py-6 bg-indigo-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl text-center">Criar Conta</Link>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-48 md:pt-64">
        
        {/* HERO: Conversion Focused */}
        <section className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full animate-in zoom-in duration-700">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Gestão de Elite para Casais</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1] uppercase pt-2">
              Divida a Vida. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-flow">Não as Brigas.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              A única plataforma que entende a dinâmica real de um lar compartilhado. <br className="hidden md:block" />
              Sincronize gastos, automatize acertos e recupere sua paz financeira.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/login?mode=signup" className="px-14 py-7 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center gap-3 group">
              COMEÇAR AGORA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-3 px-10 py-7 text-[11px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest group">
              <PlayCircle size={24} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              Ver Demonstração
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-12 border-t border-white/5 max-w-3xl mx-auto">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white italic tracking-tighter">1.200+</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Famílias</span>
             </div>
             <div className="h-8 w-px bg-white/10"></div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white italic tracking-tighter">100%</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Privado</span>
             </div>
             <div className="h-8 w-px bg-white/10"></div>
             <div className="flex flex-col items-center">
                <div className="flex gap-0.5">
                   {[1,2,3,4,5].map(i => <Sparkles key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avaliado 5/5</span>
             </div>
          </div>
        </section>

        {/* PROOF: The "Glass" Dashboard Visual */}
        <section className="max-w-6xl mx-auto px-6 py-48">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative glass-card rounded-[3.5rem] p-8 md:p-16 border-white/10 overflow-hidden shadow-2xl">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                             Inteligência <br />
                             <span className="text-indigo-400">Financeira Ativa.</span>
                          </h2>
                          <p className="text-lg text-slate-400 font-medium leading-relaxed">
                             Visualize seu balanço em tempo real. Saiba quem pagou o quê e quanto cada um deve de forma transparente e justa.
                          </p>
                       </div>
                       <ul className="space-y-5">
                          {[
                            { icon: <TrendingUp className="text-emerald-400" />, text: 'Radar de despesas dinâmico' },
                            { icon: <Users className="text-indigo-400" />, text: 'Gestão multi-usuário inteligente' },
                            { icon: <Download className="text-purple-400" />, text: 'Importação mágica via Excel/CSV' }
                          ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-black italic uppercase tracking-tight text-slate-200">
                               <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">{item.icon}</div>
                               {item.text}
                            </li>
                          ))}
                       </ul>
                    </div>

                    {/* Animated Visual UI (No images, pure CSS/SVG) */}
                    <div className="relative flex items-center justify-center">
                       <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] animate-pulse"></div>
                       <div className="relative w-full aspect-square max-w-sm glass-card rounded-[3rem] p-10 border-white/10 flex flex-col justify-between shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Balanço do Mês</p>
                                <h4 className="text-4xl font-black italic tracking-tighter text-white leading-none">R$ 12.450</h4>
                             </div>
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                <TrendingUp size={24} className="text-emerald-400" />
                             </div>
                          </div>
                          <div className="space-y-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black shadow-lg">A</div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                   <div className="w-[60%] h-full bg-indigo-500"></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shadow-lg">B</div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                   <div className="w-[40%] h-full bg-emerald-500"></div>
                                </div>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Status: Em Harmonia</span>
                             <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA: Final Conversion */}
        <section className="max-w-4xl mx-auto px-6 py-60 text-center space-y-16">
           <div className="space-y-8">
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                 Sua Casa <br />
                 <span className="text-indigo-400">Elite.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                 Abandone as brigas por dinheiro. Comece hoje a gerir seu lar com a inteligência que ele merece.
              </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login?mode=signup" className="px-16 py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all active:scale-95 flex items-center gap-3">
                 COMEÇAR AGORA <MousePointer2 size={20} />
              </Link>
              <div className="flex flex-col items-start gap-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sem cartão de crédito</p>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Configuração em 30 segundos</p>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-10">
            <Logo />
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">A plataforma definitiva para quem valoriza clareza e harmonia nas finanças compartilhadas.</p>
          </div>
          <div className="space-y-8">
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Produto</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-white cursor-pointer transition-colors">Funcionalidades</li>
                <li className="hover:text-white cursor-pointer transition-colors">Elite Access</li>
                <li className="hover:text-white cursor-pointer transition-colors">Segurança</li>
             </ul>
          </div>
          <div className="space-y-8">
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Legal</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-white cursor-pointer transition-colors">Privacidade</li>
                <li className="hover:text-white cursor-pointer transition-colors">Termos</li>
                <li className="hover:text-white cursor-pointer transition-colors">Suporte</li>
             </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 Dividi Inc. Todos os direitos reservados.</p>
           <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">BUILD WITH PRIDE BY AVANTE DIGITAL</span>
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
      `}</style>
    </div>
  )
}
