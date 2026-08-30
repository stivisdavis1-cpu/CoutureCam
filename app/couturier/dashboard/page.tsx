import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, CheckSquare, Clock, MapPin, ChevronRight, Star, Scissors, User } from 'lucide-react'
import UploadEtapePhoto from './UploadEtapePhoto'
import ModalDevis from './ModalDevis'
import Link from 'next/link'

export default async function DashboardCouturier() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const couturierId = userData.user?.id || 'mock-id'

  // Récupérer les stats depuis la vue v_couturier_stats
  const { data: stats } = await supabase
    .from('v_couturier_stats')
    .select('*')
    .eq('couturier_id', couturierId)
    .single()

  const { data: commandesAttente } = await supabase
    .from('commandes')
    .select(`
      id, created_at, titre, statut,
      client:profils(nom, quartier)
    `)
    .eq('couturier_id', couturierId)
    .eq('statut', 'en_attente')
    .order('created_at', { ascending: true })

  const { data: commandesEnCours } = await supabase
    .from('commandes')
    .select(`
      id, titre, 
      client:profils(nom)
    `)
    .eq('couturier_id', couturierId)
    .eq('statut', 'en_cours')
    .order('created_at', { ascending: false })

  const displayStats = stats || { nb_en_attente: 0, nb_en_cours: 0, note_moyenne: 0 }
  const displayAttente = commandesAttente || []
  const displayEnCours = commandesEnCours || []

  // Fonction utilitaire pour calculer le temps restant (created_at + 2 heures)
  const getTempsRestant = (dateString: string) => {
    const expirationDate = new Date(new Date(dateString).getTime() + 2 * 60 * 60 * 1000)
    const now = new Date()
    const diff = expirationDate.getTime() - now.getTime()
    if (diff <= 0) return "Expiré"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m restantes`
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-primary/20">
      
      {/* HEADER SECTION - Hero style avec image de fond */}
      <div className="relative bg-[#0B1120] px-6 pt-16 pb-16 rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8 z-10 overflow-hidden">
        {/* Image de fond avec overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: 'url("/bg_tailor.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent z-0"></div>
        
        {/* Motif décoratif Africain (wax) subtil */}
        <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D5B980\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}></div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Mon Atelier</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full font-semibold text-xs tracking-wide backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vérifié</span>
              </div>
            </div>
            <p className="text-white/70 font-medium">Gérez vos commandes sur mesure</p>
          </div>
          
          {/* STATS CARDS en ligne sur Desktop */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-5 flex flex-col items-center justify-center min-w-[100px] shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out group">
              <div className="w-10 h-10 rounded-full bg-[#D5B980]/20 text-[#D5B980] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white leading-none mb-1">{displayStats.nb_en_attente}</span>
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">À traiter</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-5 flex flex-col items-center justify-center min-w-[100px] shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white leading-none mb-1">{displayStats.nb_en_cours}</span>
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">En cours</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-5 flex flex-col items-center justify-center min-w-[100px] shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out group">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-2xl font-black text-white leading-none mb-1">{displayStats.note_moyenne.toFixed(1)}</span>
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Note</span>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 max-w-4xl mx-auto space-y-10">
        
        {/* NOUVELLE DEMANDE (A ACCEPTER) */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-400 rounded-full block"></span>
              Nouvelles demandes
            </h2>
            {displayAttente.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                {displayAttente.length}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayAttente.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-100 border-dashed rounded-[24px] p-8 text-center text-gray-400 font-medium">
                Vous n'avez aucune demande en attente pour le moment.
              </div>
            ) : (
              displayAttente.map((req: any) => (
                <div key={req.id} className="bg-white border border-orange-100 rounded-[24px] p-6 shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden">
                  {/* Petit accent visuel */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {getTempsRestant(req.created_at)}
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-gray-900 text-xl mb-1 line-clamp-1">{req.titre}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Client à {req.client?.quartier || 'Inconnu'}
                  </p>
                  
                  <div className="flex gap-3 relative z-10">
                    <ModalDevis commandeId={req.id} titre={req.titre} />
                    <form className="flex-1" action={async () => {
                      'use server'
                      const { refuserCommande } = await import('./actions')
                      await refuserCommande(req.id)
                    }}>
                      <button type="submit" className="w-full h-12 bg-gray-50 text-gray-600 font-bold rounded-full hover:bg-red-50 hover:text-red-600 transition-colors duration-300">
                        Refuser
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* EN PRODUCTION */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-500 rounded-full block"></span>
              En production
            </h2>
          </div>
          
          <div className="space-y-4">
            {displayEnCours.length === 0 ? (
               <div className="bg-white border border-gray-100 border-dashed rounded-[24px] p-8 text-center text-gray-400 font-medium">
                 Aucune commande en production actuellement.
               </div>
            ) : (
              displayEnCours.map((cmd: any) => (
                <div key={cmd.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{cmd.titre}</h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      Client: <span className="text-gray-700">{cmd.client?.nom || 'Inconnu'}</span>
                    </p>
                  </div>
                  <div className="md:w-64">
                    <UploadEtapePhoto commandeId={cmd.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
