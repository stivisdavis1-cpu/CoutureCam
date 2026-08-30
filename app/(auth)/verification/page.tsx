'use client'

import { useState, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerificationForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const role = searchParams.get('role') || 'client'

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres.')
      return
    }

    setLoading(true)
    setError('')
    
    // Initialize Supabase only on client-side action to avoid build-time SSR errors
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms',
      })

      if (error) {
        throw error
      }

      // TODO: Insérer l'utilisateur dans la table `profils` avec son rôle s'il n'existe pas déjà
      // Pour l'instant, on redirige vers l'accueil ou le dashboard
      if (role === 'couturier') {
        router.push('/couturier/dashboard')
      } else {
        router.push('/accueil')
      }
      
    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-navy">Vérification SMS</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Un code à 6 chiffres a été envoyé au <br />
          <span className="font-bold text-foreground">{phone}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red/10 text-red text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Input 
          type="text" 
          placeholder="000000" 
          maxLength={6}
          className="h-14 rounded-xl text-center text-3xl font-mono tracking-widest px-4"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>

      <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-md">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier & Continuer'}
      </Button>
      
      <div className="text-center">
        <Link href="/inscription">
          <Button type="button" variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
            Modifier le numéro
          </Button>
        </Link>
      </div>
    </form>
  )
}

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-navy/5 rounded-full blur-3xl pointer-events-none"></div>

      <Card className="w-full max-w-md border-0 shadow-xl rounded-[2rem] bg-white relative z-10 overflow-hidden">
        <div className="bg-navy p-6 text-white relative">
          <Link href="/inscription" className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-2 backdrop-blur-sm">
              <Scissors className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-lg font-bold">CoutureCam</h1>
          </div>
        </div>

        <CardContent className="p-8">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <VerificationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
