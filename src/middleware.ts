import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// UUID pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for routes with more than 2 segments after /catalog
  // These are handled by Next.js directly (e.g., /catalog/category/subcategory/slug)
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 3 && pathSegments[0] === 'catalog') {
    return NextResponse.next();
  }

  // Only handle 2-segment routes: /catalog/[category]/[slug]
  const catalogMatch = pathname.match(/^\/catalog\/([^/]+)\/([^/]+)$/);
    
  if (catalogMatch) {
    const [, category, slug] = catalogMatch;
    
    try {
      const decodedSlug = decodeURIComponent(slug);
      
      // If the slug is not a UUID, it's a subcategory
      // Don't interfere - let Next.js handle it through [subcategory] route
      // The middleware matcher will still catch this, but we just pass it through
      if (!UUID_REGEX.test(decodedSlug)) {
        // It's a subcategory name - let Next.js handle it
        // Next.js will try routes in order, and [subcategory] should work
        return NextResponse.next();
      }
      // If it's a UUID, it's an old product URL - let it through to [category]/[slug] route
    } catch (e) {
      console.error('Error decoding slug in middleware:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Don't match routes - let Next.js handle all routing naturally
  // The middleware will still run for all routes, but we only process UUID slugs
  matcher: [
    '/catalog/:path*'
  ],
};
