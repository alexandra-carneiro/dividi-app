'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const ExpenseSchema = z.object({
  household_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  amount: z.number().positive("O valor deve ser positivo"),
  payer: z.string().min(1, "Pagador é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória")
})

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  const rawData = {
    household_id: formData.get('household_id'),
    date: formData.get('date'),
    amount: parseFloat(formData.get('amount') as string),
    payer: formData.get('payer'),
    description: formData.get('description'),
    category: formData.get('category') || 'Outros'
  }

  const validatedData = ExpenseSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: 'Dados inválidos', details: validatedData.error.flatten() }
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...validatedData.data, created_by: user.id })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  const rawData = {
    household_id: formData.get('household_id'),
    date: formData.get('date'),
    amount: parseFloat(formData.get('amount') as string),
    payer: formData.get('payer'),
    description: formData.get('description'),
    category: formData.get('category') || 'Outros'
  }

  const validatedData = ExpenseSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: 'Dados inválidos', details: validatedData.error.flatten() }
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(validatedData.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
