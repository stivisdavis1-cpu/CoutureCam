'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function refuserCouturier(couturierId: string, motif: string) {
  const supabase = await createClient()

  // 1. Récupérer l'admin connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // 2. Mettre à jour le statut du couturier
  const { error: updateError } = await supabase
    .from('couturiers')
    .update({ statut_verification: 'refuse' })
    .eq('id', couturierId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 3. Log l'action dans audit_log
  await supabase.from('audit_log').insert({
    admin_id: user.id,
    action: 'REFUS_COUTURIER',
    cible_id: couturierId,
    details: { motif }
  })

  // 4. (Optionnel) Envoyer une notification au couturier
  // await sendNotification(couturierId, `Votre dossier a été refusé. Motif : ${motif}`)

  revalidatePath('/couturiers/validation')
  return { success: true }
}

export async function activerCouturierRpc(couturierId: string) {
  const supabase = await createClient()

  // 1. Récupérer l'admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // 2. Appeler le RPC
  const { error } = await supabase.rpc('activer_couturier', {
    p_couturier_id: couturierId,
    p_admin_id: user.id
  })

  if (error) {
    console.error('Erreur RPC activer_couturier:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/couturiers/validation')
  return { success: true }
}
