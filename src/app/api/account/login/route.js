export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ;
const prisma = new PrismaClient();

if (!JWT_SECRET) {
  console.error('JWT_SECRET chưa được cấu hình trong .env');
  return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
}


export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Vui lòng nhập email và mật khẩu' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: 'Email không tồn tại' },
        { status: 401 }
      );
    }

    if (user.status === false) {
      return NextResponse.json(
        { message: 'Tài khoản của bạn đã bị vô hiệu hoá' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Mật khẩu không đúng' },
        { status: 401 }
      );
    }

     const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '2d' }
    );

    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

     response.cookies.set('jwt-datt', token, {
      httpOnly: false,  
      path: '/',
      maxAge: 60 * 60 * 24 * 2, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}
