import { NextResponse } from 'next/server';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT decode loi:', err);
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get('jwt-datt')?.value;
  const user = token ? parseJwt(token) : null;

  const path = request.nextUrl.pathname;

  // Bảo vệ /admin
  if (path.startsWith('/admin')) {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Bảo vệ /thong-tin-ca-nhan
  if (path.startsWith('/thong-tin-ca-nhan')) {
    if (!user) {
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/thong-tin-ca-nhan/:path*'],
};
