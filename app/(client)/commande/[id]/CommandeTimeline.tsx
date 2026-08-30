'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Check, Clock, Image as ImageIcon } from 'lucide-react'

type EtapeType = 'mesure' | 'tissu' | 'coupe' | 'montage' | 'essayage' | 'livraison'

interface Etape {
  id: string
  type_etape: EtapeType
  horodatage: string | null
  photo_url: string
  validee_par_client: boolean
}

const ETAPES_ORDRE: { type: EtapeType, label: string }[] = [
  { type: 'mesure', label: 'Prise de mesures' },
  { type: 'tissu', label: 'Choix du tissu' },
  { type: 'coupe', label: 'Coupe du tissu' },
  { type: 'montage', label: 'Montage' },
  { type: 'essayage', label: 'Essayage' },
  { type: 'livraison', label: 'Livraison' },
]

export default function CommandeTimeline({ commandeId, initialEtapes }: { commandeId: string, initialEtapes: Etape[] }) {
  const [etapes, setEtapes] = useState<Etape[]>(initialEtapes)
  
  // Realtime subscription setup
  useEffect(() => {
    // Only init if env vars exist (for actual usage)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'etapes_commande',
            filter: `commande_id=eq.${commandeId}`,
          },
          (payload) => {
            setEtapes((prev) => [...prev, payload.new as Etape])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [commandeId])

  const validerEtape = async (etapeId: string) => {
    // Appel RPC pour valider l'étape et débloquer les fonds
    // supabase.rpc('valider_etape', { etape_id: etapeId })
    setEtapes(prev => prev.map(e => e.id === etapeId ? { ...e, validee_par_client: true } : e))
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {ETAPES_ORDRE.map((etapeRef, index) => {
        const etapeData = etapes.find(e => e.type_etape === etapeRef.type)
        const isCompleted = !!etapeData?.horodatage
        const isCurrent = etapes.filter(e => e.horodatage).length === index
        const requiresValidation = etapeRef.type === 'essayage' && isCompleted && !etapeData?.validee_par_client

        return (
          <div key={etapeRef.type} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors duration-300 ${isCompleted ? 'bg-emerald text-white' : isCurrent ? 'bg-gold text-white' : 'bg-muted text-muted-foreground'}`}>
              {isCompleted ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-3xl border border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-hover">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold ${isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {etapeRef.label}
                </h3>
                {etapeData?.horodatage && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(etapeData.horodatage).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {etapeData?.photo_url ? (
                <div className="mt-3 rounded-2xl overflow-hidden bg-muted aspect-video relative group/img cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={etapeData.photo_url} alt="Preuve" className="object-cover w-full h-full" />
                </div>
              ) : isCurrent ? (
                <p className="text-sm text-muted-foreground mt-2">En attente de l'atelier...</p>
              ) : null}

              {requiresValidation && (
                <Button 
                  onClick={() => validerEtape(etapeData.id)}
                  className="w-full mt-4 rounded-full bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Valider cette étape
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
