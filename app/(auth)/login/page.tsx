'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/Logo'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('client@couturecam.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Initialize Supabase only on client-side action to avoid build-time SSR errors
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Le middleware s'occupera de la redirection selon le rôle si on redirige vers une route "neutre"
      // ou on peut rediriger vers /login à nouveau pour laisser le middleware router.
      // Pour forcer l'évaluation du middleware avec la session à jour :
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen flex bg-[#1A243F] font-sans">
      {/* Colonne Image (Cachée sur mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1120] overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: 'url("/bg_tailor.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent"></div>
        {/* Motif décoratif Africain subtil (wax pattern) overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D5B980\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}></div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div>
            <Logo light={false} />
          </div>
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              L'excellence sur-mesure, <br />
              <span className="text-[#D5B980]">en toute confiance.</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Connectez-vous pour suivre vos commandes, valider chaque étape et sécuriser vos transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Colonne Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Ligne dorée supérieure (mobile only) */}
        <div className="lg:hidden h-1 w-full absolute top-0 left-0 bg-[#D5B980]"></div>
        
        {/* Form Container */}
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <Logo light={false} />
          </div>

          <Card className="p-8 sm:p-10 rounded-[2rem] shadow-2xl border-white/10 bg-[#0B1120]/80 backdrop-blur-xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-white mb-2">Bienvenue</h1>
              <p className="text-[#D5B980] text-sm font-medium uppercase tracking-widest">
                Portail CoutureCam
              </p>
              <div className="mt-6 inline-block bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60">
                Identifiants de test pré-remplis
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Adresse Email</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D5B980] focus:ring-[#D5B980] transition-colors px-4 placeholder:text-white/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Mot de passe</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D5B980] focus:ring-[#D5B980] transition-colors px-4 placeholder:text-white/20"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 text-red-400 text-sm rounded-xl border border-red-900/30 text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-[#D5B980] hover:bg-[#D5B980]/90 text-[#1A243F] text-lg font-bold shadow-lg hover:shadow-[0_0_20px_rgba(213,185,128,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="mt-8 text-center flex justify-center space-x-4 text-xs text-white/40">
              <button onClick={() => { setEmail('client@couturecam.com'); setPassword('password123'); }} className="hover:text-white transition-colors">Test Client</button>
              <span>•</span>
              <button onClick={() => { setEmail('couturier_237690000001@test.com'); setPassword('password123'); }} className="hover:text-white transition-colors">Test Couturier</button>
              <span>•</span>
              <button onClick={() => { setEmail('admin@couturecam.com'); setPassword('password123'); }} className="hover:text-white transition-colors">Test Admin</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
