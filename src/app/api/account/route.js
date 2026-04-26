// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const { name, email, password, phone, image } = body;

  if (!name || !email || !password || !phone) {
    return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
  }

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: 'Email đã được sử dụng' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        image: image || null,
        role: 'customers',
      },
    });

    return NextResponse.json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);

    // Prisma: Lỗi vi phạm unique constraint (P2002)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: 'Email đã tồn tại trong hệ thống' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Lỗi máy chủ, thử lại sau.' }, { status: 500 });
  }
}
