import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const review = await prisma.reviews.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
        review_images: true,
      },
    });

    if (!review) {
      return Response.json({ error: 'Không tìm thấy đánh giá' }, { status: 404 });
    }

    return Response.json(review);
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { status } = body;

    const updated = await prisma.reviews.update({
      where: { id: Number(id) },
      data: { status: Boolean(status) },
    });

    return Response.json({ message: 'Cập nhật trạng thái thành công', review: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
    return Response.json({ error: 'Không thể cập nhật trạng thái' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    // Xoá ảnh trước nếu có
    await prisma.review_images.deleteMany({ where: { review_id: Number(id) } });

    await prisma.reviews.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: 'Xoá đánh giá thành công' });
  } catch (error) {
    console.error("Lỗi khi xoá đánh giá:", error);
    return Response.json({ error: 'Không thể xoá đánh giá' }, { status: 500 });
  }
}
