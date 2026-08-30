'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckSquare, Square, Loader2, FileText, Image as ImageIcon, MapPin } from 'lucide-react'
import { activerCouturierRpc, refuserCouturier } from './actions'

type CouturierData = {
  id: string
  nom_atelier: string
  quartier: string
  statut_verification: string
  piece_identite_url?: string
  photo_atelier_url?: string
  geoloc_atelier?: any
  references_verifiees?: any
  visite_realisee?: boolean
  initiales: string
}

export default function ValidationClient({ couturier }: { couturier: CouturierData }) {
  const [isActivating, setIsActivating] = useState(false)
  const [isRefusing, setIsRefusing] = useState(false)
  const [showRefusModal, setShowRefusModal] = useState(false)
  const [motifRefus, setMotifRefus] = useState('')

  // Déduire les critères remplis
  const criterePiece = !!couturier.piece_identite_url
  const criterePhoto = !!couturier.photo_atelier_url && !!couturier.geoloc_atelier
  const refs = couturier.references_verifiees || []
  const critereRefs = Array.isArray(refs) && refs.length >= 3
  const critereVisite = !!couturier.visite_realisee

  // Les 4 critères locaux + le fait que la validation est faite = 5 critères implicites (ou 4 ici)
  const canActivate = criterePiece && criterePhoto && critereRefs && critereVisite

  const handleActivate = async () => {
    setIsActivating(true)
    const { success, error } = await activerCouturierRpc(couturier.id)
    setIsActivating(false)
    if (!success) alert(`Erreur: ${error}`)
  }

  const handleRefuse = async () => {
    if (!motifRefus) {
      alert("Le motif est obligatoire")
      return
    }
    setIsRefusing(true)
    const { success, error } = await refuserCouturier(couturier.id, motifRefus)
    setIsRefusing(false)
    if (success) {
      setShowRefusModal(false)
    } else {
      alert(`Erreur: ${error}`)
    }
  }

  const badgeColor = couturier.statut_verification === 'pret' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-[#F6E1B6] text-[#A6823C]'

  const badgeText = couturier.statut_verification === 'pret' ? 'Prêt à valider' : 'En attente'
  const avatarColor = couturier.statut_verification === 'pret' ? 'bg-[#A7E2CB] text-[#1E5D46]' : 'bg-[#D1CFFD] text-[#3934A8]'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${avatarColor}`}>
            {couturier.initiales}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{couturier.nom_atelier}</h3>
            <p className="text-gray-500 text-sm">{couturier.quartier || 'Non renseigné'}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* CHECKLIST */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          {criterePiece ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5 text-gray-300" />}
          <span className={`text-sm ${criterePiece ? 'text-gray-900' : 'text-gray-500'}`}>Pièce d'identité reçue</span>
        </div>
        <div className="flex items-center gap-2">
          {criterePhoto ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5 text-gray-300" />}
          <span className={`text-sm ${criterePhoto ? 'text-gray-900' : 'text-gray-500'}`}>Photo atelier géolocalisée</span>
        </div>
        <div className="flex items-center gap-2">
          {critereRefs ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5 text-gray-300" />}
          <span className={`text-sm ${critereRefs ? 'text-gray-900' : 'text-gray-500'}`}>3 références vérifiées</span>
        </div>
        <div className="flex items-center gap-2">
          {critereVisite ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5 text-gray-300" />}
          <span className={`text-sm ${critereVisite ? 'text-gray-900' : 'text-gray-500'}`}>Visite atelier {critereVisite ? 'réalisée' : 'à planifier'}</span>
        </div>
      </div>

      {/* ACTIONS */}
      {showRefusModal ? (
        <div className="space-y-3 animate-in fade-in">
          <textarea 
            className="w-full text-sm border border-gray-300 rounded-lg p-3 outline-none focus:border-black"
            placeholder="Motif du refus (obligatoire)..."
            rows={3}
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRefusModal(false)}>Annuler</Button>
            <Button variant="destructive" className="flex-1" onClick={handleRefuse} disabled={isRefusing || !motifRefus}>
              {isRefusing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer le refus'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          {canActivate ? (
            <button 
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full h-11 bg-[#008A00] text-white text-sm font-semibold rounded-xl hover:bg-[#007000] transition-all flex items-center justify-center gap-2"
            >
              {isActivating && <Loader2 className="w-4 h-4 animate-spin" />}
              Activer le profil
            </button>
          ) : (
            <>
              <button className="flex-1 h-11 bg-black text-white text-sm font-semibold rounded-xl hover:bg-black/90 transition-all">
                Voir le dossier
              </button>
              <button 
                onClick={() => setShowRefusModal(true)}
                className="flex-1 h-11 bg-transparent border border-gray-300 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Refuser
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
