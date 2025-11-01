import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 🧱 Tentukan route yang butuh login
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // halaman dashboard
  '/projects(.*)',  // halaman project (kalau ada)
  '/api(.*)',       // kalau kamu mau lindungi API
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect(); // 🚪 paksa login kalau belum auth
});

export const config = {
  matcher: [
    // Lindungi semua route kecuali _next, static file, dll.
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/', // halaman utama
  ],
};
