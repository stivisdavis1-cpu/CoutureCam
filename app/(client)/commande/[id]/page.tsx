import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import OrderTimeline from './OrderTimeline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CommandeDetailsClient(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // On récupère la commande avec les infos de l'atelier
  // RLS garantit que le client ne peut lire que ses propres commandes
  const { data: commande, error: commandeError } = await supabase
    .from('commandes')
    .select(`
      *,
      couturier:couturiers (nom_atelier)
    `)
    .eq('id', params.id)
    .single()

  if (commandeError || !commande) {
    return notFound()
  }

  // On récupère les étapes déjà créées
  const { data: etapes } = await supabase
    .from('etapes_commande')
    .select('*')
    .eq('commande_id', params.id)
    .order('horodatage', { ascending: true })

  // Générer des URLs signées pour les photos des étapes si elles existent
  const etapesAvecUrls = await Promise.all((etapes || []).map(async (etape) => {
    if (etape.photo_url) {
      const { data } = await supabase
        .storage
        .from('etapes-photos')
        .createSignedUrl(etape.photo_url, 3600) // 1 heure de validité
      
      return { ...etape, signed_url: data?.signedUrl || null }
    }
    return etape
  }))

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <header className="px-4 py-6">
        <p className="text-sm text-muted-foreground mb-1">Commande #{commande.id.substring(0, 8).toUpperCase()}</p>
        <h1 className="text-2xl font-bold text-foreground">
          {commande.titre} — {commande.couturier?.nom_atelier}
        </h1>
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {commande.statut === 'terminee' ? 'Terminée' : 
             commande.statut === 'livraison' ? 'En livraison' : 
             'En production'}
          </span>
        </div>
      </header>

      <main className="px-6">
        <OrderTimeline commandeId={commande.id} initialEtapes={etapesAvecUrls} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 max-w-md mx-auto z-10">
        <Link href={`/commande/${commande.id}/messages`}>
          <Button className="w-full h-14 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-lg">
            Contacter l'atelier
          </Button>
        </Link>
      </div>
    </div>
  )
}
