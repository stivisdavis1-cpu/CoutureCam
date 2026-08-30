import { createClient } from '@/utils/supabase/server'
import ValidationClient from './ValidationClient'

export default async function ValidationPage() {
  const supabase = await createClient()

  // Dans un cas réel, le middleware aura vérifié le rôle Admin
  
  // Récupérer les couturiers en attente ou prêts
  const { data: couturiers } = await supabase
    .from('couturiers')
    .select(`
      id,
      nom_atelier,
      statut_verification,
      piece_identite_url,
      photo_atelier_url,
      geoloc_atelier,
      references_verifiees,
      visite_realisee,
      profil:profils (
        quartier
      )
    `)
    .in('statut_verification', ['en_attente', 'pret'])
    .order('statut_verification', { ascending: false }) // 'pret' avant 'en_attente' (alphabétiquement p > e, donc descending les met en premier)

  // Mocker si la base est vide pour la démonstration visuelle
  const displayCouturiers = (couturiers && couturiers.length > 0) ? couturiers.map(c => ({
    ...c,
    quartier: (c.profil as any)?.quartier,
    initiales: c.nom_atelier?.substring(0,2).toUpperCase() || 'XX'
  })) : [
    {
      id: 'mock-1',
      nom_atelier: 'Manuela Tchoumba',
      quartier: 'Bonapriso, Douala',
      statut_verification: 'en_attente',
      piece_identite_url: 'yes',
      photo_atelier_url: 'yes',
      geoloc_atelier: { lat: 0, lng: 0 },
      references_verifiees: [1, 2, 3],
      visite_realisee: false,
      initiales: 'MT'
    },
    {
      id: 'mock-2',
      nom_atelier: 'Jean Kouotou',
      quartier: 'Akwa, Douala',
      statut_verification: 'pret',
      piece_identite_url: 'yes',
      photo_atelier_url: 'yes',
      geoloc_atelier: { lat: 0, lng: 0 },
      references_verifiees: [1, 2, 3],
      visite_realisee: true,
      initiales: 'JK'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Validation des couturiers</h1>
          <p className="text-gray-500 mt-1">{displayCouturiers.length} dossiers en attente de vérification</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCouturiers.map((couturier: any) => (
            <ValidationClient key={couturier.id} couturier={couturier} />
          ))}
        </div>
      </div>
      
    </div>
  )
}
