import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request:NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // Allow access to login and signup API routes
  if (
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const loggedInUserNotAccessPath = pathname === '/auth/login' || pathname === '/auth/register';

  // Redirect logged-in users trying to access login or signup pages
  if (loggedInUserNotAccessPath) {    
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // Redirect users trying to access protected pages without logging in
    if (!token) {
      if (pathname.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ message: 'Access Denied', success: false }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));//redirect to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    '/',
    '/auth/login',
    '/auth/register',
    '/expenses',
    '/expenses/new',
    '/budgets',
    '/reports',
    '/api/:path*'

  ],
};

