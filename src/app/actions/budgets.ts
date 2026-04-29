'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCategoryBudget(householdId: string, category: string, limit: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('category_budgets')
    .upsert({ 
      household_id: householdId, 
      category, 
      monthly_limit: limit 
    }, { onConflict: 'household_id,category' })

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getCategoryBudgets(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category_budgets')
    .select('*')
    .eq('household_id', householdId)

  if (error) return { error: error.message }
  return { data }
}
