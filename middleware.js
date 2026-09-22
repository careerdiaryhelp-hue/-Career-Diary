export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  
  // Exclude static routes
  const staticRoutes = ['/admin', '/top-online-forms', '/top-offline-forms', '/state-jobs', '/admit-cards', '/results', '/'];
  
  if (!staticRoutes.includes(url.pathname)) {
    const path = url.pathname.substring(1);
    
    // Rewrite to our SSR function
    // We can't use next/server NextResponse here since it's a Vite app
    // We can just proxy the request to the SSR endpoint using fetch
    const ssrUrl = new URL(`/api/ssr?path=${path}`, request.url);
    
    try {
      const response = await fetch(ssrUrl.toString(), {
        headers: request.headers
      });
      return response;
    } catch (e) {
      console.error('Middleware fetch error:', e);
    }
  }
  
  // If it's a static route or fetch failed, let the request pass through to Vite's index.html
}
