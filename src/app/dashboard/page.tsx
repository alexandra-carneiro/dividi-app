import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verificar se o usuário já tem um household
  let { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  let householdId = member?.household_id

  // Se não tem, cria um novo household
  if (!householdId) {
    const { data: newHousehold } = await supabase
      .from('households')
      .insert({ name: 'Minha Casa' })
      .select('id')
      .single()

    if (newHousehold) {
      householdId = newHousehold.id
      // O trigger 'on_household_created' no banco de dados cuidará 
      // de adicionar o usuário à tabela household_members automaticamente.
    }
  }

  // Buscar despesas iniciais
  let initialExpenses: any[] = []
  let householdData = null
  if (householdId) {
    const { data: exps } = await supabase
      .from('expenses')
      .select('*')
      .eq('household_id', householdId)
      .order('date', { ascending: false })
    
    if (exps) {
      initialExpenses = exps
    }

    const { data: hh } = await supabase
      .from('households')
      .select('monthly_budget, weekly_budget, currency')
      .eq('id', householdId)
      .single()

    householdData = hh
  }

  return (
    <DashboardClient 
      initialExpenses={initialExpenses} 
      householdId={householdId} 
      userEmail={user.email || ''} 
      initialMonthlyBudget={householdData?.monthly_budget ?? 250.00}
      initialWeeklyBudget={householdData?.weekly_budget ?? 62.50}
      initialCurrency={householdData?.currency ?? 'BRL'}
    />
  )
}
