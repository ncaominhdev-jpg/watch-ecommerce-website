import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công' });

  response.cookies.set('jwt-datt', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
} 
