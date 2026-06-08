import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ru', 'en', 'hy'];
const defaultLocale = 'ru';

// UUID pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getLocale(request: NextRequest): string {
  // 1. Cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;

  // 2. Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().slice(0, 2))
      .find((lang) => locales.includes(lang));
    if (preferred) return preferred;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем статику, api, _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/models') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/locales') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Проверяем: есть ли уже локаль в URL
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;

    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
    return response;
  }

  // Catalog UUID routing (сохраняем старую логику)
  const pathSegments = pathname.split('/').filter(Boolean);
  // pathSegments[0] = locale, pathSegments[1] = 'catalog'
  if (pathSegments[1] === 'catalog') {
    if (pathSegments.length > 4) {
      return NextResponse.next();
    }

    const catalogMatch = pathname.match(/^\/[a-z]{2}\/catalog\/([^/]+)\/([^/]+)$/);
    if (catalogMatch) {
      const [, , slug] = catalogMatch;
      try {
        const decodedSlug = decodeURIComponent(slug);
        if (!UUID_REGEX.test(decodedSlug)) {
          return NextResponse.next();
        }
      } catch (e) {
        console.error('Error decoding slug in middleware:', e);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
