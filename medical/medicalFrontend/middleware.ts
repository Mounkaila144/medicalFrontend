import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/patients',
  '/appointments',
  '/practitioners',
  '/encounters',
  '/billing',
  '/reports',
  '/admin',
];

const practitionerRoutes = [
  '/practitioner',
];

const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get tokens from cookies or headers
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if user is trying to access protected routes without token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if practitioner is trying to access practitioner routes without token
  if (practitionerRoutes.some(route => pathname.startsWith(route)) && !accessToken) {
    const loginUrl = new URL('/auth/practitioner/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token but tries to access auth pages, redirect to dashboard
  if (accessToken && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 