import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { slug } = params;
  console.log("==> Slug API nhận:", slug);
  try {
    const blog = await prisma.blogs.findFirst({
      where: { slug: slug },
    });

    if (!blog) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error("Lỗi server:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ====================== [ PUT - cập nhật blog ] ======================

export async function PUT(req, context) {
  try {
    const { slug } = context.params;
    const body = await req.json();

    const {
      title,
      short_description,
      content,
      image_url,
      status,
      keyword,
    } = body;

    const cookieStore = cookies();
    const accessToken = cookieStore.get('jwt-datt')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const requesterId = decoded.id;
    const requesterRole = decoded.role;

    const existingBlog = await prisma.blogs.findFirst({ where: { slug } });

    if (!existingBlog) {
      return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    }

    const onlyStatusUpdate =
      title === undefined &&
      short_description === undefined &&
      content === undefined &&
      image_url === undefined &&
      keyword === undefined;

     if (onlyStatusUpdate) {
      const updatedBlog = await prisma.blogs.update({
        where: { id: existingBlog.id },
        data: { status },
      });

      return NextResponse.json(updatedBlog, { status: 200 });
    }

     if (existingBlog.user_id !== requesterId && requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa bài viết này" }, { status: 403 });
    }

    const updatedBlog = await prisma.blogs.update({
      where: { id: existingBlog.id },
      data: {
        title,
        short_description,
        content,
        image_url,
        status,
        user_id: existingBlog.user_id, 
        keyword,
      },
    });

    return NextResponse.json(updatedBlog, { status: 200 });

  } catch (error) {
    console.error("Lỗi khi cập nhật tin tức:", error);
    return NextResponse.json({ error: "Không thể cập nhật tin tức" }, { status: 500 });
  }
}

// ====================== [ DELETE - xóa blog theo slug ] ======================
export async function DELETE(req, { params }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('jwt-datt')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;
    const { slug } = params;

    const existingBlog = await prisma.blogs.findFirst({ where: { slug } });

    if (!existingBlog) {
      return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    }

    if (existingBlog.user_id !== userId && userRole !== 'super_admin') {
      return NextResponse.json({ error: "Bạn không có quyền xóa bài viết này" }, { status: 403 });
    }

    await prisma.blogs.delete({ where: { id: existingBlog.id } });

    return NextResponse.json({ message: "Xóa bài viết thành công" }, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return NextResponse.json({ error: "Không thể xóa bài viết" }, { status: 500 });
  }
}

