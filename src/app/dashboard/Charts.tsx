'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28CFE', '#ff6b6b']

export default function Charts({ expenses, currency, budget }: { expenses: any[], currency: string, budget?: number }) {
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      const cat = e.category || 'Outros'
      map[cat] = (map[cat] || 0) + Number(e.amount)
    })
    return Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value)
  }, [expenses])

  const payerData = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      map[e.payer] = (map[e.payer] || 0) + Number(e.amount)
    })
    return Object.keys(map).map(k => ({ name: k, value: map[k] }))
  }, [expenses])

  const formatMoney = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency })
  }

  if (expenses.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
        <h3 className="font-bold text-slate-700 mb-4 self-start">Gastos por Categoria</h3>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" key={`pie-${expenses.length}`}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
        <h3 className="font-bold text-slate-700 mb-4 self-start">Comparação de Gastos</h3>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" key={`bar-${expenses.length}`}>
            <BarChart data={payerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => val.toLocaleString('pt-BR')} />
              <Tooltip formatter={(value: any) => formatMoney(Number(value))} cursor={{fill: 'transparent'}}/>
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {payerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Alê' ? '#3b82f6' : '#ec4899'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
