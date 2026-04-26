import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.users.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu người dùng" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, phone, role } = await request.json();

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        status: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: "Email đã tồn tại trong hệ thống" },
        { status: 409 }
      );
    }

    console.error("Lỗi khi tạo người dùng:", error);
    return NextResponse.json(
      { error: "Không thể tạo người dùng" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name, email, phone, role, status } = await request.json();

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, role, status },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return NextResponse.json({ error: "Không thể cập nhật người dùng" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    await prisma.users.delete({ where: { id } });

    return NextResponse.json({ message: "Người dùng đã được xóa" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng" }, { status: 500 });
  }
}
