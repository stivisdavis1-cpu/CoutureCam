'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfilClient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Non autorisé" }
  }

  const nom = formData.get('nom') as string
  const telephone = formData.get('telephone') as string
  const quartier = formData.get('quartier') as string

  if (!nom || !telephone || !quartier) {
    return { error: "Veuillez remplir tous les champs obligatoires" }
  }

  const { error } = await supabase
    .from('profils')
    .upsert({
      id: user.id,
      nom,
      telephone,
      quartier
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profil')
  revalidatePath('/accueil')
  return { success: true }
}

export async function updateProfilPhoto(photoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Non autorisé" }
  }

  const { error } = await supabase
    .from('profils')
    .update({ photo_url: photoUrl })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profil')
  return { success: true }
}
