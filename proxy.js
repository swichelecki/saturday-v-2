import { NextResponse } from 'next/server';
import { getUserFromCookie } from './utilities/getUserFromCookie';

export async function proxy(req) {
  const { user, admin } = await getUserFromCookie();

  if (
    (!user && req.nextUrl.pathname === '/login') ||
    (!user && req.nextUrl.pathname === '/signup') ||
    (!user && req.nextUrl.pathname === '/reset') ||
    (!user && req.nextUrl.pathname === '/')
  ) {
    return NextResponse.next();
  }

  if (!user && req.nextUrl.pathname !== '/') {
    req.nextUrl.pathname = '/';
    return NextResponse.redirect(req.nextUrl);
  }

  if (
    (user && req.nextUrl.pathname === '/login') ||
    (user && req.nextUrl.pathname === '/signup') ||
    (user && req.nextUrl.pathname === '/reset') ||
    (user && req.nextUrl.pathname === '/')
  ) {
    req.nextUrl.pathname = '/dashboard';
    return NextResponse.redirect(req.nextUrl);
  }

  if (user && !admin && req.nextUrl.pathname === '/admin') {
    req.nextUrl.pathname = '/dashboard';
    return NextResponse.redirect(req.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/login',
    '/signup',
    '/reset',
    '/settings',
    '/account',
    '/contact',
    '/notes',
    '/admin',
    '/details/:path*',
    '/',
  ],
};
