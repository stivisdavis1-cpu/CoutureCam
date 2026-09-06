import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import RechercheCouturiers from './RechercheCouturiers'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { LogOut, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen font-sans relative bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Fond décoratif Haute Couture subtil */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#C9A84C]/5 to-transparent pointer-events-none z-0"></div>

      {/* Header Corporate & Fin */}
      <header className="px-6 py-4 lg:px-12 bg-white/80 sticky top-0 z-20 border-b border-[#C9A84C]/15 backdrop-blur-xl shadow-sm animate-in fade-in slide-in-from-top-8 duration-1000 ease-out">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          
          {/* LOGO COUTURECAM UNIFIÉ */}
          <div className="hover:scale-105 transition-transform duration-500 ease-out">
            <Logo light={false} />
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block animate-in fade-in slide-in-from-right-4 duration-1000 delay-300 fill-mode-both">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold mb-0.5 flex items-center justify-end gap-1">
                <Sparkles className="w-3 h-3" />
                Bienvenue,
              </p>
              <p className="text-sm font-medium text-gray-900">{prenom}</p>
            </div>
            
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
              <Link href="/profil" title="Paramètres du Profil">
                <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#2A4070] text-[#C9A84C] font-bold flex items-center justify-center shrink-0 text-sm hover:scale-[1.05] active:scale-[0.95] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-500 ease-out cursor-pointer shadow-md border border-[#C9A84C]/20">
                  {prenom.substring(0, 2).toUpperCase()}
                </div>
              </Link>
              
              <Link href="/api/auth/logout" title="Se déconnecter (Sécurisé)" className="h-10 w-10 lg:h-11 lg:w-11 flex items-center justify-center rounded-full bg-red-50/50 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-out hover:scale-[1.05] active:scale-[0.95]">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 relative z-10">
        <Suspense fallback={
          <div className="animate-pulse space-y-8 w-full max-w-2xl mx-auto mt-4">
            <div className="h-16 bg-white shadow-sm rounded-full w-full border border-gray-100"></div>
            <div className="flex gap-3 justify-center">
              <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-9 w-36 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-[200%] -ml-[50%] px-[25%]">
              <div className="h-80 bg-white shadow-sm border border-gray-100 rounded-3xl w-full"></div>
              <div className="h-80 bg-white shadow-sm border border-gray-100 rounded-3xl w-full hidden md:block"></div>
              <div className="h-80 bg-white shadow-sm border border-gray-100 rounded-3xl w-full hidden lg:block"></div>
              <div className="h-80 bg-white shadow-sm border border-gray-100 rounded-3xl w-full hidden lg:block"></div>
            </div>
          </div>
        }>
          <RechercheCouturiers />
        </Suspense>
      </main>
    </div>
  )
}
