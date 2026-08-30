import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Rediriger vers la page de login après déconnexion
  return NextResponse.redirect(new URL('/login', request.url))
}
