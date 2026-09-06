'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Search, Shield, KeyRound, MonitorSmartphone, Clock, Download } from 'lucide-react'
import Link from 'next/link'

export default function AdminSecuritePage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'sessions' | 'auth'>('audit')

  // Mock data Audit Log
  const mockAuditLogs = [
    { id: 'log_901', acteur: 'admin_1', role: 'admin', action: 'activer_couturier', cible: 'usr_c12', ip: '102.134.12.5', date: '2026-09-06T10:00:00.000Z' },
    { id: 'log_902', acteur: 'admin_2', role: 'finance', action: 'valider_payout', cible: 'trx_1094', ip: '197.234.45.6', date: '2026-09-06T09:00:00.000Z' },
    { id: 'log_903', acteur: 'admin_1', role: 'admin', action: 'bannir_utilisateur', cible: 'usr_c08', ip: '102.134.12.5', date: '2026-09-05T10:00:00.000Z' },
  ]

  // Mock data Roles
  const rolesPermissions = [
    { ressource: 'Paiements Séquestres', admin: true, finance: true, mediateur: false, support: false },
    { ressource: 'KYC Couturiers', admin: true, finance: false, mediateur: false, support: true },
    { ressource: 'Arbitrage Litiges', admin: true, finance: false, mediateur: true, support: false },
    { ressource: 'Configuration Système', admin: true, finance: false, mediateur: false, support: false },
  ]

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      {/* Sidebar - Fixée pour la V2 */}
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6 shrink-0">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <Link href="/admin/dashboard"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Vue d'ensemble</div></Link>
          <Link href="/admin/finance"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Finance & Trésorerie</div></Link>
          <Link href="/admin/utilisateurs"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Utilisateurs</div></Link>
          <div className="bg-accent text-primary px-4 py-2 rounded-lg font-bold shadow-sm flex items-center justify-between">
            Sécurité & Audit <ShieldCheck className="w-4 h-4" />
          </div>
          <Link href="/admin/parametres"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Paramètres</div></Link>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-6xl">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Sécurité & Audit</h1>
            <p className="text-muted-foreground mt-1">Supervision globale, contrôle d'accès et traçabilité</p>
          </div>
          <Button variant="outline" className="rounded-full shadow-sm bg-white"><Download className="w-4 h-4 mr-2" /> Exporter le journal complet</Button>
        </header>

        <div className="flex gap-2 mb-6 bg-white p-2 rounded-full shadow-sm w-fit">
          <Button variant={activeTab === 'audit' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('audit')}>
            <Clock className="w-4 h-4 mr-2" /> Journal d'Audit
          </Button>
          <Button variant={activeTab === 'roles' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('roles')}>
            <Shield className="w-4 h-4 mr-2" /> Rôles & Permissions
          </Button>
          <Button variant={activeTab === 'sessions' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('sessions')}>
            <MonitorSmartphone className="w-4 h-4 mr-2" /> Sessions Actives
          </Button>
          <Button variant={activeTab === 'auth' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('auth')}>
            <KeyRound className="w-4 h-4 mr-2" /> 2FA & Auth
          </Button>
        </div>

        {activeTab === 'audit' && (
          <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-lg text-navy">Traces immuables (Audit Log)</h3>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher IP, admin, action..." className="pl-9 rounded-full h-9 bg-white" />
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Horodatage</th>
                    <th className="px-6 py-4">Acteur (IP)</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Cible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{new Date(log.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{log.acteur} <Badge variant="outline" className="ml-1 text-[10px]">{log.role}</Badge></div>
                        <div className="text-xs text-muted-foreground">{log.ip}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-navy">{log.action}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{log.cible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'roles' && (
          <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-lg font-bold text-navy">Matrice RBAC (Contrôle d'accès)</CardTitle>
            </CardHeader>
            <div className="p-0">
              <table className="w-full text-sm text-center">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left">Ressource Critique</th>
                    <th className="px-6 py-4">Admin</th>
                    <th className="px-6 py-4">Finance</th>
                    <th className="px-6 py-4">Médiateur</th>
                    <th className="px-6 py-4">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rolesPermissions.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/10">
                      <td className="px-6 py-4 text-left font-semibold">{row.ressource}</td>
                      <td className="px-6 py-4">{row.admin ? '✅' : '❌'}</td>
                      <td className="px-6 py-4">{row.finance ? '✅' : '❌'}</td>
                      <td className="px-6 py-4">{row.mediateur ? '✅' : '❌'}</td>
                      <td className="px-6 py-4">{row.support ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border/50 bg-muted/5 flex justify-end">
              <Button disabled variant="outline" className="rounded-full">Modification réservée au super_admin</Button>
            </div>
          </Card>
        )}

        {activeTab === 'sessions' && (
          <div className="text-center py-20 text-muted-foreground animate-in fade-in">
            <MonitorSmartphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>1 Session active (Vous-même)</p>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-emerald/30 shadow-sm rounded-3xl bg-emerald/5">
              <CardContent className="p-6 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-emerald mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-emerald mb-2">Authentification forte exigée</h3>
                  <p className="text-sm text-emerald/80 leading-relaxed">
                    Le 2FA (TOTP) est forcé sur l'ensemble de l'instance pour tous les rôles administratifs. L'accès direct via mot de passe simple est bloqué au niveau du Supabase Auth Middleware.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  )
}
