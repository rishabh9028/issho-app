import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Comprehensive CSP to allow Supabase, Google Fonts, and Realtime WebSockets
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.google.com https://*.googleapis.com; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://photon.komoot.io; " +
    "img-src 'self' data: https: blob:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://*.supabase.co; " +
    "worker-src 'self' blob:;"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - images, icons, robots.txt, sitemap.xml
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|txt|xml)$).*)',
  ],
}
