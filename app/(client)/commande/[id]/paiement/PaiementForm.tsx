'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Provider = 'mtn_momo' | 'orange_money' | null
type PaymentStatus = 'idle' | 'loading' | 'waiting_confirmation' | 'success' | 'error'

export default function PaiementForm({ commandeId, montant, montantAffiche }: { commandeId: string, montant: number, montantAffiche: string }) {
  const [provider, setProvider] = useState<Provider>(null)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [txRef, setTxRef] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handlePayment = async () => {
    if (!provider) return

    setStatus('loading')
    setErrorMessage('')

    try {
      // Appel de l'Edge Function Supabase
      const { data, error } = await supabase.functions.invoke('initier-paiement-momo', {
        body: { commande_id: commandeId, montant, provider }
      })

      if (error) throw new Error(error.message || 'Erreur lors de l\'initiation du paiement')
      if (!data?.success) throw new Error(data?.error || 'Erreur inconnue')

      setTxRef(data.reference_transaction)
      setStatus('waiting_confirmation')

    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Impossible de contacter le service de paiement.')
      setStatus('error')
    }
  }

  // Écoute Realtime pour la confirmation du paiement
  useEffect(() => {
    if (status !== 'waiting_confirmation' || !txRef) return

    const channel = supabase
      .channel(`paiement_${txRef}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'paiements',
          filter: `reference_transaction=eq.${txRef}`
        },
        (payload) => {
          if (payload.new.statut === 'sequestre') {
            setStatus('success')
            // Redirection vers le suivi de commande après 2 secondes
            setTimeout(() => {
              router.push(`/commande/${commandeId}`)
            }, 2000)
          } else if (payload.new.statut === 'echoue' || payload.new.statut === 'rembourse') {
            setErrorMessage('Le paiement a été refusé ou a échoué.')
            setStatus('error')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [status, txRef, commandeId, supabase, router])

  if (status === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-emerald/20 animate-in fade-in zoom-in">
        <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-4" />
        <h3 className="text-xl font-bold text-navy mb-2">Paiement confirmé !</h3>
        <p className="text-muted-foreground text-sm">Votre acompte a été sécurisé. Le couturier va commencer la production.</p>
        <p className="text-xs mt-4 text-emerald font-medium">Redirection automatique...</p>
      </div>
    )
  }

  if (status === 'waiting_confirmation') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-border/50 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-navy mb-2">En attente de confirmation</h3>
        <p className="text-muted-foreground text-sm">
          Veuillez valider le paiement sur votre téléphone. Ne fermez pas cette page.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-red/20 animate-in fade-in">
        <AlertCircle className="w-12 h-12 text-red mx-auto mb-4" />
        <h3 className="text-lg font-bold text-navy mb-2">Paiement échoué</h3>
        <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>
        <Button 
          onClick={() => setStatus('idle')} 
          variant="outline"
          className="rounded-full w-full h-12 border-2"
        >
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <p className="text-sm font-semibold text-navy mb-3">Payer avec</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setProvider('mtn_momo')}
          className={`h-14 rounded-xl border-2 font-bold transition-all ${
            provider === 'mtn_momo' 
              ? 'border-blue-500 bg-blue-50 text-blue-800' 
              : 'border-border bg-white text-muted-foreground hover:border-blue-200 hover:bg-blue-50/50'
          }`}
        >
          MTN MoMo
        </button>
        <button
          onClick={() => setProvider('orange_money')}
          className={`h-14 rounded-xl border-2 font-bold transition-all ${
            provider === 'orange_money' 
              ? 'border-orange-500 bg-orange-50 text-orange-800' 
              : 'border-border bg-white text-muted-foreground hover:border-orange-200 hover:bg-orange-50/50'
          }`}
        >
          Orange Money
        </button>
      </div>

      <Button 
        onClick={handlePayment}
        disabled={!provider || status === 'loading'}
        className="w-full h-14 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          `Payer l'acompte — ${montantAffiche}`
        )}
      </Button>
    </div>
  )
}
