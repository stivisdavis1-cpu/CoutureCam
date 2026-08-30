'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert, UserX, UserCheck, MoreVertical, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function AdminUtilisateursPage() {
  const [filterRole, setFilterRole] = useState<'tous' | 'client' | 'couturier'>('tous')
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // Mock data for Users
  const mockUsers = [
    { id: 'usr_1', nom: 'Alice M.', role: 'client', phone: '+237 690 00 00 01', status: 'actif', joined: '2026-01-15' },
    { id: 'usr_2', nom: 'Sape Elite', role: 'couturier', phone: '+237 670 00 00 02', status: 'actif', joined: '2026-02-10' },
    { id: 'usr_3', nom: 'Jean T.', role: 'client', phone: '+237 690 00 00 03', status: 'suspendu', joined: '2026-05-20' },
    { id: 'usr_4', nom: 'Mode Wax', role: 'couturier', phone: '+237 670 00 00 04', status: 'banni', joined: '2026-03-05' },
    { id: 'usr_5', nom: 'Sophie K.', role: 'client', phone: '+237 690 00 00 05', status: 'actif', joined: '2026-07-12' },
  ]

  const filteredUsers = mockUsers.filter(u => filterRole === 'tous' || u.role === filterRole)

  const handleAction = (userId: string, action: 'suspendre' | 'bannir' | 'reactiver') => {
    setActionStatus(`Action ${action} en cours pour l'utilisateur ${userId}...`)
    // Simulation appel Supabase / Edge function pour bloquer auth + log audit
    setTimeout(() => {
      setActionStatus(`Action ${action} terminée avec succès (Audit log enregistré).`)
      setTimeout(() => setActionStatus(null), 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex">
      <aside className="w-64 border-r border-border min-h-screen bg-white hidden md:block rounded-l-3xl p-6 mr-6 shrink-0">
        <h2 className="text-xl font-bold text-navy mb-8">Admin CoutureCam</h2>
        <nav className="space-y-2 text-sm font-medium">
          <Link href="/dashboard"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Vue d'ensemble</div></Link>
          <Link href="/finance"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Finance & Trésorerie</div></Link>
          <div className="bg-accent text-primary px-4 py-2 rounded-lg font-bold shadow-sm">Utilisateurs</div>
          <Link href="/couturiers/validation"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Validation KYC</div></Link>
          <Link href="/litiges/1"><div className="text-muted-foreground px-4 py-2 hover:bg-muted rounded-lg cursor-pointer">Litiges</div></Link>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-6xl">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">Supervision des clients et couturiers (Blocage, Modération)</p>
          </div>
          {actionStatus && (
            <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {actionStatus}
            </div>
          )}
        </header>

        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
          <div className="p-6 border-b border-border/50 flex flex-wrap gap-4 justify-between items-center bg-muted/10">
            <div className="flex gap-2">
              <Button 
                variant={filterRole === 'tous' ? 'default' : 'outline'} 
                className="rounded-full shadow-none h-9"
                onClick={() => setFilterRole('tous')}
              >Tous</Button>
              <Button 
                variant={filterRole === 'client' ? 'default' : 'outline'} 
                className="rounded-full shadow-none h-9"
                onClick={() => setFilterRole('client')}
              >Clients</Button>
              <Button 
                variant={filterRole === 'couturier' ? 'default' : 'outline'} 
                className="rounded-full shadow-none h-9"
                onClick={() => setFilterRole('couturier')}
              >Couturiers</Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Nom ou téléphone..." className="pl-9 rounded-full h-9 bg-white" />
            </div>
          </div>
          
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Inscrit le</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-bold text-foreground">{user.nom}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.phone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(user.joined).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${
                        user.status === 'actif' ? 'bg-emerald/10 text-emerald border-0 hover:bg-emerald/20' : 
                        user.status === 'suspendu' ? 'bg-gold/10 text-gold border-0 hover:bg-gold/20' : 
                        'bg-red/10 text-red border-0 hover:bg-red/20'
                      }`}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'actif' ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-full text-gold border-gold/50 hover:bg-gold/10" onClick={() => handleAction(user.id, 'suspendre')}>
                            <ShieldAlert className="w-4 h-4 mr-1" /> Suspendre
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full text-red border-red/50 hover:bg-red/10" onClick={() => handleAction(user.id, 'bannir')}>
                            <UserX className="w-4 h-4 mr-1" /> Bannir
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="rounded-full text-emerald border-emerald/50 hover:bg-emerald/10" onClick={() => handleAction(user.id, 'reactiver')}>
                          <UserCheck className="w-4 h-4 mr-1" /> Réactiver
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/50 flex justify-between items-center text-sm text-muted-foreground bg-muted/10">
            <span>Affichage de {filteredUsers.length} utilisateurs</span>
            <div className="flex gap-2">
              <Button variant="outline" className="h-8 rounded-full shadow-none" disabled>Précédent</Button>
              <Button variant="outline" className="h-8 rounded-full shadow-none">Suivant</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
