'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?message=Erro ao entrar: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: result, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/login?message=Erro no cadastro: ${error.message}`)
  }

  // Se o Supabase exigir confirmação de e-mail, a session virá nula
  if (!result.session) {
    redirect('/login?message=Cadastro realizado! Verifique sua caixa de entrada (ou spam) para confirmar o e-mail antes de fazer login.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/update-password`,
  })

  if (error) {
    redirect(`/login?message=Erro ao enviar e-mail: ${error.message}`)
  }

  redirect('/login?message=E-mail de recuperação enviado! Verifique sua caixa de entrada.')
}
