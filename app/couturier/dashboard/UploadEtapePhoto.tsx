'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { validerEtapePhoto } from './actions'

export default function UploadEtapePhoto({ commandeId }: { commandeId: string }) {
  const [status, setStatus] = useState<'idle' | 'capturing' | 'uploading' | 'success'>('idle')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleCaptureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileToUpload(file)
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
      setStatus('capturing')
    }
  }

  const handleUpload = () => {
    if (!fileToUpload) return
    setStatus('uploading')
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          try {
            // 1. Upload vers Supabase Storage
            const fileExt = fileToUpload.name.split('.').pop() || 'jpg'
            const fileName = `${commandeId}-${Date.now()}.${fileExt}`
            const filePath = `etapes/${fileName}`

            const { error: uploadError, data } = await supabase.storage
              .from('etapes-photos')
              .upload(filePath, fileToUpload)

            if (uploadError) {
              console.error('Erreur upload:', uploadError)
              alert("L'upload a échoué. Le bucket 'etapes-photos' est-il configuré ?")
              setStatus('idle')
              return
            }

            const { data: publicUrlData } = supabase.storage
              .from('etapes-photos')
              .getPublicUrl(filePath)

            // 2. Appel au Server Action pour insertion BDD avec horodatage serveur
            const res = await validerEtapePhoto(commandeId, publicUrlData.publicUrl, lat, lng)
            
            if (res.success) {
              setStatus('success')
            } else {
              alert("Erreur BDD: " + res.error)
              setStatus('idle')
            }
          } catch (error) {
            console.error("Erreur générale:", error)
            setStatus('idle')
          }
        },
        (error) => {
          console.error("Geoloc error:", error)
          alert("L'accès à la localisation est obligatoire pour garantir l'authenticité de l'étape. Veuillez l'autoriser dans votre navigateur.")
          setStatus('idle')
          setPhotoPreview(null)
          setFileToUpload(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      alert("Votre navigateur ne supporte pas la géolocalisation.")
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 text-emerald-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-8 h-8 mb-2" />
        <p className="font-semibold text-sm">Photo envoyée avec succès</p>
        <p className="text-xs mt-1 text-emerald-500">Horodatée par le serveur et géolocalisée.</p>
      </div>
    )
  }

  if (photoPreview && status === 'capturing') {
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreview} alt="Aperçu" className="w-full h-full object-contain" />
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <MapPin className="w-3 h-3" /> Geoloc requise
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => { setPhotoPreview(null); setFileToUpload(null); setStatus('idle'); }}>
            Reprendre
          </Button>
          <Button className="flex-1 rounded-full bg-black text-white hover:bg-black/90" onClick={handleUpload}>
            Envoyer l'étape
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button 
        onClick={handleCaptureClick}
        disabled={status === 'uploading'}
        className="w-full border-2 border-dashed border-gray-200 hover:border-black/50 bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-black transition-all group"
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="w-8 h-8 mb-2 animate-spin text-black" />
            <span className="text-sm font-medium text-black">Horodatage & envoi...</span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Prendre la photo de l'étape</span>
            <span className="text-[10px] text-gray-400 mt-1">Caméra arrière uniquement</span>
          </>
        )}
      </button>
    </div>
  )
}
