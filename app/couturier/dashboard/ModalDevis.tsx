'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { envoyerDevis } from './actions'
import { Loader2, X } from 'lucide-react'

export default function ModalDevis({ commandeId, titre }: { commandeId: string, titre: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const montant = Number(formData.get('montant'))
    const delai = Number(formData.get('delai'))
    const message = formData.get('message') as string

    const res = await envoyerDevis(commandeId, montant, delai, message)
    
    if (res.success) {
      setIsOpen(false)
    } else {
      setError(res.error || 'Une erreur est survenue lors de l\'envoi.')
    }
    setLoading(false)
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex-1 h-11 bg-black text-white text-sm font-semibold rounded-xl hover:bg-black/90 transition-all"
      >
        Envoyer un devis
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">Envoyer un devis</h2>
            <p className="text-sm text-gray-500 mb-6 truncate">Pour : {titre}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant proposé (FCFA)</label>
                <input 
                  type="number" 
                  name="montant" 
                  required 
                  min="1000"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D5B980] focus:border-transparent transition-all"
                  placeholder="Ex: 25000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Délai estimé (jours)</label>
                <input 
                  type="number" 
                  name="delai" 
                  required 
                  min="1"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D5B980] focus:border-transparent transition-all"
                  placeholder="Ex: 7"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message au client</label>
                <textarea 
                  name="message" 
                  required 
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D5B980] focus:border-transparent transition-all resize-none"
                  placeholder="Précisez votre offre, les tissus éventuels..."
                ></textarea>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-black hover:bg-black/90 text-white text-sm font-bold rounded-xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Envoyer la proposition"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
