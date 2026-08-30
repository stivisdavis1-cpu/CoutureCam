'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Star, Download, LogOut, ChevronLeft, Trash2, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function CouturierProfilPage() {
  const [notifs, setNotifs] = useState({ push: true, sms: false, email: true })

  // Mock
  const profile = {
    nom_atelier: 'Sape Elite',
    nom_gerant: 'Sébastien K.',
    telephone: '+237 670 12 34 56',
    quartier: 'Akwa',
    note: 4.8,
    avis: 124,
    statut: 'actif'
  }

  const handleExport = () => {
    // Appel RPC exporter_mes_donnees
    alert("Un fichier JSON contenant l'intégralité de vos données personnelles va être téléchargé.")
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto flex flex-col">
      <header className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-border/50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/couturier/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-primary leading-tight">Mon Profil</h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Header Profil */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
            <User className="w-10 h-10 text-primary" />
            <Badge className="absolute -bottom-2 bg-emerald text-white border-2 border-white rounded-full">Vérifié</Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{profile.nom_atelier}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {profile.quartier} • Géré par {profile.nom_gerant}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="font-bold text-lg">{profile.note}</span>
            <span className="text-sm text-muted-foreground">({profile.avis} avis)</span>
          </div>
        </div>

        {/* Coordonnées */}
        <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border/30">
            <CardTitle className="text-sm text-muted-foreground font-semibold uppercase">Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Téléphone (Login)</span>
              <span className="font-semibold">{profile.telephone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Adresse d'atelier</span>
              <span className="font-semibold text-right max-w-[200px] truncate">{profile.quartier}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border/30">
            <CardTitle className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-2">
              <Bell className="w-4 h-4" /> Préférences de notification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold block">Push (Application)</span>
                <span className="text-xs text-muted-foreground">Recommandé pour le suivi</span>
              </div>
              <Switch checked={notifs.push} onCheckedChange={(v) => setNotifs(prev => ({...prev, push: v}))} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold block">SMS</span>
                <span className="text-xs text-muted-foreground">Facturation possible</span>
              </div>
              <Switch checked={notifs.sms} onCheckedChange={(v) => setNotifs(prev => ({...prev, sms: v}))} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold block">E-mail</span>
                <span className="text-xs text-muted-foreground">Pour les devis et relevés</span>
              </div>
              <Switch checked={notifs.email} onCheckedChange={(v) => setNotifs(prev => ({...prev, email: v}))} />
            </div>
          </CardContent>
        </Card>

        {/* Données et sécurité */}
        <div className="space-y-3 pt-4">
          <Button variant="outline" className="w-full justify-start rounded-2xl h-12 border-border/50 hover:bg-muted/30" onClick={handleExport}>
            <Download className="w-4 h-4 mr-3 text-primary" /> 
            <span className="font-semibold text-foreground">Télécharger mes données (RGPD)</span>
          </Button>
          
          <Button variant="outline" className="w-full justify-start rounded-2xl h-12 border-border/50 hover:bg-muted/30">
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" /> 
            <span className="font-semibold text-foreground">Se déconnecter</span>
          </Button>

          <Button variant="outline" className="w-full justify-start rounded-2xl h-12 border-red/20 hover:bg-red/5 mt-8">
            <Trash2 className="w-4 h-4 mr-3 text-red" /> 
            <span className="font-semibold text-red">Supprimer mon compte</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
