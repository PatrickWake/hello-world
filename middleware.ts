import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionStore } from './lib/auth/sessions';

const publicPaths = ['/auth/signin', '/auth/signup', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const sessionId = request.cookies.get('sessionId')?.value;

  // Allow public paths
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  if (!token || !sessionId) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  try {
    const session = await sessionStore.getSession(sessionId);
    if (!session || session.token !== token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 