import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const jwtSecret = process.env.JWT_SECRET;

export async function middleware(req) {
  const token = cookies().get('saturday');
  let user;
  let newUser;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token?.value,
        new TextEncoder().encode(jwtSecret)
      );
      if (payload?.hasToken) {
        user = true;
        newUser = payload?.newUser;
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (
    (!user && req.nextUrl.pathname === '/login') ||
    (!user && req.nextUrl.pathname === '/signup')
  ) {
    return NextResponse.next();
  }

  if (!user && req.nextUrl.pathname !== '/') {
    req.nextUrl.pathname = '/';
    return NextResponse.redirect(req.nextUrl);
  }

  if (user && newUser && req.nextUrl.pathname === '/settings') {
    return NextResponse.next();
  }

  if (user && newUser && req.nextUrl.pathname !== '/account') {
    req.nextUrl.pathname = '/settings';
    return NextResponse.redirect(req.nextUrl);
  }

  if (
    (user && req.nextUrl.pathname === '/login') ||
    (user && req.nextUrl.pathname === '/signup') ||
    (user && req.nextUrl.pathname === '/')
  ) {
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
    '/settings',
    '/account',
    '/contact',
    '/details/:path*',
    '/',
  ],
};
