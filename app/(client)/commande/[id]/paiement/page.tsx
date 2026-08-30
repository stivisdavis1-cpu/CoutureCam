import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PaiementForm from './PaiementForm'
import { formatCFA } from '@/lib/utils'

export default async function PaiementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Récupérer la commande
  const { data: commande, error } = await supabase
    .from('commandes')
    .select(`
      *,
      couturier:couturiers (nom_atelier)
    `)
    .eq('id', params.id)
    .single()

  if (error || !commande) {
    return notFound()
  }

  if (commande.statut !== 'devis_envoye') {
    // Si la commande n'est plus en attente de paiement, on redirige vers le suivi
    redirect(`/commande/${commande.id}`)
  }

  // Calculs stricts côté serveur (40% d'acompte)
  const montantTotal = commande.montant_total || 0
  const acompteAPayer = Math.round(montantTotal * 0.4)
  const solde = montantTotal - acompteAPayer

  return (
    <div className="min-h-screen bg-background p-4 pb-20 max-w-md mx-auto">
      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-bold text-navy mb-1">Devis reçu</h1>
        <p className="text-sm text-muted-foreground">{commande.couturier?.nom_atelier} • {commande.titre}</p>
      </header>

      {/* Détail du devis (Lecture seule) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
        <div className="flex justify-between items-center py-3 border-b border-muted/50">
          <span className="text-muted-foreground">Montant total</span>
          <span className="font-bold">{formatCFA(montantTotal)}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-muted/50">
          <span className="text-muted-foreground">Délai annoncé</span>
          <span className="font-bold">{commande.delai_estime_jours} jours</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-muted/50 mt-2">
          <span className="text-muted-foreground">Acompte à payer (40%)</span>
          <span className="font-bold text-blue-700">{formatCFA(acompteAPayer)}</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-muted-foreground">Solde à la livraison</span>
          <span className="font-bold">{formatCFA(solde)}</span>
        </div>
      </div>

      <div className="bg-blue-100/50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3">
        <div className="text-blue-500 mt-0.5">ℹ️</div>
        <p className="text-sm text-blue-800">
          Ton paiement est séquestré par CoutureCam. Il n'est versé au couturier qu'après validation de chaque étape.
        </p>
      </div>

      <PaiementForm 
        commandeId={commande.id} 
        montant={acompteAPayer} 
        montantAffiche={formatCFA(acompteAPayer)} 
      />
    </div>
  )
}
