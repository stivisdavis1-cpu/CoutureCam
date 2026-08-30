'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function refuserCommande(commandeId: string) {
  const supabase = await createClient()

  // Mettre à jour le statut
  const { error } = await supabase
    .from('commandes')
    .update({ statut: 'refusee' })
    .eq('id', commandeId)

  if (error) {
    console.error('Erreur refus commande:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/couturier/dashboard')
  return { success: true }
}

export async function envoyerDevis(commandeId: string, montant: number, delai: number, message: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Non authentifié" }

  // 1. Mise à jour de la commande
  const { error: cmdError } = await supabase
    .from('commandes')
    .update({ 
      statut: 'devis_envoye',
      montant_total: montant,
      delai_estime_jours: delai
    })
    .eq('id', commandeId)

  if (cmdError) {
    console.error('Erreur devis commande:', cmdError)
    return { success: false, error: cmdError.message }
  }

  // 2. Insérer dans la table devis
  const { error: devisError } = await supabase.from('devis').insert({
    commande_id: commandeId,
    couturier_id: user.id,
    prix: montant,
    delai_jours: delai,
    message: message
  })

  if (devisError) {
    console.error('Erreur insertion devis:', devisError)
    // On ne bloque pas si la table n'existe pas (fallback)
  }

  revalidatePath('/couturier/dashboard')
  return { success: true }
}

export async function validerEtapePhoto(commandeId: string, imageUrl: string, lat: number, lng: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Non authentifié" }

  // Enregistrer l'étape dans la base (horodatage serveur implicite via created_at ou explicite via now())
  const { error } = await supabase.from('etapes_production').insert({
    commande_id: commandeId,
    photo_url: imageUrl,
    latitude: lat,
    longitude: lng,
    // created_at est géré par Postgres (horodatage serveur garanti)
  })

  if (error) {
    console.error('Erreur validation photo:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/couturier/dashboard')
  return { success: true }
}
