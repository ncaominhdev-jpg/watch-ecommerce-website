import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tạo slug từ tên
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

async function generateUniqueSlug(name, excludeId = null) {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  let exists = await prisma.categories.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } })
    }
  });

  while (exists) {
    slug = `${baseSlug}-${count++}`;
    exists = await prisma.categories.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
  }

  return slug;
}

// GET: Lấy tất cả danh mục
export async function GET() {
  try {
    const categories = await prisma.categories.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu danh mục" }, { status: 500 });
  }
}

// POST: Tạo mới danh mục
export async function POST(request) {
  try {
    const { name, image } = await request.json();

    if (!name || !image) {
      return NextResponse.json({ error: "Vui lòng nhập tên và ảnh" }, { status: 400 });
    }

    const existingName = await prisma.categories.findFirst({
      where: { name }
    });
    if (existingName) {
      return NextResponse.json({ error: "Tên danh mục đã tồn tại." }, { status: 400 });
    }

    const slug = await generateUniqueSlug(name);

    const newCategory = await prisma.categories.create({
      data: {
        name,
        image,
        slug,
        status: true,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    return NextResponse.json({ error: "Không thể tạo danh mục" }, { status: 500 });
  }
}

// PUT: Cập nhật danh mục
export async function PUT(request) {
  try {
    const { id, name, image, status = true } = await request.json();

    // 1️⃣ Kiểm tra dữ liệu đầu vào
    const categoryId = Number(id);
    if (!categoryId || isNaN(categoryId)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Vui lòng nhập tên danh mục" }, { status: 400 });
    }

    // 2️⃣ Kiểm tra trùng tên (ngoại trừ chính nó)
    const existingName = await prisma.categories.findFirst({
      where: {
        name,
        NOT: { id: categoryId },
      },
    });

    if (existingName) {
      console.log("Trùng với ID:", existingName.id); // debug
      return NextResponse.json({ error: "Tên danh mục đã tồn tại." }, { status: 400 });
    }

    // 3️⃣ Lấy ảnh cũ nếu FE không gửi ảnh mới
    let currentCategory = await prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!currentCategory) {
      return NextResponse.json({ error: "Không tìm thấy danh mục." }, { status: 404 });
    }

    const slug = await generateUniqueSlug(name, categoryId);

    // 4️⃣ Update danh mục
    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name,
        image: image && image.trim() !== "" ? image : currentCategory.image,
        slug,
        status,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    return NextResponse.json({ error: "Không thể cập nhật danh mục" }, { status: 500 });
  }
}

// DELETE: Xoá danh mục
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Thiếu ID danh mục" }, { status: 400 });

    await prisma.categories.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Xoá danh mục thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá danh mục:", error);
    return NextResponse.json({ error: "Không thể xoá danh mục" }, { status: 500 });
  }
}
