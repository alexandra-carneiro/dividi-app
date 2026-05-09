'use client'

export default function Logo({ size = "normal", className = "", onClick }: { size?: "small" | "normal" | "large", className?: string, onClick?: () => void }) {
  const sizes = {
    small: { box: "w-10 h-10", icon: "text-lg", title: "text-2xl", sub: "text-[6px]", gap: "gap-3" },
    normal: { box: "w-12 h-12", icon: "text-xl", title: "text-3xl", sub: "text-[7px]", gap: "gap-4" },
    large: { box: "w-16 h-16", icon: "text-2xl", title: "text-5xl", sub: "text-[9px]", gap: "gap-6" }
  }

  const s = sizes[size]

  return (
    <div onClick={onClick} className={`flex items-center ${s.gap} group cursor-pointer ${className}`}>
      <div className={`${s.box} bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-all`}>
         <span className={`text-white font-black ${s.icon} italic`}>D</span>
      </div>
      <div className="flex flex-col">
        <h1 className={`${s.title} font-black tracking-[0.2em] uppercase text-white leading-none`}>Dividi</h1>
        <span className={`${s.sub} font-black text-slate-600 uppercase tracking-[0.5em] mt-1`}>Smart Analytics</span>
      </div>
    </div>
  )
}
