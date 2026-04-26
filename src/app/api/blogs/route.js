import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ====================== [ GET danh sách blog ] ======================
export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = blogs.map((blog) => ({
      ...blog,
      // user_name: blog.user?.name || 'Admin',
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi lấy tin tức:', error);
    return NextResponse.json({ error: 'Không thể lấy tin tức' }, { status: 500 });
  }
}

// ====================== [ POST - thêm blog mới ] ======================
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      short_description,
      content,
      image_url,
      status,
      user_id,
      keyword,
    } = body;

    const newBlog = await prisma.blogs.create({
      data: {
        title,
        slug,
        short_description,
        content,
        image_url,
        status,
        user_id,
        keyword,
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi thêm tin tức:", error);
    return NextResponse.json({ error: "Không thể thêm tin tức" }, { status: 500 });
  }
}


