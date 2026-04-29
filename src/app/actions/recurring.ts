'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const RecurringSchema = z.object({
  household_id: z.string().uuid(),
  amount: z.number().positive(),
  payer: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  day_of_month: z.number().min(1).max(31)
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
    category: formData.get('category') || 'Contas',
    day_of_month: parseInt(formData.get('day_of_month') as string || '1')
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

export async function applyRecurringExpenses(householdId: string, date: string, expenseId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  let query = supabase
    .from('recurring_expenses')
    .select('*')
    .eq('household_id', householdId)
  
  if (expenseId) {
    query = query.eq('id', expenseId)
  }

  const { data: recurring, error: recError } = await query

  if (recError) return { error: recError.message }
  if (!recurring || recurring.length === 0) return { success: true, count: 0 }

  const expensesToInsert = recurring.map(rec => ({
    household_id: householdId,
    description: rec.description,
    amount: rec.amount,
    payer: rec.payer,
    category: rec.category,
    date: date,
    created_by: user.id
  }))

  const { error: insError } = await supabase.from('expenses').insert(expensesToInsert)
  if (insError) return { error: insError.message }

  revalidatePath('/dashboard')
  return { success: true, count: expensesToInsert.length }
}

export async function updateRecurringExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const rawData = {
    household_id: formData.get('household_id'),
    amount: parseFloat(formData.get('amount') as string),
    payer: formData.get('payer'),
    description: formData.get('description'),
    category: formData.get('category') || 'Contas',
    day_of_month: parseInt(formData.get('day_of_month') as string || '1')
  }

  const validatedData = RecurringSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(validatedData.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, data }
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
