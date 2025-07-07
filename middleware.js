import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and trying to access protected routes, redirect to auth
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    // If user is signed in and trying to access auth page, redirect to dashboard
    if (session && req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    // If there's an error with auth, allow the request to continue
    console.error('Middleware auth error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - interview (public interview pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|interview).*)',
  ],
}