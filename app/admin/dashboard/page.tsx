import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, ShieldCheck, Activity, Users, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import DashboardCharts from './DashboardCharts'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Dans la réalité, ces requêtes attaquent les vues matérialisées
  /*
  const { data: gmvData } = await supabase.from('v_gmv_mensuel').select('*')
  const { data: repartition } = await supabase.from('v_repartition_quartier').select('*')
  const { data: sante } = await supabase.from('v_sante_plateforme').select('*').single()
  */

  const mockSante = {
    couturiers_actifs: 142,
    note_moyenne: 4.8,
    delai_moyen_jours: 6.5,
    retention_j30: 78,
    litiges_ouverts: 3
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      {/* Sidebar - Fixée pour la V2 */}
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6 shrink-0">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <div className="bg-accent text-primary px-4 py-2 rounded-lg font-bold shadow-sm">Vue d'ensemble</div>
          <Link href="/finance"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Finance & Trésorerie</div></Link>
          <Link href="/utilisateurs"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Utilisateurs</div></Link>
          <Link href="/couturiers/validation"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Validation KYC</div></Link>
          <Link href="/litiges/1"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Litiges</div></Link>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-6xl">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Pilotage analytique et financier (Août 2026)</p>
          </div>
          <div className="flex gap-3">
            <select className="border border-border rounded-full px-4 py-2 text-sm bg-white shadow-sm outline-none">
              <option>30 derniers jours</option>
              <option>90 derniers jours</option>
              <option>12 derniers mois</option>
            </select>
            <Button variant="outline" className="rounded-full shadow-sm"><Download className="w-4 h-4 mr-2" /> Rapport PDF</Button>
          </div>
        </header>

        {/* 4 Cartes Indicateurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm rounded-3xl bg-white hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Volume GMV</p>
              <h3 className="text-2xl font-bold text-foreground">12.4M FCFA</h3>
              <p className="text-xs text-emerald flex items-center mt-2 font-medium"><ArrowUpRight className="w-3 h-3 mr-1" /> +14% ce mois</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm rounded-3xl bg-white hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Revenu Net (Commissions)</p>
              <h3 className="text-2xl font-bold text-foreground">1.86M FCFA</h3>
              <p className="text-xs text-emerald flex items-center mt-2 font-medium"><ArrowUpRight className="w-3 h-3 mr-1" /> +14% ce mois</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl bg-white hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Fonds Séquestrés (En cours)</p>
              <h3 className="text-2xl font-bold text-gold">4.2M FCFA</h3>
              <p className="text-xs text-muted-foreground flex items-center mt-2 font-medium">Réparti sur 112 commandes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl bg-white hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Taux de litiges</p>
              <h3 className="text-2xl font-bold text-foreground">1.2%</h3>
              <p className="text-xs text-emerald flex items-center mt-2 font-medium"><ArrowDownRight className="w-3 h-3 mr-1" /> -0.3% ce mois</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphes (Client Component) */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts />
          </div>

          {/* Panneau latéral - Santé plateforme */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-primary">Santé Plateforme</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Couturiers actifs</span>
                      <span className="font-semibold text-foreground">{mockSante.couturiers_actifs}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full w-[80%]"></div></div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Note moyenne</span>
                      <span className="font-semibold text-gold">{mockSante.note_moyenne} ★</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-gold h-1.5 rounded-full w-[96%]"></div></div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Rétention Client (30j)</span>
                      <span className="font-semibold text-emerald">{mockSante.retention_j30}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-emerald h-1.5 rounded-full w-[78%]"></div></div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red">Litiges en cours d'instruction</span>
                      <Badge variant="destructive" className="bg-red hover:bg-red/90">{mockSante.litiges_ouverts}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Derniers Séquestres Libérés</h3>
                <div className="space-y-4">
                  {[
                    { id: 'TRX-1092', amount: '45,000', status: 'libere' },
                    { id: 'TRX-1091', amount: '12,500', status: 'libere' },
                    { id: 'TRX-1090', amount: '30,000', status: 'litige' },
                  ].map((trx, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{trx.id}</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                      </div>
                      <Badge className={trx.status === 'libere' ? 'bg-emerald/10 text-emerald hover:bg-emerald/20 border-0' : 'bg-red/10 text-red hover:bg-red/20 border-0'}>
                        {trx.status === 'libere' ? 'Libéré' : 'Gelé'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
