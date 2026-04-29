'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const SettingsSchema = z.object({
  monthly_budget: z.number().nonnegative(),
  weekly_budget: z.number().nonnegative(),
  currency: z.string().length(3)
})

export async function updateHouseholdSettings(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  const rawData = {
    monthly_budget: parseFloat(formData.get('monthly_budget') as string),
    weekly_budget: parseFloat(formData.get('weekly_budget') as string),
    currency: formData.get('currency')
  }

  const validatedData = SettingsSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('households')
    .update(validatedData.data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
