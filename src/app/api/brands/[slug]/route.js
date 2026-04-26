export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').pop();

  if (!slug) {
    return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
  }

  try {
    const brand = await prisma.brands.findUnique({
      where: { slug },
    });

    if (!brand) {
      return NextResponse.json({ error: "Không tìm thấy thương hiệu" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Lỗi khi tìm thương hiệu:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
