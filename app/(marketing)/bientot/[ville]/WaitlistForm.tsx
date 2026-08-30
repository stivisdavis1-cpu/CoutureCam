'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

export default function WaitlistForm({ ville, compteInscrits }: { ville: string, compteInscrits: number }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setMessage('')

    try {
      // Simulation du Captcha
      const token_captcha = 'simulated_token_for_demo'

      const { data, error } = await supabase.functions.invoke('inscription-liste-attente', {
        body: { email, ville, token_captcha }
      })

      if (error) {
        throw new Error(error.message)
      }
      
      if (data?.error) {
        throw new Error(data.error)
      }

      setStatus('success')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Une erreur est survenue.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-[#E7986B]/20 border border-[#E7986B]/50 rounded-full py-4 px-6 max-w-lg mx-auto text-center mt-8 animate-in fade-in">
        <p className="text-[#F6E1B6] font-semibold text-lg">
          Merci ! Vous êtes dans la liste.
        </p>
        <p className="text-white/70 text-sm mt-1">
          Vous êtes parmi les {compteInscrits + 1} premiers. Surveillez votre boîte mail.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="email"
          placeholder="votre.email@exemple.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="w-full h-14 pl-6 pr-32 rounded-full border-0 focus:ring-4 focus:ring-[#D5B980]/30 outline-none text-gray-900 bg-white"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="absolute right-1 top-1 bottom-1 px-8 rounded-full bg-[#C76C3E] hover:bg-[#B35F33] text-white font-bold transition-all disabled:opacity-50"
        >
          {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Je m'inscris"}
        </button>
      </form>
      
      {status === 'error' && (
        <p className="text-red-400 text-sm text-center mt-3">{message}</p>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <p className="text-white/60 text-sm">
          Déjà {compteInscrits} inscrits • aucun spam, un seul e-mail au lancement
        </p>
      </div>
      
      {/* Decorative avatars mock */}
      <div className="flex items-center justify-center mt-3 gap-2">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#D5B980] border-2 border-[#1E2540]"></div>
          <div className="w-6 h-6 rounded-full bg-[#C76C3E] border-2 border-[#1E2540]"></div>
          <div className="w-6 h-6 rounded-full bg-[#A7E2CB] border-2 border-[#1E2540]"></div>
          <div className="w-6 h-6 rounded-full bg-[#D1CFFD] border-2 border-[#1E2540]"></div>
        </div>
        <span className="text-white/50 text-xs font-semibold">+{compteInscrits > 4 ? compteInscrits - 4 : 236} autres</span>
      </div>
    </div>
  )
}
