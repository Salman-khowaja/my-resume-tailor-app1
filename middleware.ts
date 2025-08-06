// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access to all routes
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Supabase not configured, allowing access to all routes')
    return NextResponse.next()
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Check for various possible cookie names
  const accessToken = req.cookies.get('sb-access-token')?.value ||
                     req.cookies.get('supabase-auth-token')?.value ||
                     req.cookies.get('sb-' + supabaseUrl.replace(/[^a-zA-Z0-9]/g, '') + '-auth-token')?.value

  console.log('Middleware check:', {
    pathname: req.nextUrl.pathname,
    hasAccessToken: !!accessToken,
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey)
  })

  // If no access token and trying to access protected route, redirect to login
  if (!accessToken && req.nextUrl.pathname === '/') {
    console.log('No access token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If has access token and trying to access login, redirect to home
  if (accessToken && req.nextUrl.pathname === '/login') {
    console.log('Access token found, redirecting to home')
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/', '/login']
}
