'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function addIncome(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const householdId = formData.get('household_id') as string
  const date = formData.get('date') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payer = formData.get('payer') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string || 'Salário'

  const { error } = await supabase
    .from('incomes')
    .insert({
      household_id: householdId,
      date,
      amount,
      payer,
      description,
      category,
      created_by: user.id
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteIncome(id: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateIncome(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const date = formData.get('date') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payer = formData.get('payer') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string || 'Salário'

  const { error } = await supabase
    .from('incomes')
    .update({
      date,
      amount,
      payer,
      description,
      category
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
