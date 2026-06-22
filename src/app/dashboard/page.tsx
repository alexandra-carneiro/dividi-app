import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // --- MIGRATION LOGIC (Runs once per load temporarily) ---
  await supabase.from('incomes').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alexandra%')
  await supabase.from('incomes').update({ payer: 'mariaclaratrifoi1' }).ilike('payer', '%maria%')
  await supabase.from('incomes').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alê%')
  await supabase.from('incomes').update({ payer: 'alexandracarneiro' }).ilike('payer', '%ale%')

  await supabase.from('recurring_expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alexandra%')
  await supabase.from('recurring_expenses').update({ payer: 'mariaclaratrifoi1' }).ilike('payer', '%maria%')
  await supabase.from('recurring_expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alê%')
  await supabase.from('recurring_expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%ale%')

  await supabase.from('expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alexandra%')
  await supabase.from('expenses').update({ payer: 'mariaclaratrifoi1' }).ilike('payer', '%maria%')
  await supabase.from('expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%alê%')
  await supabase.from('expenses').update({ payer: 'alexandracarneiro' }).ilike('payer', '%ale%')
  // --------------------------------------------------------

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

  // --- RECOVER ORPHANED INCOMES/EXPENSES ---
  if (householdId) {
    await supabase.from('incomes').update({ household_id: householdId }).is('household_id', null)
    await supabase.from('expenses').update({ household_id: householdId }).is('household_id', null)
    await supabase.from('recurring_expenses').update({ household_id: householdId }).is('household_id', null)
  }
  // -----------------------------------------

  // Buscar despesas iniciais (Apenas do mês atual para carregar rápido)
  let initialExpenses: any[] = []
  let initialRecurring: any[] = []
  let initialCategoryBudgets: any[] = []
  let initialIncomes: any[] = []
  let householdData = null

  if (householdId) {
    const [expsRes, hhRes, recRes, budgetsRes, incomesRes, membersRes, profileRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false }),
      supabase
        .from('households')
        .select('monthly_budget, weekly_budget, currency')
        .eq('id', householdId)
        .single(),
      supabase
        .from('recurring_expenses')
        .select('*')
        .eq('household_id', householdId),
      supabase
        .from('category_budgets')
        .select('*')
        .eq('household_id', householdId),
      supabase
        .from('incomes')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false }),
      supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdId),
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
    ])

    if (expsRes.data) initialExpenses = expsRes.data
    if (hhRes.data) householdData = hhRes.data
    if (recRes.data) initialRecurring = recRes.data
    if (budgetsRes.data) initialCategoryBudgets = budgetsRes.data
    if (incomesRes.data) initialIncomes = incomesRes.data
    const initialMembers = membersRes.data || []
    const initialDisplayName = profileRes.data?.display_name || user.email?.split('@')[0] || 'Usuário'

    return (
      <DashboardClient 
        initialExpenses={initialExpenses} 
        householdId={householdId} 
        userEmail={user.email || ''} 
        initialDisplayName={initialDisplayName}
        initialMonthlyBudget={householdData?.monthly_budget ?? 250.00}
        initialWeeklyBudget={householdData?.weekly_budget ?? 62.50}
        initialCurrency={householdData?.currency ?? 'BRL'}
        initialRecurringExpenses={initialRecurring}
        initialCategoryBudgets={initialCategoryBudgets || []}
        initialIncomes={initialIncomes}
        initialMembers={initialMembers}
      />
    )
  }

  return null
}
