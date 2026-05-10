'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const RecurringSchema = z.object({
  household_id: z.string().uuid(),
  amount: z.number().positive('O valor deve ser maior que zero'),
  payer: z.string().min(1, 'Selecione um pagador'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  day_of_month: z.number().min(1).max(31, 'Dia inválido')
})

type RecurringData = z.infer<typeof RecurringSchema>

async function validateAndUpsert(formData: FormData, id?: string) {
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
    const errorMsg = validatedData.error.issues.map(i => i.message).join(', ')
    return { error: errorMsg }
  }

  let result
  if (id) {
    result = await supabase
      .from('recurring_expenses')
      .update(validatedData.data)
      .eq('id', id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('recurring_expenses')
      .insert({ ...validatedData.data, created_by: user.id })
      .select()
      .single()
  }

  if (result.error) return { error: result.error.message }

  revalidatePath('/dashboard')
  return { success: true, data: result.data }
}

export async function addRecurringExpense(formData: FormData) {
  return validateAndUpsert(formData)
}

export async function updateRecurringExpense(id: string, formData: FormData) {
  return validateAndUpsert(formData, id)
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

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase.from('recurring_expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}
