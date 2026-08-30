import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import RechercheCouturiers from './RechercheCouturiers'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CoutureCam | Trouvez les Meilleurs Couturiers sur Mesure',
  description: 'Découvrez et réservez les meilleurs couturiers et ateliers de couture vérifiés. Tenues traditionnelles, costumes sur mesure et broderie de haute qualité.',
  keywords: 'couturier sur mesure, ateliers de couture, tenues traditionnelles, broderie, mode africaine, tailleur, réservation couturier',
  openGraph: {
    title: 'CoutureCam | Trouvez les Meilleurs Couturiers sur Mesure',
    description: 'Découvrez et réservez les meilleurs couturiers et ateliers de couture vérifiés au Cameroun.',
    url: 'https://couturecam.com',
    siteName: 'CoutureCam',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default async function AccueilClientPage() {
  const supabase = await createClient()
  
  // Vérification de la session utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Récupérer le nom de l'utilisateur
  const { data: profil } = await supabase
    .from('profils')
    .select('nom')
    .eq('id', user.id)
    .single()

  const prenom = profil?.nom ? profil.nom.split(' ')[0] : 'Client'

  return (
    <div 
      className="min-h-screen font-sans relative"
      style={{
        backgroundImage: 'url(/bg_tailor.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay sombre/chic pour l'ambiance couture */}
      <div className="absolute inset-0 bg-[#1B2A4A]/80 backdrop-blur-[6px] z-0 pointer-events-none"></div>

      {/* Header Corporate & Fin avec le Code Couleur Logo */}
      <header className="px-6 py-6 lg:px-12 bg-[#1B2A4A]/90 sticky top-0 z-20 border-b border-[#C9A84C]/20 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-8 duration-1000 ease-out">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          
          {/* LOGO COUTURECAM UNIFIÉ */}
          <Logo light={false} />

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/50 mb-0.5">Bienvenue,</p>
              <p className="text-sm font-medium text-white">{prenom}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/profil" title="Paramètres du Profil">
                <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] font-bold flex items-center justify-center border border-[#C9A84C]/50 shadow-[0_0_10px_rgba(201,168,76,0.15)] shrink-0 text-sm hover:scale-105 hover:bg-[#C9A84C]/20 transition-all cursor-pointer">
                  {prenom.substring(0, 2).toUpperCase()}
                </div>
              </Link>
              
              <Link href="/api/auth/logout" title="Se déconnecter (Sécurisé)" className="h-10 w-10 lg:h-11 lg:w-11 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 shadow-sm hover:shadow-md">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 relative z-10">
        <Suspense fallback={
          <div className="animate-pulse space-y-8 w-full max-w-2xl">
            <div className="h-12 bg-gray-100 rounded-full w-full"></div>
            <div className="flex gap-3">
              <div className="h-9 w-24 bg-gray-100 rounded-full"></div>
              <div className="h-9 w-36 bg-gray-100 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="h-40 bg-gray-100 rounded-2xl w-full"></div>
              <div className="h-40 bg-gray-100 rounded-2xl w-full hidden md:block"></div>
              <div className="h-40 bg-gray-100 rounded-2xl w-full hidden lg:block"></div>
            </div>
          </div>
        }>
          <RechercheCouturiers />
        </Suspense>
      </main>
    </div>
  )
}
