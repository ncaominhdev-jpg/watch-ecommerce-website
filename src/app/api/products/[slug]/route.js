import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').pop();

  try {
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        product_images: true,
        product_variants: true,
        category: true,
        brand: true,
        reviews: {
          where: { status: true }, // ✅ Chỉ lấy review được duyệt
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            review_images: {
              select: {
                image_url: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
