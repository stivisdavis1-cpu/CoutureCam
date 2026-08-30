import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            options.maxAge = 300 // Timeout de 5 minutes
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            options.maxAge = 300 // Timeout de 5 minutes
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Rafraîchissement de la session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- Règles de protection (Middleware) ---
  
  // 1. Pages publiques (Auth / Marketing)
  const isPublicRoute = pathname.startsWith('/inscription') || 
                        pathname.startsWith('/verification') || 
                        pathname.startsWith('/login') || 
                        pathname === '/' || 
                        pathname.startsWith('/bientot')
                        
  if (!user && !isPublicRoute) {
    // Non authentifié -> Redirection vers la connexion
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // On récupère le rôle de façon fiable depuis la table profils
    const { data: profil } = await supabase.from('profils').select('role').eq('id', user.id).single()
    const role = profil?.role || user.user_metadata?.role || 'client'

    // Si l'utilisateur est connecté et essaie d'aller sur /inscription ou /login, le rediriger selon son rôle
    if (pathname.startsWith('/inscription') || pathname.startsWith('/verification') || pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      
      if (role === 'couturier') {
        url.pathname = '/couturier/dashboard'
      } else if (role === 'admin' || role === 'super_admin') {
        url.pathname = '/admin/parametres' // ou le bon chemin d'accueil admin
      } else {
        // Rôle 'client' ou par défaut
        url.pathname = '/accueil'
      }
      
      return NextResponse.redirect(url)
    }

    // Protection des routes Admin
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin' && role !== 'super_admin' && role !== 'finance' && role !== 'support' && role !== 'mediateur') {
        // L'utilisateur n'est pas autorisé pour l'admin
        const url = request.nextUrl.clone()
        url.pathname = '/accueil'
        return NextResponse.redirect(url)
      }
    }
    
    // Protection des routes Couturier
    if (pathname.startsWith('/couturier')) {
      if (role !== 'couturier' && role !== 'admin' && role !== 'super_admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/accueil'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
