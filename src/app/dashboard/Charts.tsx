'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Charts({ 
  expenses, 
  incomes = [], 
  currency, 
  budget, 
  type = 'expenses' 
}: { 
  expenses: any[], 
  incomes?: any[], 
  currency: string, 
  budget?: number,
  type?: 'expenses' | 'incomes'
}) {
  const categoryData = useMemo(() => {
    const data = type === 'expenses' ? expenses : incomes
    const map: Record<string, number> = {}
    data.forEach(e => {
      const cat = e.category || 'Outros'
      map[cat] = (map[cat] || 0) + Number(e.amount)
    })
    return Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value)
  }, [expenses, incomes, type])

  const payerData = useMemo(() => {
    const data = type === 'expenses' ? expenses : incomes
    const map: Record<string, number> = {}
    data.forEach(e => {
      if (e.payer) {
        map[e.payer] = (map[e.payer] || 0) + Number(e.amount)
      }
    })
    return Object.keys(map).map(k => ({ name: k, value: map[k] }))
  }, [expenses, incomes, type])

  const formatMoney = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency })
  }

  const dataToUse = type === 'expenses' ? expenses : incomes
  if (dataToUse.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 animate-in fade-in duration-1000">
      {/* CHART CONTAINER CATEGORY */}
      <div className="glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col items-center group hover:border-white/10 transition-all duration-700 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-center w-full mb-10">
           <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.4em] bg-white/5 px-5 py-2 rounded-2xl border border-white/5">
            {type === 'expenses' ? 'Distribuição por Categoria' : 'Receitas por Categoria'}
           </h3>
           <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20"></div>
           </div>
        </div>

        <div className="w-full h-[350px] min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%" key={`${type}-pie-${dataToUse.length}`}>
            <PieChart>
              <defs>
                {COLORS.map((color, idx) => (
                  <linearGradient key={`grad-${idx}`} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={categoryData}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={105}
                paddingAngle={8}
                dataKey="value"
                isAnimationActive={true}
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#grad-${index % COLORS.length})`}
                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '1.5rem', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                formatter={(value: any) => [formatMoney(Number(value)), '']} 
                cursor={{ fill: 'transparent' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART CONTAINER COMPARISON */}
      <div className="glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col items-center group hover:border-white/10 transition-all duration-700 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="flex justify-between items-center w-full mb-10">
           <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.4em] bg-white/5 px-5 py-2 rounded-2xl border border-white/5">
            {type === 'expenses' ? 'Comparativo Mensal Alê vs Maria' : 'Comparação de Receitas'}
           </h3>
           <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
           </div>
        </div>

        <div className="w-full h-[350px] min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%" key={`${type}-bar-${dataToUse.length}`}>
            <BarChart data={payerData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="barGradRose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#475569' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#334155' }} 
                tickFormatter={(val) => val.toLocaleString('pt-BR')} 
              />
              <Tooltip 
                cursor={{fill: 'rgba(255, 255, 255, 0.03)', radius: 15}}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '1.5rem', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                formatter={(value: any) => [formatMoney(Number(value)), 'Total']} 
              />
              <Bar dataKey="value" radius={[15, 15, 6, 6]} barSize={55} isAnimationActive={true}>
                {payerData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Alê' ? 'url(#barGradIndigo)' : entry.name === 'Maria' ? 'url(#barGradRose)' : 'url(#barGradEmerald)'} 
                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
