import { createClient } from '@/utils/supabase/server'
import WaitlistForm from './WaitlistForm'
import { Logo } from '@/components/ui/Logo'

export default async function WaitlistPage(props: { params: Promise<{ ville: string }> }) {
  const params = await props.params
  const ville = params.ville.toLowerCase()
  const supabase = await createClient()

  // Récupération sécurisée via la vue publique (qui aggrège les données)
  const { data } = await supabase
    .from('v_compteur_attente')
    .select('total_inscrits')
    .eq('ville', ville)
    .single()

  const compteInscrits = data?.total_inscrits || 0

  // Formatage pour l'affichage dynamique
  const villeFormattee = ville.charAt(0).toUpperCase() + ville.slice(1)
  const sousTitre = 'PHASE PILOTE EXCLUSIVE'

  return (
    <div className="min-h-screen bg-[#1A243F] flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_tailor.png")' }}
      >
        <div className="absolute inset-0 bg-[#1A243F]/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Pattern Mudcloth/Bogolan (vectorisé d'après l'image fournie) */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M 0 20 L 20 10 L 40 20 L 60 10\' stroke=\'%23D2541C\' /%3E%3Cpath d=\'M 75 0 L 70 30 M 85 0 L 80 30 M 95 0 L 90 30 M 105 0 L 100 30 M 115 0 L 110 30\' stroke=\'%23A87B57\' stroke-width=\'3\' opacity=\'0.8\' /%3E%3Cpath d=\'M 0 50 L 20 35 L 40 50 L 60 35 L 80 50 L 100 35 L 120 50\' stroke=\'%23D2541C\' stroke-width=\'5\' /%3E%3Cpath d=\'M 0 58 L 120 58\' stroke=\'%23D2541C\' stroke-width=\'3\' /%3E%3Ccircle cx=\'20\' cy=\'70\' r=\'4\' fill=\'%23D2541C\' stroke=\'none\' /%3E%3Ccircle cx=\'40\' cy=\'74\' r=\'4\' fill=\'none\' stroke=\'%23D2541C\' /%3E%3Ccircle cx=\'60\' cy=\'78\' r=\'4\' fill=\'%23D2541C\' stroke=\'none\' /%3E%3Ccircle cx=\'80\' cy=\'82\' r=\'4\' fill=\'none\' stroke=\'%23D2541C\' /%3E%3Cpath d=\'M 40 90 L 60 105 L 80 90 L 100 105 L 120 90\' stroke=\'%23D2541C\' stroke-width=\'4\' /%3E%3Cpath d=\'M 100 70 L 115 85 L 100 100 L 120 100 M 100 115 L 120 115\' stroke=\'%23A87B57\' opacity=\'0.8\' /%3E%3Cpath d=\'M 35 120 L 40 100 M 45 120 L 50 100 M 55 120 L 60 100 M 65 120 L 70 100\' stroke=\'%23A87B57\' opacity=\'0.8\' /%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '180px' }}></div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 z-10 text-center max-w-4xl mx-auto w-full">
        
        {/* Logo CoutureCam Unifié */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Logo light={false} className="scale-125" />
        </div>

        {/* Badge Ville */}
        <div className="border border-[#D5B980] text-[#D5B980] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-10 animate-in fade-in zoom-in-95 duration-700 delay-150 fill-mode-both hover:bg-[#D5B980]/10 hover:scale-105 transition-all cursor-default shadow-[0_0_20px_rgba(213,185,128,0.2)]">
          BIENTOT A {villeFormattee.toUpperCase()} - {sousTitre}
        </div>

        {/* Titre & Sous-titre */}
        <h1 className="text-white text-4xl md:text-5xl font-serif font-medium tracking-wide leading-tight mb-6 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          Le couturier de confiance <br className="hidden md:block"/>
          <span className="text-[#D5B980] italic inline-block hover:scale-105 transition-transform duration-500 cursor-default">arrive sur votre téléphone.</span>
        </h1>
        
        <p className="text-white/70 md:text-lg mb-10 max-w-lg font-light tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 fill-mode-both">
          Inscrivez-vous à la liste d'attente pour être parmi les premiers
          à essayer CoutureCam dès l'ouverture de la phase pilote.
        </p>

        {/* Formulaire Client */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
          <WaitlistForm ville={ville} compteInscrits={compteInscrits} />
        </div>

      </main>

      {/* Cartes Avantages (Footer style Corporate Luxe) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-5xl mx-auto w-full pb-16 z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-[1200ms] fill-mode-both">
        <div className="bg-[#1A243F]/60 backdrop-blur-xl rounded-xl p-8 border border-[#D5B980]/20 hover:bg-[#1A243F]/80 hover:-translate-y-2 hover:border-[#D5B980]/60 hover:shadow-[0_10px_40px_rgba(213,185,128,0.15)] transition-all duration-700 group">
          <div className="w-10 h-10 border border-[#D5B980]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D5B980] transition-all duration-700">
            <span className="text-[#D5B980] text-sm font-serif">I</span>
          </div>
          <h3 className="text-[#D5B980] font-serif text-lg tracking-wide mb-3 group-hover:text-white transition-colors duration-500">Excellence vérifiée</h3>
          <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white/90 transition-colors duration-500">Audits stricts de nos ateliers partenaires : contrôle qualité, références et visites systématiques avant activation.</p>
        </div>
        
        <div className="bg-[#1A243F]/60 backdrop-blur-xl rounded-xl p-8 border border-[#D5B980]/20 hover:bg-[#1A243F]/80 hover:-translate-y-2 hover:border-[#D5B980]/60 hover:shadow-[0_10px_40px_rgba(213,185,128,0.15)] transition-all duration-700 group">
          <div className="w-10 h-10 border border-[#D5B980]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D5B980] transition-all duration-700">
            <span className="text-[#D5B980] text-sm font-serif">II</span>
          </div>
          <h3 className="text-[#D5B980] font-serif text-lg tracking-wide mb-3 group-hover:text-white transition-colors duration-500">Traçabilité absolue</h3>
          <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white/90 transition-colors duration-500">Suivi visuel et horodaté de la confection. Du choix des étoffes à la livraison finale de la tenue.</p>
        </div>
        
        <div className="bg-[#1A243F]/60 backdrop-blur-xl rounded-xl p-8 border border-[#D5B980]/20 hover:bg-[#1A243F]/80 hover:-translate-y-2 hover:border-[#D5B980]/60 hover:shadow-[0_10px_40px_rgba(213,185,128,0.15)] transition-all duration-700 group">
          <div className="w-10 h-10 border border-[#D5B980]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D5B980] transition-all duration-700">
            <span className="text-[#D5B980] text-sm font-serif">III</span>
          </div>
          <h3 className="text-[#D5B980] font-serif text-lg tracking-wide mb-3 group-hover:text-white transition-colors duration-500">Sécurité financière</h3>
          <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white/90 transition-colors duration-500">Vos fonds sont séquestrés et ne sont débloqués qu'après validation complète de votre commande.</p>
        </div>
      </div>

    </div>
  )
}
