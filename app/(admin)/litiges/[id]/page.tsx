import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import LitigeClient from './LitigeClient'

export default async function LitigePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Dans un cas réel, le middleware aura vérifié le rôle admin ou mediateur

  // 1. Récupérer le litige
  const { data: litige } = await supabase
    .from('litiges')
    .select(`
      *,
      commande:commandes (
        id,
        titre,
        client:profils!client_id(nom),
        couturier:couturiers(nom_atelier)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!litige) {
    // Si la base est vide, on mock pour le rendu visuel
    if (params.id === 'L-0142') {
      const mockHistorique = [
        { type_evenement: 'etape', description: 'Photo essayage postée', horodatage: new Date('2026-08-14T16:05:00').toISOString(), reference_url: 'https://placehold.co/400' },
        { type_evenement: 'litige', description: 'Litige ouvert par le client — motif : non-conformité mesures', horodatage: new Date('2026-08-14T18:22:00').toISOString() },
        { type_evenement: 'message', description: 'Réponse couturier reçue', horodatage: new Date('2026-08-15T09:14:00').toISOString() },
      ]
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Litige #L-0142</h1>
              <p className="text-gray-500 mt-1">Commande #CC-2317 — Client vs Atelier Sonia Couture</p>
            </header>
            <LitigeClient litigeId="L-0142" historique={mockHistorique} montant={27000} />
          </div>
        </div>
      )
    }
    return notFound()
  }

  // 2. Récupérer le montant gelé
  const { data: paiement } = await supabase
    .from('paiements')
    .select('montant')
    .eq('commande_id', litige.commande_id)
    .eq('statut', 'gele')
    .single()

  const montantGele = paiement?.montant || 0

  // 3. Récupérer l'historique fusionné depuis la vue
  const { data: historique } = await supabase
    .from('v_historique_commande')
    .select('*')
    .eq('commande_id', litige.commande_id)
    .order('horodatage', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Litige #{litige.id.substring(0,8).toUpperCase()}</h1>
          <p className="text-gray-500 mt-1">
            Commande #{litige.commande.id.substring(0,8).toUpperCase()} — {litige.commande.client?.nom} vs {litige.commande.couturier?.nom_atelier}
          </p>
        </header>

        <LitigeClient 
          litigeId={litige.id} 
          historique={historique || []} 
          montant={montantGele} 
        />
      </div>
    </div>
  )
}
