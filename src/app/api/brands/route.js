import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hàm tạo slug từ tên
function slugify(str) {
  return str
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Hàm tạo slug unique
async function generateUniqueSlug(name, excludeId = null) {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  let exists = await prisma.brands.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  while (exists) {
    slug = `${baseSlug}-${count++}`;
    exists = await prisma.brands.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  return slug;
}

// GET: Lấy tất cả thương hiệu
export async function GET() {
  try {
    const brands = await prisma.brands.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thương hiệu:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu thương hiệu" }, { status: 500 });
  }
}

// POST: Tạo mới thương hiệu
export async function POST(request) {
  try {
    const { name, description, logo_url } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập tên thương hiệu" }, { status: 400 });
    }

    // Check tên trùng
    const existingName = await prisma.brands.findFirst({
      where: { name }
    });
    if (existingName) {
      return NextResponse.json({ error: "Tên thương hiệu đã tồn tại." }, { status: 400 });
    }

    const slug = await generateUniqueSlug(name);

    const newBrand = await prisma.brands.create({
      data: {
        name,
        slug,
        description: description || null,
        logo_url: logo_url || null,
        status: true,
      },
    });

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo thương hiệu:", error);
    return NextResponse.json({ error: "Không thể tạo thương hiệu" }, { status: 500 });
  }
}

// PUT: Cập nhật thương hiệu
export async function PUT(request) {
  try {
    const { id, name, description, logo_url, status = true } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: "Thiếu dữ liệu cập nhật" }, { status: 400 });
    }

    const brandId = parseInt(id);

    // Check tên trùng với thương hiệu khác
    const existingName = await prisma.brands.findFirst({
      where: {
        name,
        id: { not: brandId }
      }
    });
    if (existingName) {
      return NextResponse.json({ error: "Tên thương hiệu đã tồn tại." }, { status: 400 });
    }

    const slug = await generateUniqueSlug(name, brandId);

    const updatedBrand = await prisma.brands.update({
      where: { id: brandId },
      data: {
        name,
        slug,
        description: description || null,
        logo_url: logo_url || null,
        status,
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Lỗi khi cập nhật thương hiệu:", error);
    return NextResponse.json({ error: "Không thể cập nhật thương hiệu" }, { status: 500 });
  }
}

// DELETE: Xoá thương hiệu
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) return NextResponse.json({ error: "Thiếu ID thương hiệu" }, { status: 400 });

    await prisma.brands.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Xoá thương hiệu thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá thương hiệu:", error);
    return NextResponse.json({ error: "Không thể xoá thương hiệu" }, { status: 500 });
  }
}
