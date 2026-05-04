'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28CFE', '#ff6b6b']

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
      map[e.payer] = (map[e.payer] || 0) + Number(e.amount)
    })
    return Object.keys(map).map(k => ({ name: k, value: map[k] }))
  }, [expenses, incomes, type])

  const formatMoney = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency })
  }

  const dataToUse = type === 'expenses' ? expenses : incomes
  if (dataToUse.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center group hover:shadow-2xl transition-all">
        <h3 className="font-black text-slate-800 mb-6 self-start uppercase text-[10px] tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">
          {type === 'expenses' ? 'Gastos por Categoria' : 'Receitas por Categoria'}
        </h3>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" key={`${type}-pie-${dataToUse.length}`}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                isAnimationActive={true}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={type === 'expenses' ? COLORS[index % COLORS.length] : ['#10b981', '#34d399', '#059669', '#6ee7b7'][index % 4]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [formatMoney(Number(value)), 'Valor']} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center group hover:shadow-2xl transition-all">
        <h3 className="font-black text-slate-800 mb-6 self-start uppercase text-[10px] tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">
          {type === 'expenses' ? 'Comparação de Gastos' : 'Comparação de Receitas'}
        </h3>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" key={`${type}-bar-${dataToUse.length}`}>
            <BarChart data={payerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} tickFormatter={(val) => val.toLocaleString('pt-BR')} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [formatMoney(Number(value)), 'Total']} 
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                {payerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Alê' ? '#3b82f6' : entry.name === 'Maria' ? '#ec4899' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
