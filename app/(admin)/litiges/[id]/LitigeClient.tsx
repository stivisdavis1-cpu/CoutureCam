'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Square, CheckSquare, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCFA, formatDate } from '@/lib/utils'

export default function LitigeClient({ 
  litigeId, 
  historique, 
  montant 
}: { 
  litigeId: string, 
  historique: any[], 
  montant: number 
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [photoView, setPhotoView] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDecision = async (decision: string) => {
    setLoading(decision)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Non authentifié")

      const res = await supabase.functions.invoke('trancher-litige', {
        body: { litige_id: litigeId, decision },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (res.error) throw res.error

      alert("Décision appliquée avec succès.")
      router.refresh()
    } catch (err: any) {
      alert("Erreur lors de la décision : " + err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
      
      {/* Historique Horodaté */}
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Historique horodaté</h3>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {historique.map((event, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-gray-200 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {event.type_evenement === 'litige' ? (
                  <Square className="w-3 h-3 text-red-500" />
                ) : (
                  <Square className="w-3 h-3 text-gray-400" />
                )}
              </div>
              
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className={`text-sm ${event.type_evenement === 'litige' ? 'text-red-700 font-semibold' : 'text-gray-800'}`}>
                  {event.description}
                </p>
                <time className="block text-xs font-medium text-gray-400 mt-1">
                  {formatDate(event.horodatage)}
                </time>
                
                {event.reference_url && (
                  <div 
                    className="mt-3 overflow-hidden rounded-lg cursor-pointer max-w-[120px] aspect-square"
                    onClick={() => setPhotoView(event.reference_url)}
                  >
                    <img src={event.reference_url} alt="Photo preuve" className="object-cover w-full h-full hover:scale-105 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau Décision */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Fonds gelés</h4>
          <p className="text-2xl font-bold text-gray-900">{formatCFA(montant)}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Délai de décision</h4>
          <p className="text-lg font-bold text-[#A6823C]">3 jours restants</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Décision</h4>
          <div className="space-y-3">
            <button 
              onClick={() => handleDecision('remboursement_total')}
              disabled={!!loading}
              className="w-full h-11 bg-black text-white text-sm font-semibold rounded-xl hover:bg-black/90 transition-all flex items-center justify-center gap-2"
            >
              {loading === 'remboursement_total' && <Loader2 className="w-4 h-4 animate-spin" />}
              Rembourser le client
            </button>
            <button 
              onClick={() => handleDecision('remboursement_partiel')}
              disabled={!!loading}
              className="w-full h-11 bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {loading === 'remboursement_partiel' && <Loader2 className="w-4 h-4 animate-spin" />}
              Remboursement partiel
            </button>
            <button 
              onClick={() => handleDecision('liberer_couturier')}
              disabled={!!loading}
              className="w-full h-11 bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {loading === 'liberer_couturier' && <Loader2 className="w-4 h-4 animate-spin" />}
              Libérer au couturier
            </button>
          </div>
        </div>
      </div>

      {/* Dialog Photo Pleine Résolution */}
      {photoView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button 
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setPhotoView(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img src={photoView} alt="Pleine résolution" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}

    </div>
  )
}
