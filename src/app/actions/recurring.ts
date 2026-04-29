'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const RecurringSchema = z.object({
  household_id: z.string().uuid(),
  amount: z.number().positive(),
  payer: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1)
})

export async function addRecurringExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  const rawData = {
    household_id: formData.get('household_id'),
    amount: parseFloat(formData.get('amount') as string),
    payer: formData.get('payer'),
    description: formData.get('description'),
    category: formData.get('category') || 'Contas'
  }

  const validatedData = RecurringSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({ ...validatedData.data, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function getRecurringExpenses(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('household_id', householdId)
    
  if (error) return { error: error.message }
  return { data }
}

export async function applyRecurringExpenses(householdId: string, monthDate: string) {
  // monthDate formato YYYY-MM-01
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: recurring } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('household_id', householdId)

  if (!recurring || recurring.length === 0) return { error: 'Nenhum gasto recorrente encontrado' }

  const expensesToInsert = recurring.map(r => ({
    household_id: householdId,
    date: monthDate,
    amount: r.amount,
    payer: r.payer,
    description: r.description,
    category: r.category,
    created_by: user.id
  }))

  const { error } = await supabase.from('expenses').insert(expensesToInsert)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true, count: expensesToInsert.length }
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase.from('recurring_expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}
