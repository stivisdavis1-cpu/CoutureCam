import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfilClientForm from './ProfilClientForm'

export const revalidate = 0 // Pas de cache pour afficher le profil à jour instantanément

export default async function ClientProfilPage() {
  const supabase = await createClient()
  
  // Vérification session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil
  const { data: profil } = await supabase
    .from('profils')
    .select('*')
    .eq('id', user.id)
    .single()

  // Récupérer le nombre de commandes
  const { count } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)

  const profileData = {
    nom: profil?.nom || '',
    telephone: profil?.telephone || '',
    quartier: profil?.quartier || '',
    photo_url: profil?.photo_url || null,
    commandes: count || 0
  }

  return <ProfilClientForm profile={profileData} />
}
