'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Landmark, ArrowDownToLine, Calendar, FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default function CouturierFinancesPage() {

  // Mock data
  const stats = {
    montant_a_recevoir: 45000,
    montant_verse_mois: 112500,
    prochain_versement: '2026-08-20'
  }

  const historiques = [
    { id: 'rev_082', commande: 'Robe Wax Soirée', client: 'Alice M.', montant_brut: 25000, commission: 1250, montant_net: 23750, statut: 'verse', date: '2026-08-15' },
    { id: 'rev_083', commande: 'Ensemble tailleur', client: 'Sophie K.', montant_brut: 45000, commission: 2250, montant_net: 42750, statut: 'a_verser', date: '-' },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <header className="bg-navy text-white px-4 pt-8 pb-12 rounded-b-[2.5rem] shadow-sm mb-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Mes Finances</h1>
          <Link href="/couturier/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full">Retour</Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-sm text-white/70 font-medium mb-1">Total Séquestré (En sécurité)</p>
          <h2 className="text-4xl font-bold text-gold">{stats.montant_a_recevoir.toLocaleString()} FCFA</h2>
          <p className="text-xs text-white/50 mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> Prochain versement le {new Date(stats.prochain_versement).toLocaleDateString()}
          </p>
        </div>

        <div className="absolute -bottom-6 left-4 right-4">
          <Card className="border-0 shadow-md rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald/10 text-emerald rounded-full flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Déjà versé ce mois</p>
                  <p className="text-lg font-bold text-navy">{stats.montant_verse_mois.toLocaleString()} FCFA</p>
                </div>
              </div>
              <Button variant="outline" size="icon" className="rounded-full shadow-sm">
                <Download className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="px-4 space-y-6 mt-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-primary text-lg">Détail des reversements</h2>
          <Badge variant="outline" className="text-muted-foreground border-border rounded-full">Août 2026</Badge>
        </div>

        <div className="space-y-4">
          {historiques.map((item) => (
            <Card key={item.id} className="border-border/50 shadow-sm rounded-3xl overflow-hidden hover:shadow-hover transition-shadow bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3 border-b border-border/30 pb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.commande}</h3>
                    <p className="text-xs text-muted-foreground">Client: {item.client}</p>
                  </div>
                  <Badge className={`rounded-full text-[10px] uppercase font-bold ${item.statut === 'verse' ? 'bg-emerald/10 text-emerald border-0' : 'bg-gold/10 text-gold border-0'}`}>
                    {item.statut === 'verse' ? 'Versé' : 'En attente'}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Montant Brut</span>
                    <span>{item.montant_brut.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-terracotta text-xs">
                    <span>Frais plateforme (5%)</span>
                    <span>- {item.commission.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-navy pt-1">
                    <span>Montant Net</span>
                    <span>{item.montant_net.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {item.statut === 'verse' && (
                  <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Transféré via Mobile Money le {new Date(item.date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground px-4 mt-6">
          Les fonds séquestrés sont libérés automatiquement après la validation de l'étape de livraison par le client.
        </p>
      </main>
    </div>
  )
}
