import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      where: { status: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = blogs.map((blog) => ({
      ...blog,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt?.toISOString?.(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi lấy tin tức:', error.message, error.stack);
    return NextResponse.json({ error: 'Không thể lấy tin tức' }, { status: 500 });
  }
}
