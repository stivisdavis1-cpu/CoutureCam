// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { reference_transaction, status } = await req.json()

  if (status !== 'SUCCESS') {
    return new Response(JSON.stringify({ message: 'Paiement non abouti' }), { status: 200 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Mettre à jour le statut du paiement à 'sequestre'
  const { data: paiement, error: paiementError } = await supabaseClient
    .from('paiements')
    .update({ statut: 'sequestre' })
    .eq('reference_transaction', reference_transaction)
    .select()
    .single()

  if (paiementError) {
    return new Response(JSON.stringify({ error: paiementError.message }), { status: 400 })
  }

  // 2. Mettre à jour le statut de la commande à 'confirmee'
  const { error: commandeError } = await supabaseClient
    .from('commandes')
    .update({ 
      statut: 'confirmee', 
      montant_acompte: paiement.montant 
    })
    .eq('id', paiement.commande_id)

  if (commandeError) {
    return new Response(JSON.stringify({ error: commandeError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
