import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const productCount = await prisma.products.count({
      where: { status: true },
    });

    const categoryCount = await prisma.categories.count({
      where: { status: true },
    });

    const brandCount = await prisma.brands.count({
      where: { status: true },
    });

    const orderCount = await prisma.orders.count();

    return NextResponse.json({
      products: productCount,
      categories: categoryCount,
      brands: brandCount,
      orders: orderCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "Không thể lấy số lượng" }, { status: 500 });
  }
}
