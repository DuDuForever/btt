
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware function is intentionally left empty.
// The authentication and route protection logic is now handled in `src/components/app-content.tsx`.
// This file is kept to satisfy the Next.js middleware configuration but does not perform any actions.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
