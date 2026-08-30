// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { commande_id, montant, provider } = await req.json()

  // Initialiser Supabase avec le service role key pour contourner RLS si besoin
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Simuler l'appel à l'API MTN MoMo ou Orange Money
  // Dans un cas réel, on utiliserait fetch() vers l'API du provider
  const reference_transaction = `TXN-${Math.floor(Math.random() * 1000000)}`

  // 2. Créer la ligne dans la table paiements
  const { data, error } = await supabaseClient
    .from('paiements')
    .insert({
      commande_id,
      montant,
      type: 'acompte',
      statut: 'en_attente',
      provider,
      reference_transaction
    })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  // Simuler le délai de paiement du client (Push USSD)
  // En production, le webhook sera appelé par le provider. Ici, pour la démo, 
  // on appelle notre propre webhook après 10 secondes si l'environnement est local.
  // Note: Ne pas faire ça en production vraie.
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Demande de paiement envoyée', 
      reference_transaction 
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
