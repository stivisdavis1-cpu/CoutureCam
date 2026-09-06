import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Search, FileText, ArrowRightLeft, Landmark } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function AdminFinancePage() {
  const supabase = await createClient()

  // Mock data for Escrow / Finance
  const mockTransactions = [
    { id: 'TRX-1095', type: 'acompte_client', amount: 15000, date: '2026-09-06T10:00:00.000Z', status: 'complete', client: 'Alice M.', couturier: 'Couture Elegance' },
    { id: 'TRX-1094', type: 'payout_couturier', amount: 22500, date: '2026-09-06T09:00:00.000Z', status: 'complete', client: 'Jean T.', couturier: 'Couture Express' },
    { id: 'TRX-1093', type: 'commission_plateforme', amount: 2500, date: '2026-09-06T09:00:00.000Z', status: 'complete', client: '-', couturier: '-' },
    { id: 'TRX-1092', type: 'remboursement_client', amount: 15000, date: '2026-09-05T10:00:00.000Z', status: 'complete', client: 'Sophie K.', couturier: 'Mode Wax' },
  ]

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6 shrink-0">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <Link href="/dashboard"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Vue d'ensemble</div></Link>
          <div className="bg-accent text-primary px-4 py-2 rounded-lg font-bold shadow-sm">Finance & Trésorerie</div>
          <Link href="/utilisateurs"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Utilisateurs</div></Link>
          <Link href="/couturiers/validation"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Validation KYC</div></Link>
          <Link href="/litiges/1"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Litiges</div></Link>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-6xl">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Finance & Trésorerie</h1>
            <p className="text-muted-foreground mt-1">Gestion des flux Mobile Money et du compte de séquestre</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full shadow-sm"><FileText className="w-4 h-4 mr-2" /> Exporter CSV</Button>
            <Button className="rounded-full shadow-sm bg-primary text-white hover:bg-primary/90"><ArrowRightLeft className="w-4 h-4 mr-2" /> Rapprochement Bancaire</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm rounded-3xl bg-navy text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <CardContent className="p-6">
              <Landmark className="w-8 h-8 text-gold mb-4" />
              <p className="text-sm font-medium text-white/70 mb-1">Solde Séquestre Actuel</p>
              <h3 className="text-3xl font-bold text-white">4,250,000 FCFA</h3>
              <p className="text-xs text-white/50 mt-2">Couvre 112 commandes en cours</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <ArrowRightLeft className="w-8 h-8 text-emerald mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Volume Payouts (30j)</p>
              <h3 className="text-3xl font-bold text-foreground">8,100,000 FCFA</h3>
              <p className="text-xs text-emerald mt-2">Transférés aux couturiers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Commissions (30j)</p>
              <h3 className="text-3xl font-bold text-foreground">1,215,000 FCFA</h3>
              <p className="text-xs text-muted-foreground mt-2">Frais de plateforme déduits</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
            <h3 className="font-bold text-lg text-navy">Journal des Transactions</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher TRX, client..." className="pl-9 rounded-full h-9 bg-white" />
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">ID Transaction</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Acteurs</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">{trx.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(trx.date).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {trx.type === 'sequestre_entrant' ? 'Séquestre Entrant' : 
                       trx.type === 'payout_couturier' ? 'Payout Couturier' : 
                       trx.type === 'commission_plateforme' ? 'Commission' : 'Remboursement'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="text-muted-foreground">De:</span> {trx.client} <br/>
                        <span className="text-muted-foreground">Vers:</span> {trx.couturier}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {trx.type === 'commission_plateforme' ? '+' : ''}{trx.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${trx.status === 'bloque' ? 'bg-gold/10 text-gold hover:bg-gold/20 border-0' : 'bg-emerald/10 text-emerald hover:bg-emerald/20 border-0'}`}>
                        {trx.status === 'bloque' ? 'Séquestré' : 'Complété'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/50 flex justify-center bg-muted/10">
            <Button variant="ghost" className="text-sm rounded-full">Afficher plus</Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
