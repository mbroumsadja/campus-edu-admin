// src/middleware.ts
// Guard de routes — redirige vers /auth/login si pas de token
// S'exécute côté serveur AVANT le rendu de la page (Edge Runtime)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques (pas besoin d'être connecté)
const PUBLIC_ROUTES  = ['/auth/login', '/auth/register']

// Routes réservées à l'admin uniquement
const ADMIN_ROUTES   = ['/admin']

// Routes réservées aux enseignants et admins
const TEACHER_ROUTES = ['/cours/nouveau', '/sujets/nouveau']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken  = request.cookies.get('accessToken')?.value
  const isPublic     = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  // 1. Route publique → laisser passer
  if (isPublic) {
    // Si déjà connecté et on veut aller sur /auth/login → dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 2. Pas de token → login
  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Décoder le JWT (sans vérification de signature — edge runtime)
  //    La vraie vérification de signature se fait côté API
  try {
    const payload    = JSON.parse(atob(accessToken.split('.')[1]))
    const role: string = payload.role ?? 'etudiant'

    // Routes admin : seuls les admins peuvent accéder
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Routes enseignant : enseignants et admins
    if (TEACHER_ROUTES.some(r => pathname.startsWith(r)) && !['enseignant', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

  } catch {
    // Token malformé → logout
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }

  return NextResponse.next()
}

// Appliquer le middleware sur toutes les routes sauf assets statiques
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
