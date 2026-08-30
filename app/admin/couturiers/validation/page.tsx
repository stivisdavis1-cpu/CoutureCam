import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, FileText, User, MapPin } from 'lucide-react'
import ValidationPanel from './ValidationPanel'

export default async function AdminValidationCouturiers() {
  const supabase = await createClient()

  // Requête filtrée (en_attente, pret)
  const { data: couturiers } = await supabase
    .from('couturiers')
    .select('*')
    .in('statut_verification', ['en_attente', 'pret'])
    .order('created_at', { ascending: true })

  // Mock
  const displayCouturiers = (couturiers && couturiers.length > 0) ? couturiers : [
    {
      id: 'c1',
      nom_atelier: 'Couture Express',
      quartier: 'Bonamoussadi',
      statut_verification: 'en_attente',
      created_at: new Date().toISOString()
    },
    {
      id: 'c2',
      nom_atelier: 'Sape Elite',
      quartier: 'Bali',
      statut_verification: 'pret',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      {/* Sidebar (Admin layout placeholder) */}
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <div className="bg-accent text-primary px-4 py-2 rounded-lg">Validation KYC</div>
          <div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Gestion des litiges</div>
        </nav>
      </aside>

      <main className="flex-1 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Candidatures Couturiers</h1>
          <p className="text-muted-foreground mt-1">Examen des dossiers d'admission (Checklist KYC en 6 points)</p>
        </header>

        <div className="space-y-4">
          {displayCouturiers.map((couturier) => (
            <Card key={couturier.id} className="border-border/50 shadow-sm rounded-2xl hover:shadow-hover transition-all bg-white overflow-hidden group">
              <CardContent className="p-0 flex items-center">
                <div className="p-6 flex-1 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{couturier.nom_atelier}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {couturier.quartier}
                    </p>
                  </div>
                </div>
                
                <div className="p-6 border-l border-border/50 flex flex-col items-end gap-3 min-w-[200px] bg-muted/10">
                  <Badge variant={couturier.statut_verification === 'pret' ? 'default' : 'secondary'} className="rounded-full">
                    {couturier.statut_verification === 'pret' ? 'Dossier complet' : 'En attente'}
                  </Badge>
                  
                  {/* Composant Client qui ouvre un Sheet (panneau latéral) pour valider */}
                  <ValidationPanel couturier={couturier} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
