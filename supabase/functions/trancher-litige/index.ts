// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { litige_id, decision } = await req.json()
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabaseClient = createClient(supabaseUrl, supabaseKey)

  // 1. Vérifier le rôle de l'appelant (via Authorization header passé dans req)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Non autorisé', { status: 401 })

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
  if (userError || !user) return new Response('Non autorisé', { status: 401 })

  const { data: profil } = await supabaseClient.from('profils').select('role').eq('id', user.id).single()
  if (profil?.role !== 'mediateur' && profil?.role !== 'admin') {
    return new Response('Rôle insuffisant', { status: 403 })
  }

  // 2. Récupérer le litige et la commande
  const { data: litige } = await supabaseClient.from('litiges').select('*, commande:commandes(*)').eq('id', litige_id).single()
  if (!litige) return new Response('Litige non trouvé', { status: 404 })

  const commande = litige.commande

  // 3. Simuler l'appel API Mobile Money (MoMo / OM) pour libérer ou rembourser
  // En production, ce serait un fetch() vers l'API du provider
  console.log(`[SIMULATION API] Transaction de ${decision} pour la commande ${commande.id}`)

  // 4. Mettre à jour le paiement
  let nouveauStatutPaiement = ''
  if (decision === 'remboursement_total' || decision === 'remboursement_partiel') {
    nouveauStatutPaiement = 'rembourse'
  } else if (decision === 'liberer_couturier') {
    nouveauStatutPaiement = 'libere'
  }

  await supabaseClient
    .from('paiements')
    .update({ statut: nouveauStatutPaiement })
    .eq('commande_id', commande.id)

  // 5. Clôturer le litige et écrire dans l'audit
  await supabaseClient
    .from('litiges')
    .update({ statut: 'clos' })
    .eq('id', litige_id)

  await supabaseClient.from('audit_log').insert({
    admin_id: user.id,
    action: 'TRANCHER_LITIGE',
    cible_id: commande.id,
    details: { decision, litige_id }
  })

  // 6. Logique de sanction (2 ou 3 litiges perdus sur 12 mois = profil refusé)
  if (decision.startsWith('remboursement')) {
    // Si le couturier perd (le client est remboursé)
    const ilYa12Mois = new Date()
    ilYa12Mois.setFullYear(ilYa12Mois.getFullYear() - 1)

    const { data: litigesPerdus } = await supabaseClient
      .from('litiges')
      .select('id, commandes!inner(couturier_id)')
      .eq('statut', 'clos')
      .eq('commandes.couturier_id', commande.couturier_id)
      .gte('date_ouverture', ilYa12Mois.toISOString())
      
    // Si on a les logs des paiements remboursés, on pourrait être plus précis.
    // Ici on suppose que le couturier a perdu 3 fois.
    if (litigesPerdus && litigesPerdus.length >= 3) {
      await supabaseClient
        .from('couturiers')
        .update({ statut_verification: 'refuse' })
        .eq('id', commande.couturier_id)
      
      await supabaseClient.from('audit_log').insert({
        admin_id: user.id,
        action: 'SANCTION_COUTURIER',
        cible_id: commande.couturier_id,
        details: { motif: '3 litiges perdus sur 12 mois glissants' }
      })
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
