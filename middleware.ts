import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth(); // ⚡ PENTING: panggil auth() dulu
    if (!userId) {
      return NextResponse.redirect('/sign-in');
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/',
  ],
};
