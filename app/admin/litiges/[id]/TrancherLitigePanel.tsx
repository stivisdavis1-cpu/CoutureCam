'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TrancherLitigePanel({ litigeId }: { litigeId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [decision, setDecision] = useState<string | null>(null)

  const handleDecision = async (choix: string) => {
    setStatus('loading')
    setDecision(choix)

    // Simulation Edge Function trancher-litige
    // Cette fonction gère : la MAJ de paiements.statut, le virement MoMo, la clôture du litige, et l'audit.
    setTimeout(() => {
      setStatus('success')
    }, 2000)
  }

  if (status === 'success') {
    return (
      <Card className="border-emerald/30 shadow-sm rounded-3xl bg-emerald/5 overflow-hidden sticky top-8">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald mx-auto mb-3" />
          <h3 className="font-bold text-emerald mb-2">Décision appliquée</h3>
          <p className="text-sm text-emerald/80 mb-4">Le litige est clos. Les fonds ont été transférés et l'action a été consignée dans le journal d'audit.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-sm rounded-3xl bg-white overflow-hidden sticky top-8">
      <CardHeader className="bg-red/5 pb-4 border-b border-red/10">
        <CardTitle className="text-lg text-red flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Trancher le litige
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Vous êtes sur le point de rendre une décision définitive sur le séquestre de 22 500 FCFA.
        </p>

        <Button 
          variant="outline" 
          className="w-full justify-start h-auto p-4 rounded-xl text-left border-border/50 hover:bg-muted/30 transition-all hover:scale-[1.02]"
          onClick={() => handleDecision('rembourser_client')}
          disabled={status === 'loading'}
        >
          <div>
            <div className="font-bold text-primary mb-1">Rembourser le client</div>
            <div className="text-xs text-muted-foreground whitespace-normal">Le couturier est en tort (retard, non conformité). Les fonds retournent au client.</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start h-auto p-4 rounded-xl text-left border-border/50 hover:bg-muted/30 transition-all hover:scale-[1.02]"
          onClick={() => handleDecision('payer_couturier')}
          disabled={status === 'loading'}
        >
          <div>
            <div className="font-bold text-emerald mb-1">Payer le couturier</div>
            <div className="text-xs text-muted-foreground whitespace-normal">Le travail est conforme aux preuves horodatées. Les fonds sont libérés au couturier.</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start h-auto p-4 rounded-xl text-left border-border/50 hover:bg-muted/30 transition-all hover:scale-[1.02]"
          onClick={() => handleDecision('partage')}
          disabled={status === 'loading'}
        >
          <div>
            <div className="font-bold text-gold mb-1">Partage 50/50 (Accord)</div>
            <div className="text-xs text-muted-foreground whitespace-normal">Les deux parties ont convenu d'un arrangement à l'amiable dans la messagerie.</div>
          </div>
        </Button>

        {status === 'loading' && (
          <p className="text-sm text-center text-muted-foreground mt-4 animate-pulse">
            Exécution de la transaction...
          </p>
        )}
      </CardContent>
    </Card>
  )
}
