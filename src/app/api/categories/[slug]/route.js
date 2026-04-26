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

  const category = await prisma.categories.findUnique({
    where: { slug },
  });

  if (!category) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  return NextResponse.json(category);
}
