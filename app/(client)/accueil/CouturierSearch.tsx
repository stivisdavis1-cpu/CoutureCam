'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useTransition, useState, useEffect } from 'react'

const SPECIALITES = ['Tenue traditionnelle', 'Costume', 'Sur mesure', 'Retouches']

export default function CouturierSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (query) {
        params.set('q', query)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, pathname, router, searchParams])

  const toggleSpecialite = (spec: string) => {
    const params = new URLSearchParams(searchParams)
    const currentSpec = params.get('specialite')
    if (currentSpec === spec) {
      params.delete('specialite')
    } else {
      params.set('specialite', spec)
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Rechercher un couturier, un style..."
          className="pl-10 rounded-xl bg-white shadow-sm border border-border/50 focus-visible:ring-primary h-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Badge 
          variant={!searchParams.get('specialite') ? "default" : "outline"}
          className={`rounded-xl px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 ease-out font-medium ${!searchParams.get('specialite') ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent' : 'bg-white hover:bg-muted text-foreground'}`}
          onClick={() => toggleSpecialite('')}
        >
          Tous
        </Badge>
        {SPECIALITES.map((spec) => {
          const isSelected = searchParams.get('specialite') === spec
          return (
            <Badge 
              key={spec}
              variant={isSelected ? "default" : "outline"}
              className={`rounded-xl px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 ease-out font-medium ${isSelected ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent' : 'bg-white hover:bg-muted text-foreground'}`}
              onClick={() => toggleSpecialite(spec)}
            >
              {spec}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
