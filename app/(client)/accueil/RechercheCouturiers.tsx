'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Star, Clock, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'

type Couturier = {
  id: string
  nom_atelier: string
  specialite: string
  note_moyenne: number
  delai_moyen_jours: number
  photo_url: string
  profils?: { quartier: string } | null
}

const SPECIALITES = ['Tous', 'Tenues traditionnelles', 'Costumes sur mesure', 'Broderie']

export default function RechercheCouturiers() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous')
  const [couturiers, setCouturiers] = useState<Couturier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  // Fetch couturiers
  useEffect(() => {
    async function fetchCouturiers() {
      setIsLoading(true)
      try {
        let query = supabase
          .from('couturiers')
          .select('id, nom_atelier, specialite, note_moyenne, delai_moyen_jours, photo_url, profils(quartier)')
          .eq('statut_verification', 'actif') // Sécurité : on ne ramène que les vérifiés
        
        // Filtre texte libre
        if (debouncedSearch) {
          query = query.or(`nom_atelier.ilike.%${debouncedSearch}%,specialite.ilike.%${debouncedSearch}%`)
        }

        // Filtre par puce (Chips)
        if (selectedSpecialty !== 'Tous') {
          // On fait un ilike basique car specialite est un varchar
          query = query.ilike('specialite', `%${selectedSpecialty}%`)
        }

        const { data, error } = await query

        if (error) throw error
        
        // Note: Le tri par distance réelle (géoloc_atelier JSONB) nécessite PostGIS ou 
        // un calcul côté client avec navigator.geolocation. Pour ce MVP client-side simple,
        // on triera arbitrairement par la note.
        const sortedData = (data as Couturier[] || []).sort((a, b) => b.note_moyenne - a.note_moyenne)
        setCouturiers(sortedData)

      } catch (err) {
        console.error("Erreur de récupération des couturiers:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCouturiers()
  }, [debouncedSearch, selectedSpecialty, supabase])

  return (
    <div className="w-full">
      
      {/* Barre de recherche Corporate (Style Airbnb) */}
      <div className="relative mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-700 ease-out fill-mode-both z-10 group">
        <div className="absolute inset-0 bg-[#C9A84C]/10 blur-2xl rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"></div>
        <div className="relative bg-[#1B2A4A]/80 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(201,168,76,0.15)] transition-all duration-300 group-focus-within:border-[#C9A84C]/80 group-focus-within:ring-4 group-focus-within:ring-[#C9A84C]/20 group-focus-within:bg-[#1B2A4A]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#C9A84C]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher une spécialité, un nom..."
            className="w-full pl-16 pr-6 py-5 bg-transparent rounded-full text-base lg:text-lg focus:outline-none placeholder:text-white/40 text-white font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filtres par spécialité - Style Onglets (Airbnb/Malt) */}
      <div className="flex gap-6 overflow-x-auto pb-4 mb-8 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both border-b border-white/10">
        {SPECIALITES.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              selectedSpecialty === spec
                ? 'text-[#C9A84C]'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {spec}
            {selectedSpecialty === spec && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A84C] rounded-t-full shadow-[0_-2px_10px_rgba(201,168,76,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/50 mb-6 font-medium tracking-wide animate-in fade-in duration-700 delay-500 fill-mode-both">
        {couturiers.length} COUTURIER{couturiers.length !== 1 ? 'S' : ''} VÉRIFIÉ{couturiers.length !== 1 ? 'S' : ''}
      </p>

      {/* Liste de résultats en grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {isLoading ? (
          // Skeleton loading
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))
        ) : couturiers.length > 0 ? (
          couturiers.map((couturier, index) => (
            <div 
              key={couturier.id}
              className="h-full animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link href={`/couturier/${couturier.id}`} className="block group h-full">
                <div className="flex flex-col gap-3 h-full transition-all duration-300 active:scale-[0.98]">
                  
                  {/* Image / Avatar (Style Airbnb) */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#1B2A4A]/80 border border-white/10 group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] group-hover:border-[#C9A84C]/40 transition-all duration-500">
                    {couturier.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={couturier.photo_url} 
                        alt={couturier.nom_atelier}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-white/20 bg-gradient-to-br from-[#1B2A4A] to-slate-800">
                        {couturier.nom_atelier.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Icône Favoris Flottante */}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:text-red-500 hover:bg-white transition-colors duration-300 z-10" onClick={(e) => { e.preventDefault(); /* TODO Favoris */ }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                    
                    {/* Badge Vérifié Flottant */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-none shadow-sm flex items-center gap-1 font-medium px-2 py-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span className="text-xs">Vérifié</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contenu (Minimaliste et Clair) */}
                  <div className="px-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-base font-semibold text-white truncate pr-2 group-hover:text-[#C9A84C] transition-colors">
                        {couturier.nom_atelier}
                      </h2>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <Star className="h-3.5 w-3.5 text-[#C9A84C] fill-[#C9A84C]" />
                        <span className="text-sm font-medium text-white">{couturier.note_moyenne.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/50 truncate font-light mt-1">
                      {couturier.profils?.quartier || 'Quartier non renseigné'}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-white/70">
                      <span className="text-sm font-medium">{couturier.specialite}</span>
                      <span className="text-white/30 px-1">•</span>
                      <span className="text-sm font-light flex items-center gap-1">
                        Délai {couturier.delai_moyen_jours}j
                      </span>
                    </div>
                  </div>
                  
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-[#1B2A4A]/40 border border-[#C9A84C]/20 rounded-3xl backdrop-blur-md">
            <User className="mx-auto h-12 w-12 text-[#C9A84C]/50 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-white mb-2">Aucun couturier trouvé</h3>
            <p className="text-sm text-white/50 mb-6 font-light">
              Essayez de modifier vos filtres ou d&apos;élargir votre recherche.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-full border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A4A] transition-colors"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('Tous');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}
