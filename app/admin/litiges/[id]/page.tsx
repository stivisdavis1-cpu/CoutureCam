import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, MessageSquare, Camera } from 'lucide-react'
import TrancherLitigePanel from './TrancherLitigePanel'
import { notFound } from 'next/navigation'

export default async function AdminLitigePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Requête complexe pour reconstituer l'historique : litiges, etapes, messages
  // On mock l'historique pour la vue UI
  const mockHistorique = [
    { type: 'etape', date: '2026-09-02T10:00:00.000Z', desc: 'Prise de mesures validée', acteur: 'Client' },
    { type: 'etape', date: '2026-09-03T10:00:00.000Z', desc: 'Choix du tissu', acteur: 'Couturier', photo: true },
    { type: 'message', date: '2026-09-04T10:00:00.000Z', desc: 'Le tissu ne correspond pas à ce qu\'on a dit', acteur: 'Client' },
    { type: 'litige_ouvert', date: '2026-09-05T10:00:00.000Z', desc: 'Ouverture du litige', acteur: 'Client' }
  ]

  const litigeId = params.id
  
  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Validation KYC</div>
          <div className="bg-accent text-primary px-4 py-2 rounded-lg">Gestion des litiges</div>
        </nav>
      </aside>

      <main className="flex-1 max-w-5xl flex gap-6">
        <div className="flex-1 space-y-6">
          <header>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="destructive" className="rounded-full bg-red text-white border-0"><AlertTriangle className="w-3 h-3 mr-1" /> Litige Ouvert</Badge>
              <h1 className="text-2xl font-bold text-navy">Commande #{litigeId.substring(0,8)}</h1>
            </div>
            <p className="text-muted-foreground text-sm">Fonds séquestrés : <span className="font-bold text-foreground">22 500 FCFA</span> (gelés automatiquement)</p>
          </header>

          {/* Timeline Immuable */}
          <Card className="border-border/50 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-6">Historique horodaté</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {mockHistorique.map((event, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-muted flex items-center justify-center shrink-0 z-10 text-muted-foreground">
                      {event.type === 'etape' ? <Camera className="w-4 h-4" /> : event.type === 'message' ? <MessageSquare className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-red" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{event.acteur}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 inline-block">
                        {event.desc}
                      </p>
                      {event.photo && (
                        <div className="mt-2 w-32 h-20 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:opacity-80">
                          Photo HD
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de décision (point d'entrée unique) */}
        <div className="w-80 shrink-0">
          <TrancherLitigePanel litigeId={litigeId} />
        </div>
      </main>
    </div>
  )
}
