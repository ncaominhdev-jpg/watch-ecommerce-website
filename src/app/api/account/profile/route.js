import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('jwt-datt')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      include: {
        addresses: true,
        orders: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin user:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-datt')?.value;

    if (!token) return NextResponse.json({ message: 'Không xác thực' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    const update = await prisma.users.update({
      where: { id: decoded.id },
      data: {
        name: body.fullName,
        phone: body.phone,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, user: update });
  } catch (err) {
    console.error('Lỗi cập nhật thông tin:', err);
    return NextResponse.json({ message: 'Cập nhật thất bại' }, { status: 500 });
  }
}

