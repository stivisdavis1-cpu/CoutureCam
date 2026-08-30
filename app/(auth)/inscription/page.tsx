'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function InscriptionPage() {
  const [role, setRole] = useState<'client' | 'couturier' | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Assainissement du numéro (ajoute +237 par défaut pour Douala si pas de préfixe)
    let formattedPhone = phone.trim()
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+237' + formattedPhone
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        throw error
      }

      // On passe le numéro et le rôle choisi dans l'URL pour la vérification
      router.push(`/verification?phone=${encodeURIComponent(formattedPhone)}&role=${role}`)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du SMS.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-navy/5 rounded-full blur-3xl pointer-events-none"></div>

      <Card className="w-full max-w-md border-0 shadow-xl rounded-[2rem] bg-white relative z-10 overflow-hidden">
        <div className="bg-navy p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm">
            <Scissors className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold">CoutureCam</h1>
          <p className="text-white/70 mt-2 text-sm">Votre artisan de confiance, en un clic.</p>
        </div>

        <CardContent className="p-8">
          {!role ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-center text-navy mb-6">Je souhaite...</h2>
              
              <Button 
                onClick={() => setRole('client')}
                variant="outline" 
                className="w-full h-16 rounded-2xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 flex items-center justify-start px-6 gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">🛍️</div>
                <div className="text-left">
                  <div className="font-bold text-foreground">Commander une tenue</div>
                  <div className="text-xs text-muted-foreground">Créer un compte Client</div>
                </div>
              </Button>

              <Button 
                onClick={() => setRole('couturier')}
                variant="outline" 
                className="w-full h-16 rounded-2xl border-2 border-border/50 hover:border-gold hover:bg-gold/5 flex items-center justify-start px-6 gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">✂️</div>
                <div className="text-left">
                  <div className="font-bold text-foreground">Proposer mes services</div>
                  <div className="text-xs text-muted-foreground">Ouvrir un atelier Couturier</div>
                </div>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary mb-2" onClick={() => setRole(null)}>
                  ← Changer de rôle
                </Button>
                <h2 className="text-xl font-bold text-navy">
                  Inscription {role === 'client' ? 'Client' : 'Couturier'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Saisissez votre numéro WhatsApp pour recevoir votre code d'accès.</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red/10 text-red text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Numéro de téléphone</label>
                <Input 
                  type="tel" 
                  placeholder="Ex: 6 90 00 00 00" 
                  className="h-12 rounded-xl text-lg px-4"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading || !phone} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-md">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Recevoir le code SMS'}
              </Button>

              <p className="text-xs text-center text-muted-foreground px-4">
                En continuant, vous acceptez nos <a href="#" className="underline">Conditions générales d'utilisation</a>.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
