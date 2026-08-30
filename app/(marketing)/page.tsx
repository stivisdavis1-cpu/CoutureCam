import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/Logo'
import { Scissors, ShieldCheck, Camera, MapPin, ArrowRight, Shield } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CoutureCam | Ta tenue, sans surprise, à la date promise',
  description: 'CoutureCam relie les Doualais à des couturiers vérifiés. Chaque étape photographiée. Paiement séquestré, libéré seulement quand la tenue vous convient.',
  openGraph: {
    title: 'CoutureCam',
    description: 'Votre tenue parfaite, sans aucun stress. L\'excellence sur mesure à Douala.',
    url: 'https://couturecam.cm',
    siteName: 'CoutureCam',
    locale: 'fr_FR',
    type: 'website',
  },
}

// ISR - revalidation toutes les heures (3600s)
export const revalidate = 3600

export default async function LandingPublique() {
  const supabase = await createClient()

  // Requête sur la vue agrégée en lecture seule
  const { data: stats } = await supabase.from('v_stats_publiques').select('*').single()
  
  const displayStats = stats || {
    couturiers_verifies: 154,
    commandes_livrees: 4200,
    taux_securite: 99.8
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CoutureCam",
    "description": "Plateforme de mise en relation avec des couturiers vérifiés à Douala.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Douala",
      "addressCountry": "CM"
    },
    "url": "https://couturecam.cm"
  };

  return (
    <div className="min-h-screen bg-[#1A243F] text-white flex flex-col font-sans">
      {/* Ligne dorée supérieure */}
      <div className="h-1.5 w-full fixed top-0 left-0 flex space-x-1 opacity-100 z-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'8\' viewBox=\'0 0 40 8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,8 L10,0 L20,8 L30,0 L40,8\' fill=\'none\' stroke=\'%23D5B980\' stroke-width=\'1\' stroke-opacity=\'0.8\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x' }}>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation Sticky */}
      <nav className="sticky top-0 z-40 bg-[#1A243F]/90 backdrop-blur-md border-b border-white/10 pt-1.5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo light={false} />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
            <a href="#comment-ca-marche" className="hover:text-gold transition-colors">Comment ça marche</a>
            <a href="#confiance" className="hover:text-gold transition-colors">Nos garanties</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/couturier/inscription">
              <Button variant="ghost" className="hidden md:flex rounded-full text-gold hover:bg-gold/10 hover:text-gold">Espace Couturier</Button>
            </Link>
            <Link href="/accueil">
              <Button className="rounded-full shadow-sm hover:shadow-hover bg-gold hover:bg-gold/90 text-[#1A243F] font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out">Espace Client</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden pt-24 pb-32 bg-[#1A243F]">
        {/* Background Image with Dark Overlay (Hero Only) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/bg_tailor.png")' }}
        >
          <div className="absolute inset-0 bg-[#1A243F]/90 backdrop-blur-sm"></div>
        </div>
        
        {/* Motif décoratif Africain subtil (wax pattern) overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D5B980\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Ta tenue, sans surprise, <br className="hidden md:block"/>
              <span className="text-gold">à la date promise.</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-10 max-w-md">
              CoutureCam relie les Doualais à des couturiers vérifiés. Chaque étape photographiée. Paiement séquestré, libéré seulement quand la tenue vous convient.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <Link href="/accueil">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-gold text-primary hover:bg-gold/90 font-semibold h-12 px-6 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out shadow-lg">
                  Trouver mon couturier
                </Button>
              </Link>
              <Link href="/couturier/inscription">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 h-12 px-6 bg-transparent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out">
                  Je suis couturier
                </Button>
              </Link>
            </div>
            <div className="text-xs text-gold/80">
              4.8/5 de note moyenne · 1200+ commandes livrées à Douala
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <Card className="bg-white text-foreground rounded-[24px] p-6 shadow-2xl border-0">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-terracotta flex items-center justify-center text-white text-xl font-bold shrink-0">
                  MT
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">Atelier Manuela</h3>
                  <p className="text-sm text-muted-foreground">Bonapriso - Tenues traditionnelles</p>
                  <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/10 border-0 mt-2 font-normal">Vérifié</Badge>
                </div>
              </div>
              
              <div className="mb-6 relative">
                <p className="text-xs text-muted-foreground mb-1">Étape en cours</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm text-primary">Montage — photo il y a 2h</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gold w-3/4 rounded-full"></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Séquestre</p>
                <p className="font-bold text-emerald text-sm">45 000 FCFA <span className="text-muted-foreground font-normal text-xs ml-1">- en attente de livraison</span></p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistiques (Proof of trust) */}
      <section id="couturiers" className="relative z-20 -mt-10 mx-4 md:mx-auto max-w-5xl bg-[#0B1120]/80 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-8 text-center">
            <div className="text-4xl font-bold text-white mb-1">{displayStats.couturiers_verifies}</div>
            <div className="text-sm font-medium text-gold uppercase tracking-wide">Couturiers vérifiés</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-1">{displayStats.commandes_livrees}+</div>
            <div className="text-sm font-medium text-gold uppercase tracking-wide">Tenues livrées</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-4xl font-bold text-gold mb-1">{displayStats.taux_securite}%</div>
            <div className="text-sm font-medium text-gold uppercase tracking-wide">Paiements sécurisés</div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gold mb-4">La couture, simplifiée</h2>
          <p className="text-white/70 max-w-xl mx-auto">Un parcours clair en 3 étapes pour vous garantir la meilleure expérience possible.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Ligne connectrice sur desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#1A243F] via-gold/30 to-[#1A243F] -z-10"></div>
          
          {[
            { icon: MapPin, title: "1. Choisissez", desc: "Trouvez un atelier vérifié près de chez vous avec des avis authentiques." },
            { icon: Camera, title: "2. Suivez", desc: "Recevez des photos horodatées à chaque étape clé (coupe, montage...)." },
            { icon: ShieldCheck, title: "3. Validez", desc: "L'artisan n'est payé que lorsque vous validez la livraison. Sans risque." }
          ].map((step, i) => (
            <Card key={i} className="border-0 shadow-none bg-transparent text-center group hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
              <CardContent className="pt-6">
                <div className="w-24 h-24 mx-auto bg-[#0B1120] rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500 group-hover:border-gold/50 group-hover:shadow-[0_0_30px_rgba(213,185,128,0.2)]">
                  <step.icon className="w-10 h-10 text-gold transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section Confiance */}
      <section id="confiance" className="bg-[#0B1120] py-24 border-y border-white/10 relative overflow-hidden">
        {/* Motif décoratif Africain subtil (wax pattern) overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D5B980\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}></div>

        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <Badge className="bg-gold/10 text-gold hover:bg-gold/20 border-0 mb-4 rounded-full">Garantie CoutureCam</Badge>
            <h2 className="text-3xl font-bold text-white mb-6">Votre argent est en sécurité. Toujours.</h2>
            <div className="space-y-6">
              {[
                { title: "Paiement séquestré", desc: "Votre acompte (Mobile Money) est conservé sur un compte de séquestre jusqu'à la livraison." },
                { title: "Vérification rigoureuse", desc: "Pièce d'identité, visite de l'atelier, références. Nos couturiers sont des professionnels." },
                { title: "Médiation impartiale", desc: "En cas de litige, nous tranchons sur la base de l'historique photo certifié sur l'application." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/accueil" className="inline-block mt-8">
              <Button className="rounded-full gap-2 bg-gold hover:bg-gold/90 text-[#1A243F] shadow-lg hover:-translate-y-1 transition-transform font-bold">
                Essayer maintenant <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-tr from-[#1A243F]/50 to-gold/20 rounded-full absolute inset-0 -z-10 blur-3xl scale-90"></div>
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[#1A243F] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:-translate-y-2">
              <Image 
                src="/tailor_workshop.png" 
                alt="Artisane couturière au travail" 
                width={600} 
                height={600} 
                className="object-cover w-full h-full aspect-square transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Overlay subtil */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/20 to-transparent opacity-80"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-[#1A243F]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 font-semibold uppercase">Séquestre actif</p>
                    <p className="text-lg font-bold text-gold mt-1">22 500 FCFA</p>
                  </div>
                  <ShieldCheck className="text-gold w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accès Plateforme (Double CTA) */}
      <section className="py-20 bg-[#1A243F]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gold mb-4">Rejoignez CoutureCam</h2>
            <p className="text-white/70">Sélectionnez votre accès pour commencer.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Accès Client */}
            <Card className="bg-[#0B1120] rounded-[2rem] border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(213,185,128,0.15)] hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-10 text-center flex flex-col h-full items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                  <Scissors className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Pour les Clients</h3>
                <p className="text-white/60 mb-8">Trouvez le couturier idéal, passez commande et suivez sa réalisation en toute sérénité.</p>
                <Link href="/accueil" className="w-full mt-auto">
                  <Button className="w-full rounded-full bg-gold hover:bg-gold/90 text-[#1A243F] h-12 text-base font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Ouvrir l'Espace Client
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Accès Couturier */}
            <Card className="bg-[#0B1120] rounded-[2rem] border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-10 text-center flex flex-col h-full items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-white/80" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Pour les Couturiers</h3>
                <p className="text-white/60 mb-8">Gérez vos commandes, sécurisez vos paiements et gagnez la confiance de nouveaux clients.</p>
                <Link href="/couturier/inscription" className="w-full mt-auto">
                  <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white/10 h-12 text-base font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all bg-transparent">
                    Créer mon Espace Couturier
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white/70 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <Logo light={false} />
            </div>
            <p className="text-sm mb-4">La confiance retrouvée dans le sur-mesure. Opérationnel à Douala.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quartiers couverts</h4>
            <ul className="space-y-2 text-sm">
              <li>Akwa</li>
              <li>Bonanjo</li>
              <li>Deido (Bientôt)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>CGU & Séquestre</li>
              <li>Confidentialité</li>
              <li>Mentions légales</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Nous suivre</h4>
            <ul className="space-y-2 text-sm">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-sm text-center">
          &copy; {new Date().getFullYear()} CoutureCam. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
