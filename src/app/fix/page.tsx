import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function FixPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not logged in</div>
  }

  // Update Incomes
  const { error: err1 } = await supabase.from('incomes').update({ payer: 'alexandracarneiro' }).eq('payer', 'Alexandra')
  const { error: err2 } = await supabase.from('incomes').update({ payer: 'mariaclaratrifoi1' }).eq('payer', 'Maria')
  const { error: err1b } = await supabase.from('incomes').update({ payer: 'alexandracarneiro' }).eq('payer', 'Alê')

  // Update Recurring
  const { error: err3 } = await supabase.from('recurring_expenses').update({ payer: 'alexandracarneiro' }).eq('payer', 'Alexandra')
  const { error: err4 } = await supabase.from('recurring_expenses').update({ payer: 'mariaclaratrifoi1' }).eq('payer', 'Maria')
  const { error: err4b } = await supabase.from('recurring_expenses').update({ payer: 'alexandracarneiro' }).eq('payer', 'Alê')

  // Also fix any Expenses that might have been saved as Alê
  const { error: err5 } = await supabase.from('expenses').update({ payer: 'alexandracarneiro' }).eq('payer', 'Alê')

  return (
    <div style={{ padding: '50px', color: 'white', backgroundColor: 'black', minHeight: '100vh' }}>
      <h1>Migration Completed</h1>
      <pre>
        {JSON.stringify({
          incomes: { err1, err2, err1b },
          recurring: { err3, err4, err4b },
          expenses: { err5 }
        }, null, 2)}
      </pre>
      <a href="/dashboard" style={{ color: 'blue', textDecoration: 'underline' }}>Voltar ao Dashboard</a>
    </div>
  )
}
