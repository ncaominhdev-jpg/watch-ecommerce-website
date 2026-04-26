import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const contacts = await prisma.contacts.findMany(
      {
        include: {
          user: true,
        },
        orderBy: {
          id: 'desc'
        }
      }
    );
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách liên hệ:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, title, message } = body;

    if (!name || !email || !title || !message) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin." }, { status: 400 });
    }

    const created = await prisma.contacts.create({
      data: {
        name,
        email,
        title,
        message,
        status: false,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Lỗi tạo liên hệ:", error);
    return NextResponse.json({ error: "Lỗi server!" }, { status: 500 });
  }
}
