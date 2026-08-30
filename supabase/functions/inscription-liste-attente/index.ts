// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simulation d'un cache en mémoire pour le Rate Limit basique (pas idéal pour le multi-instance, mais fonctionnel pour un MVP)
const rateLimitCache = new Map<string, { count: number, resetAt: number }>()

serve(async (req) => {
  // CORS Headers for public endpoint
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  // 1. Rate Limit (Max 5 req / heure par IP)
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const limitRecord = rateLimitCache.get(clientIp)
  
  if (limitRecord && limitRecord.resetAt > now) {
    if (limitRecord.count >= 5) {
      return new Response(JSON.stringify({ error: 'Trop de requêtes. Réessayez plus tard.' }), { status: 429, headers: corsHeaders })
    }
    limitRecord.count += 1
  } else {
    rateLimitCache.set(clientIp, { count: 1, resetAt: now + 3600000 }) // 1h
  }

  try {
    const { email, ville, token_captcha } = await req.json()

    // 2. Validation Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Format d\'email invalide.' }), { status: 400, headers: corsHeaders })
    }

    if (!ville) {
      return new Response(JSON.stringify({ error: 'Ville requise.' }), { status: 400, headers: corsHeaders })
    }

    // 3. Validation Captcha (Mockée pour le plan)
    if (!token_captcha || token_captcha.length < 10) {
      // En production, appel à l'API verify de Turnstile/hCaptcha
      // return new Response(JSON.stringify({ error: 'Validation anti-bot échouée.' }), { status: 400, headers: corsHeaders })
    }

    // 4. Insertion dans la base
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const { error: insertError } = await supabaseAdmin
      .from('liste_attente')
      .insert({ email: email.toLowerCase(), ville: ville.toLowerCase() })

    // Gérer silencieusement les doublons (Contrainte UNIQUE)
    if (insertError && !insertError.message.includes('unique constraint')) {
      throw insertError
    }

    // 5. Envoi d'email transactionnel (Simulé)
    console.log(`[EMAIL SEND] Envoi d'un email de bienvenue à ${email} pour la ville ${ville}`)
    // await fetch('https://api.resend.com/emails', { ... })

    return new Response(JSON.stringify({ success: true, message: 'Inscription validée.' }), { status: 200, headers: corsHeaders })

  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Erreur interne.' }), { status: 500, headers: corsHeaders })
  }
})
