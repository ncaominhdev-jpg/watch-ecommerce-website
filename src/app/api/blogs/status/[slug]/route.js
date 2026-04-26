import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ====================== [   CHI TIẾT BÀI VIẾT   ] ======================
export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const blog = await prisma.blogs.findFirst({
      where: { slug },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error("Lỗi server:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy chi tiết bài viết" },
      { status: 500 }
    );
  }
}
