// @ts-nocheck
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, MapPin, ShieldCheck, CheckCircle2, Scissors } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'

export default async function CouturierProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Récupérer le couturier et son profil
  const { data: couturier, error } = await supabase
    .from('couturiers')
    .select(`
      id, 
      nom_atelier, 
      specialite, 
      note_moyenne, 
      delai_moyen_jours, 
      photo_url, 
      profils(quartier, nom, telephone)
    `)
    .eq('id', params.id)
    .single()

  if (error || !couturier) {
    redirect('/accueil')
  }

  // Fallbacks
  const profils = Array.isArray(couturier.profils) ? couturier.profils[0] : couturier.profils
  const quartier = profils?.quartier || 'Quartier non renseigné'
  
  return (
    <div 
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        backgroundImage: 'url(/bg_tailor.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay sombre/chic */}
      <div className="absolute inset-0 bg-[#1B2A4A]/85 backdrop-blur-[10px] z-0 pointer-events-none"></div>

      {/* Header fin (avec bouton retour) */}
      <header className="px-6 py-6 lg:px-12 bg-transparent sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link href="/accueil" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Retour</span>
          </Link>
          <Logo light={false} showText={false} className="scale-75 origin-right" />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-8 relative z-10 pb-32">
        
        {/* Entête Profil */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          {/* Photo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#C9A84C]/50 shadow-[0_0_30px_rgba(201,168,76,0.2)] overflow-hidden shrink-0 relative bg-[#1B2A4A]">
            {couturier.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={couturier.photo_url} alt={couturier.nom_atelier} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[#C9A84C]">
                {couturier.nom_atelier.substring(0, 1)}
              </div>
            )}
          </div>
          
          {/* Infos */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight font-serif">{couturier.nom_atelier}</h1>
              <div className="bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                VÉRIFIÉ
              </div>
            </div>
            
            <p className="text-white/70 text-lg mb-4 font-light">{couturier.specialite}</p>
            
            <div className="flex flex-wrap gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A84C]" />
                <span>{quartier}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#C9A84C] fill-[#C9A84C]" />
                <span className="text-white/90 font-medium">{couturier.note_moyenne.toFixed(1)} <span className="text-white/40 font-normal">(24 avis)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C9A84C]" />
                <span>Délai approx: <span className="text-white/90 font-medium">{couturier.delai_moyen_jours} jours</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section À propos & Atouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#C9A84C] rotate-[-45deg]" />
              L'Atelier
            </h2>
            <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">
              Maître tailleur avec plus de 10 ans d'expérience. Spécialisé dans la confection sur-mesure et l'attention aux moindres détails. Chaque pièce est réalisée avec passion, en garantissant des finitions parfaites et un tombé impeccable pour sublimer votre silhouette.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-white font-medium mb-4 text-sm">Garanties CoutureCam</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs text-white/70">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>Paiement sécurisé et bloqué jusqu'à livraison</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-white/70">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>Suivi étape par étape</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-white/70">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>Atelier audité physiquement</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Portfolio (Mock) */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <h2 className="text-lg font-medium text-white mb-6">Dernières réalisations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="aspect-[4/5] bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  {/* Fake Image Placeholder */}
                  <Scissors className="w-8 h-8 opacity-20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Voir la création</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1B2A4A]/90 backdrop-blur-xl border-t border-[#C9A84C]/20 p-4 z-30 animate-in slide-in-from-bottom-full duration-700 delay-[800ms]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-white/60 text-xs">À partir de</p>
            <p className="text-[#C9A84C] font-semibold text-lg">Sur devis</p>
          </div>
          <Button 
            className="w-full sm:w-auto bg-[#C9A84C] hover:bg-[#a38535] text-[#1B2A4A] font-bold rounded-full px-8 py-6 text-base shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all hover:scale-105"
          >
            Prendre un rendez-vous
          </Button>
        </div>
      </div>
      
    </div>
  )
}
