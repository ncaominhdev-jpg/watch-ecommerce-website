import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs'; 

export async function GET() {
  try {
    const cookieStore = await cookies();  
    const accessToken = cookieStore.get('jwt-datt')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    return NextResponse.json({ user: decoded }, { status: 200 });
  } catch (error) {
    console.error('Lỗi khi giải mã JWT:', error.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}