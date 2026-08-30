'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { User, Bell, Download, LogOut, ChevronLeft, Trash2, MapPin, Edit2, Check, X, Crosshair, Loader2, Camera } from 'lucide-react'
import Link from 'next/link'
import { updateProfilClient, updateProfilPhoto } from './actions'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

type ProfilClientFormProps = {
  profile: {
    nom: string
    telephone: string
    quartier: string
    photo_url: string | null
    commandes: number
  }
}

export default function ProfilClientForm({ profile: initialProfile }: ProfilClientFormProps) {
  const [notifs, setNotifs] = useState({ push: true, sms: true, email: false })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  
  // Local state for the form
  const [formData, setFormData] = useState({
    nom: initialProfile.nom || '',
    telephone: initialProfile.telephone || '',
    quartier: initialProfile.quartier || '',
    photo_url: initialProfile.photo_url || null
  })

  // Sync state if server data changes (e.g. after a save or another tab update)
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        nom: initialProfile.nom || '',
        telephone: initialProfile.telephone || '',
        quartier: initialProfile.quartier || '',
        photo_url: initialProfile.photo_url || null
      })
    }
  }, [initialProfile, isEditing])

  const handleExport = () => {
    alert("Un fichier JSON contenant l'intégralité de vos données personnelles va être téléchargé.")
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop volumineuse (max 5 Mo).")
      return
    }

    setPhotoLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Non connecté")

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${userData.user.id}/${fileName}`

      // Upload au bucket avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      const photoUrl = urlData.publicUrl

      // Update in DB via Server Action
      const res = await updateProfilPhoto(photoUrl)
      
      if (res?.error) {
        throw new Error(res.error)
      }

      setFormData(prev => ({ ...prev, photo_url: photoUrl }))

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Erreur lors de l'envoi de l'image.")
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.")
      return
    }

    setGeoLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, {
            headers: {
              'Accept-Language': 'fr'
            }
          })
          const data = await response.json()
          
          if (data && data.address) {
            // Cherche le quartier, la banlieue ou la ville
            const quartier = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.city
            if (quartier) {
              setFormData(prev => ({ ...prev, quartier }))
            } else {
              setError("Impossible d'identifier votre quartier avec précision.")
            }
          }
        } catch (err) {
          setError("Erreur lors de la récupération de l'adresse.")
        } finally {
          setGeoLoading(false)
        }
      },
      (err) => {
        setGeoLoading(false)
        setError("Veuillez autoriser l'accès à votre position pour vous localiser.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    
    const data = new FormData()
    data.append('nom', formData.nom)
    data.append('telephone', formData.telephone)
    data.append('quartier', formData.quartier)

    const res = await updateProfilClient(data)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setFormData({
      nom: initialProfile.nom || '',
      telephone: initialProfile.telephone || '',
      quartier: initialProfile.quartier || '',
      photo_url: initialProfile.photo_url || null
    })
    setIsEditing(false)
    setError(null)
  }

  return (
    <div 
      className="min-h-screen pb-20 font-sans relative flex flex-col"
      style={{
        backgroundImage: 'url(/bg_tailor.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay sombre/chic pour l'ambiance couture */}
      <div className="absolute inset-0 bg-[#1A243F]/90 backdrop-blur-sm z-0 pointer-events-none"></div>
      
      {/* Motif décoratif Africain subtil (wax pattern) overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D5B980\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}></div>

      <div className="max-w-md w-full mx-auto relative z-10 flex flex-col h-full">
        <header className="bg-[#0B1120]/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-20 border-b border-white/10 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Link href="/accueil">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-[#D5B980] transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white leading-tight">Mon Profil</h1>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-10 w-10 rounded-full text-[#D5B980] hover:bg-[#D5B980]/10 transition-colors">
              <Edit2 className="w-5 h-5" />
            </Button>
          )}
        </header>

        <main className="flex-1 p-6 space-y-8 mt-2">
          {error && (
            <div className="p-3 bg-red-500/20 text-red-400 text-sm rounded-xl text-center border border-red-500/30">
              {error}
            </div>
          )}

          {/* En-tête profil */}
          <div className="flex flex-col items-center text-center">
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div 
              className="w-28 h-28 bg-[#0B1120] rounded-full flex items-center justify-center mb-5 border-2 border-[#D5B980]/30 shadow-[0_0_20px_rgba(213,185,128,0.15)] relative cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoLoading ? (
                <Loader2 className="w-8 h-8 text-[#D5B980] animate-spin" />
              ) : formData.photo_url ? (
                <>
                  <Image src={formData.photo_url} alt="Photo de profil" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <User className="w-12 h-12 text-[#D5B980]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              )}
              
              {!photoLoading && (
                <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#0B1120] z-10"></div>
              )}
            </div>
            
            {isEditing ? (
              <Input 
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="text-center text-xl font-bold text-white bg-white/5 border-white/20 rounded-xl focus:border-[#D5B980] h-12 w-3/4 mb-3"
                placeholder="Votre nom"
              />
            ) : (
              <h2 className="text-3xl font-bold text-white mb-1">{formData.nom || 'Client'}</h2>
            )}

            {!isEditing && (
              <p className="text-white/60 flex items-center justify-center gap-2 mt-1 font-medium">
                <MapPin className="w-4 h-4 text-[#D5B980]" /> {formData.quartier || 'Non défini'}
              </p>
            )}

            <div className="mt-5 bg-[#D5B980]/10 border border-[#D5B980]/30 px-5 py-2 rounded-full text-[#D5B980] text-sm font-semibold tracking-wide">
              {initialProfile.commandes} tenues commandées
            </div>
          </div>

          {/* Coordonnées */}
          <Card className="border-white/10 shadow-lg rounded-3xl overflow-hidden bg-[#0B1120]/60 backdrop-blur-md">
            <CardHeader className="bg-white/5 pb-4 border-b border-white/10">
              <CardTitle className="text-xs text-[#D5B980] font-bold uppercase tracking-widest">Mes informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-medium text-white/70 whitespace-nowrap">Téléphone</span>
                {isEditing ? (
                  <Input 
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="text-right text-white font-bold bg-white/5 border-white/20 rounded-xl focus:border-[#D5B980] h-10"
                    placeholder="+237 ..."
                  />
                ) : (
                  <span className="font-bold text-white truncate">{formData.telephone || 'Non défini'}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-sm font-medium text-white/70 whitespace-nowrap">Quartier préféré</span>
                  {isEditing ? (
                    <Input 
                      value={formData.quartier}
                      onChange={(e) => setFormData({...formData, quartier: e.target.value})}
                      className="text-right text-white font-bold bg-white/5 border-white/20 rounded-xl focus:border-[#D5B980] h-10"
                      placeholder="Ex: Bonamoussadi"
                    />
                  ) : (
                    <span className="font-bold text-white truncate">{formData.quartier || 'Non défini'}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleGeolocate} 
                      disabled={geoLoading}
                      className="text-xs text-[#D5B980] hover:text-[#D5B980] hover:bg-[#D5B980]/10 flex items-center gap-1.5 h-8 rounded-lg px-2"
                    >
                      {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                      {geoLoading ? "Recherche..." : "Me localiser (GPS)"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex gap-4 pt-2">
              <Button onClick={cancelEdit} variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold" disabled={loading}>
                <X className="w-5 h-5 mr-2" /> Annuler
              </Button>
              <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-[#D5B980] text-[#1A243F] hover:bg-[#D5B980]/90 font-bold shadow-lg" disabled={loading}>
                <Check className="w-5 h-5 mr-2" /> {loading ? '...' : 'Enregistrer'}
              </Button>
            </div>
          )}

          {!isEditing && (
            <>
              {/* Notifications */}
              <Card className="border-white/10 shadow-lg rounded-3xl overflow-hidden bg-[#0B1120]/60 backdrop-blur-md">
                <CardHeader className="bg-white/5 pb-4 border-b border-white/10">
                  <CardTitle className="text-xs text-[#D5B980] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Préférences de notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white block mb-1">Push (Application)</span>
                      <span className="text-xs text-white/50">Mise à jour en temps réel</span>
                    </div>
                    <Switch checked={notifs.push} onCheckedChange={(v) => setNotifs(prev => ({...prev, push: v}))} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white block mb-1">SMS</span>
                      <span className="text-xs text-white/50">Alertes de livraison</span>
                    </div>
                    <Switch checked={notifs.sms} onCheckedChange={(v) => setNotifs(prev => ({...prev, sms: v}))} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white block mb-1">E-mail</span>
                      <span className="text-xs text-white/50">Reçus de paiement</span>
                    </div>
                    <Switch checked={notifs.email} onCheckedChange={(v) => setNotifs(prev => ({...prev, email: v}))} />
                  </div>
                </CardContent>
              </Card>

              {/* Données et sécurité */}
              <div className="space-y-4 pt-4">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm" onClick={handleExport}>
                  <Download className="w-5 h-5 mr-4 text-[#D5B980]" /> 
                  <span className="font-semibold text-base">Télécharger mes données</span>
                </Button>
                
                <Link href="/api/auth/logout" className="block w-full">
                  <Button variant="outline" className="w-full justify-start rounded-2xl h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm">
                    <LogOut className="w-5 h-5 mr-4 text-[#D5B980]" /> 
                    <span className="font-semibold text-base">Se déconnecter (Sécurisé)</span>
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start rounded-2xl h-14 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 text-red-400 transition-all mt-8">
                  <Trash2 className="w-5 h-5 mr-4" /> 
                  <span className="font-semibold text-base">Supprimer mon compte</span>
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
