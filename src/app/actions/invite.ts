'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteUser(householdId: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autorizado' }

  // 1. Buscar o perfil pelo e-mail
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    return { error: 'A pessoa precisa criar a conta primeiro com o e-mail: ' + email }
  }

  // 2. Adicionar na tabela household_members
  const { error } = await supabase.from('household_members').insert({
    household_id: householdId,
    user_id: profile.id,
    email: email
  })
  
  if (error) {
    if (error.code === '23505') {
      return { error: 'Esta pessoa já faz parte do grupo.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
