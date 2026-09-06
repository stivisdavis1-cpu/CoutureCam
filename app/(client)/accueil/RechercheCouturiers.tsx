'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Formule de Haversine pour la distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
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
  geoloc_atelier?: { lat: number, lng: number } | null
  distance?: number
  profils?: { quartier: string } | null
}

const SPECIALITES = ['Tous', 'Tenues traditionnelles', 'Costumes sur mesure', 'Broderie']

export default function RechercheCouturiers() {
  const supabase = createClient()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous')
  const [couturiers, setCouturiers] = useState<Couturier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoris, setFavoris] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [maxDistance, setMaxDistance] = useState<number | null>(null)

  useEffect(() => {
    async function fetchFavoris() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('favoris').select('couturier_id').eq('client_id', user.id)
        if (data) setFavoris(data.map(f => f.couturier_id))
      }
    }
    fetchFavoris()
  }, [supabase])

  const toggleFavori = async (couturierId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    if (favoris.includes(couturierId)) {
      setFavoris(prev => prev.filter(id => id !== couturierId))
      await supabase.from('favoris').delete().eq('client_id', user.id).eq('couturier_id', couturierId)
    } else {
      setFavoris(prev => [...prev, couturierId])
      await supabase.from('favoris').insert({ client_id: user.id, couturier_id: couturierId })
    }
  }

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
          setMaxDistance(5)
        },
        (error) => console.error("Erreur géolocalisation:", error)
      )
    }
  }

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
          .select('id, nom_atelier, specialite, note_moyenne, delai_moyen_jours, photo_url, geoloc_atelier, profils(quartier)')
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
        // Transform the data so profils is a single object instead of an array
        let transformedData: Couturier[] = (data || []).map((item: any) => {
          let distance = undefined;
          if (userLocation && item.geoloc_atelier) {
            distance = calculateDistance(userLocation.lat, userLocation.lng, item.geoloc_atelier.lat, item.geoloc_atelier.lng);
          }
          return {
            ...item,
            distance,
            profils: Array.isArray(item.profils) ? item.profils[0] : item.profils
          }
        });

        if (userLocation && maxDistance) {
          transformedData = transformedData.filter(item => item.distance !== undefined && item.distance <= maxDistance);
        }

        const sortedData = transformedData.sort((a, b) => {
          if (userLocation && a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return b.note_moyenne - a.note_moyenne;
        })
        setCouturiers(sortedData)

      } catch (err) {
        console.error("Erreur de récupération des couturiers:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCouturiers()
  }, [debouncedSearch, selectedSpecialty, supabase, userLocation, maxDistance])

  return (
    <div className="w-full">
      
      {/* Barre de recherche Haute Couture */}
      <div className="relative mb-12 w-full animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 delay-200 ease-out fill-mode-both z-10 group max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-[#C9A84C]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(201,168,76,0.08)] transition-all duration-500 ease-out group-focus-within:ring-4 group-focus-within:ring-[#C9A84C]/10 border border-gray-100/50 group-focus-within:border-[#C9A84C]/30 group-focus-within:bg-white group-hover:-translate-y-0.5">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-[#C9A84C] transition-colors duration-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher une spécialité, un nom, un atelier..."
            className="w-full pl-16 pr-6 py-5 bg-transparent rounded-full text-base lg:text-lg focus:outline-none placeholder:text-gray-400 text-gray-900 font-medium transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filtres géolocalisation & distance */}
      <div className="flex justify-center mb-6 animate-in fade-in zoom-in-95 delay-300">
        <Button 
          variant={userLocation && maxDistance ? 'default' : 'outline'}
          onClick={userLocation ? () => setMaxDistance(maxDistance ? null : 5) : handleGeolocation}
          className={`rounded-full px-5 py-2 flex items-center gap-2 transition-all ${userLocation && maxDistance ? 'bg-[#C9A84C] hover:bg-[#b09341] text-white border-[#C9A84C]' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}
        >
          <MapPin className="w-4 h-4" />
          {userLocation ? (maxDistance ? 'À moins de 5 km' : 'Autour de moi') : 'Autour de moi'}
        </Button>
      </div>

      {/* Filtres par spécialité - Style Chic */}
      <div className="flex gap-8 overflow-x-auto pb-5 mb-10 scrollbar-hide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both border-b border-gray-100 justify-center">
        {SPECIALITES.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-all duration-500 ease-out ${
              selectedSpecialty === spec
                ? 'text-[#C9A84C] scale-105'
                : 'text-gray-400 hover:text-gray-700 hover:scale-105'
            }`}
          >
            {spec}
            {selectedSpecialty === spec && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#C9A84C]/50 via-[#C9A84C] to-[#C9A84C]/50 rounded-t-full shadow-[0_-2px_10px_rgba(201,168,76,0.4)] animate-in zoom-in-75 duration-300"></div>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-6 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[700ms] fill-mode-both uppercase">
        {couturiers.length} Couturier{couturiers.length !== 1 ? 's' : ''} Vérifié{couturiers.length !== 1 ? 's' : ''}
      </p>

      {/* Liste de résultats en grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {isLoading ? (
          // Skeleton loading
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: `${i * 150 + 900}ms` }}>
              <div className="aspect-[4/3] bg-gray-100 rounded-3xl border border-gray-50"></div>
              <div className="h-4 bg-gray-200 rounded-full w-3/4 ml-2"></div>
              <div className="h-3 bg-gray-100 rounded-full w-1/2 ml-2"></div>
            </div>
          ))
        ) : couturiers.length > 0 ? (
          couturiers.map((couturier, index) => (
            <div 
              key={couturier.id}
              className="h-full animate-in zoom-in-95 fade-in slide-in-from-bottom-12 duration-1000 ease-out fill-mode-both"
              style={{ animationDelay: `${index * 150 + 900}ms` }}
            >
              <Link href={`/couturier/${couturier.id}`} className="block group h-full">
                <div className="flex flex-col gap-3 h-full transition-all duration-500 ease-out hover:-translate-y-2">
                  
                  {/* Image / Avatar */}
                  <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_rgba(201,168,76,0.08)] group-hover:border-[#C9A84C]/30 transition-all duration-500 ease-out z-10">
                    {couturier.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={couturier.photo_url} 
                        alt={couturier.nom_atelier}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-gray-300 bg-gray-50">
                        {couturier.nom_atelier.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Icône Favoris Flottante */}
                    <button 
                      className={`absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md transition-all duration-500 ease-out z-20 hover:scale-110 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.05)] ${favoris.includes(couturier.id) ? 'text-red-500 shadow-[0_8px_25px_rgba(220,38,38,0.15)]' : 'text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-[0_8px_25px_rgba(220,38,38,0.15)]'}`}
                      onClick={(e) => toggleFavori(couturier.id, e)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={favoris.includes(couturier.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                    
                    {/* Badge Vérifié Flottant */}
                    <div className="absolute top-4 left-4 z-20 group-hover:translate-y-[-2px] transition-transform duration-500">
                      <Badge variant="secondary" className="bg-white/95 backdrop-blur-md text-gray-900 border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_20px_rgba(201,168,76,0.15)] flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-full transition-all duration-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span className="text-xs font-semibold tracking-wide">Vérifié</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contenu (Minimaliste et Clair) */}
                  <div className="px-2 pt-2 relative z-0 group-hover:translate-y-[-2px] transition-transform duration-500">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-900 truncate pr-2 group-hover:text-[#C9A84C] transition-colors duration-300">
                        {couturier.nom_atelier}
                      </h2>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-2 py-0.5 rounded-full border border-gray-100 group-hover:border-[#C9A84C]/20 transition-colors duration-500">
                        <Star className="h-3.5 w-3.5 text-[#C9A84C] fill-[#C9A84C]" />
                        <span className="text-xs font-bold text-gray-900">{couturier.note_moyenne.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 truncate mt-1.5">
                      <span className="truncate">{couturier.profils?.quartier || 'Quartier non renseigné'}</span>
                      {couturier.distance !== undefined && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-[#C9A84C] font-medium shrink-0">{couturier.distance.toFixed(1)} km</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5 text-gray-500">
                      <span className="text-sm bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{couturier.specialite}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {couturier.delai_moyen_jours}j
                      </span>
                    </div>
                  </div>
                  
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white border border-gray-100 rounded-[24px] shadow-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 delay-[900ms] fill-mode-both">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun couturier trouvé</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Essayez de modifier vos filtres ou d&apos;élargir votre recherche.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-sm font-medium px-6"
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
