'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, Square, Image as ImageIcon } from 'lucide-react'

type TypeEtape = 'mesure' | 'tissu' | 'coupe' | 'montage' | 'essayage' | 'livraison'

interface Etape {
  id: string
  type_etape: TypeEtape
  photo_url: string | null
  signed_url?: string | null
  horodatage: string
  validee_par_client: boolean
}

const ETAPES_ORDRE: { type: TypeEtape; label: string; descEnCours: string }[] = [
  { type: 'mesure', label: 'Prise de mesure', descEnCours: 'En cours...' },
  { type: 'tissu', label: 'Choix du tissu', descEnCours: 'En cours...' },
  { type: 'coupe', label: 'Coupe du tissu', descEnCours: 'En cours...' },
  { type: 'montage', label: 'Montage', descEnCours: 'Attendu avant vendredi' },
  { type: 'essayage', label: 'Essayage final', descEnCours: 'En attente de votre validation' },
  { type: 'livraison', label: 'Livraison', descEnCours: 'Prêt à être récupéré' }
]

export default function OrderTimeline({ commandeId, initialEtapes }: { commandeId: string, initialEtapes: Etape[] }) {
  const [etapes, setEtapes] = useState<Etape[]>(initialEtapes)
  const supabase = createClient()

  useEffect(() => {
    // S'abonner aux nouvelles étapes de cette commande
    const channel = supabase
      .channel(`commande_${commandeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'etapes_commande',
          filter: `commande_id=eq.${commandeId}`
        },
        async (payload) => {
          const newEtape = payload.new as Etape
          
          // Récupérer l'URL signée si photo
          if (newEtape.photo_url) {
            const { data } = await supabase.storage.from('etapes-photos').createSignedUrl(newEtape.photo_url, 3600)
            newEtape.signed_url = data?.signedUrl
          }
          
          setEtapes((prev) => [...prev, newEtape].sort((a, b) => new Date(a.horodatage).getTime() - new Date(b.horodatage).getTime()))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [commandeId, supabase])

  const validerEssayage = async (etapeId: string) => {
    // Appel d'une server action ou requete directe
    const { error } = await supabase.from('etapes_commande').update({ validee_par_client: true }).eq('id', etapeId)
    if (!error) {
      setEtapes(prev => prev.map(e => e.id === etapeId ? { ...e, validee_par_client: true } : e))
    }
  }

  // Trouver l'index de l'étape courante (la dernière validée/créée)
  const latestCompletedIndex = etapes.length > 0 
    ? ETAPES_ORDRE.findIndex(eo => eo.type === etapes[etapes.length - 1].type_etape) 
    : -1

  const currentIndex = latestCompletedIndex + 1

  return (
    <div className="relative border-l-2 border-muted ml-3 py-4 space-y-8">
      {ETAPES_ORDRE.map((etapeDef, index) => {
        const isCompleted = index <= latestCompletedIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        const etapeData = etapes.find(e => e.type_etape === etapeDef.type)
        
        let nodeColor = 'bg-background border-muted'
        let textColor = 'text-muted-foreground'
        let icon = null

        if (isCompleted) {
          nodeColor = 'bg-emerald border-emerald'
          textColor = 'text-foreground'
          icon = <Square className="w-3 h-3 text-white fill-current" />
        } else if (isCurrent) {
          nodeColor = 'bg-blue-100 border-blue-300'
          textColor = 'text-foreground'
          icon = <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
        } else {
          nodeColor = 'bg-background border-muted'
          textColor = 'text-muted-foreground opacity-50'
        }

        const dateStr = etapeData ? new Date(etapeData.horodatage).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : null

        return (
          <div key={etapeDef.type} className="relative pl-8">
            {/* Si c'est terminé, on colorise la ligne au-dessus en vert (hack visuel) */}
            {isCompleted && index > 0 && (
              <div className="absolute -left-[2px] bottom-full h-full w-[2px] bg-emerald" />
            )}

            {/* Le noeud / point */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${nodeColor} transition-colors duration-500`}>
              {icon}
            </div>

            {/* Contenu */}
            <div>
              <h3 className={`font-semibold ${textColor} ${isCurrent ? 'text-navy' : ''}`}>
                {etapeDef.label} {isCurrent && 'en cours'}
              </h3>
              
              <p className="text-sm text-muted-foreground mt-0.5">
                {isCompleted ? dateStr : (isCurrent ? etapeDef.descEnCours : '')}
              </p>

              {/* Photo si disponible */}
              {isCompleted && etapeData?.signed_url && (
                <div className="mt-3 overflow-hidden rounded-2xl max-w-[200px] h-24 relative shadow-sm border border-border/50">
                  <img src={etapeData.signed_url} alt={etapeDef.label} className="object-cover w-full h-full" />
                </div>
              )}

              {/* Action Validation Essayage */}
              {isCompleted && etapeData?.type_etape === 'essayage' && !etapeData.validee_par_client && (
                <div className="mt-4">
                  <button 
                    onClick={() => validerEssayage(etapeData.id)}
                    className="px-4 py-2 bg-emerald hover:bg-emerald/90 text-white rounded-full text-sm font-semibold transition-all shadow-sm"
                  >
                    Valider cette étape
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">Votre validation est requise pour passer à la livraison.</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
