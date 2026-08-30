// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Settings, Globe, Flag, Edit, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminParametresPage() {
  const [activeTab, setActiveTab] = useState<'zones' | 'flags'>('zones')
  const [saving, setSaving] = useState(false)

  // Mock Zones
  const mockZones = [
    { id: 'z1', pays: 'Cameroun', ville: 'Douala', statut: 'actif', devise: 'FCFA', commission: '5%' },
    { id: 'z2', pays: 'Cameroun', ville: 'Yaoundé', statut: 'pilote', devise: 'FCFA', commission: '4%' },
  ]

  // Mock Feature Flags
  const [flags, setFlags] = useState([
    { id: 'ff_momo', cle: 'paiement_mtn_momo', desc: 'Activer MTN Mobile Money', actif: true, rollout: 100 },
    { id: 'ff_om', cle: 'paiement_orange_money', desc: 'Activer Orange Money', actif: true, rollout: 100 },
    { id: 'ff_chat', cle: 'messagerie_in_app', desc: 'Activer le chat intégré commande', actif: false, rollout: 20 },
  ])

  const toggleFlag = (id: string) => {
    setSaving(true)
    setTimeout(() => {
      setFlags(prev => prev.map(f => f.id === id ? { ...f, actif: !f.actif } : f))
      setSaving(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6 shrink-0">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <Link href="/admin/dashboard"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Vue d'ensemble</div></Link>
          <Link href="/admin/finance"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Finance & Trésorerie</div></Link>
          <Link href="/admin/utilisateurs"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Utilisateurs</div></Link>
          <Link href="/admin/securite"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Sécurité & Audit</div></Link>
          <div className="bg-accent text-primary px-4 py-2 rounded-lg font-bold shadow-sm flex items-center justify-between">
            Paramètres <Settings className="w-4 h-4" />
          </div>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Paramètres Plateforme</h1>
          <p className="text-muted-foreground mt-1">Configuration multi-villes et activation progressive des fonctionnalités</p>
        </header>

        <div className="flex gap-2 mb-6 bg-white p-2 rounded-full shadow-sm w-fit">
          <Button variant={activeTab === 'zones' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('zones')}>
            <Globe className="w-4 h-4 mr-2" /> Zones Géographiques
          </Button>
          <Button variant={activeTab === 'flags' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('flags')}>
            <Flag className="w-4 h-4 mr-2" /> Feature Flags
          </Button>
        </div>

        {activeTab === 'zones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {mockZones.map(zone => (
              <Card key={zone.id} className="border-border/50 shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg text-navy">{zone.ville}</CardTitle>
                    <p className="text-xs text-muted-foreground">{zone.pays}</p>
                  </div>
                  <Badge variant={zone.statut === 'actif' ? 'default' : 'secondary'} className="rounded-full uppercase text-[10px]">
                    {zone.statut}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Devise</span>
                    <span className="font-semibold">{zone.devise}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Taux de commission</span>
                    <span className="font-semibold text-primary">{zone.commission}</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-full mt-2"><Edit className="w-4 h-4 mr-2" /> Modifier la zone</Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="h-full min-h-[200px] rounded-3xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col gap-2">
              <Globe className="w-8 h-8" />
              Ouvrir une nouvelle zone
            </Button>
          </div>
        )}

        {activeTab === 'flags' && (
          <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald" /> Toute modification prend effet immédiatement via le cache Redis.
              </div>
              
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border border-border/50 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{flag.cle}</span>
                        {flag.rollout < 100 && (
                          <Badge variant="outline" className="text-[10px] text-terracotta border-terracotta bg-terracotta/5">Déploiement progressif ({flag.rollout}%)</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">{flag.actif ? 'Actif' : 'Inactif'}</span>
                      <Switch 
                        checked={flag.actif}
                        onCheckedChange={() => toggleFlag(flag.id)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

      </main>
    </div>
  )
}
