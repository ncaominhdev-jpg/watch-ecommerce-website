import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(str) {
  return str
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// GET: Lấy tất cả sản phẩm với lọc theo query (category, brand, price)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const price = searchParams.get('price');

    const filters = {};

    if (category) filters.category = { slug: category };
    if (brand) filters.brand = { slug: brand };

    const priceFilter = {};
    if (price) {
      const [min, max] = price.split('-').map(Number);
      if (!isNaN(min)) priceFilter.gte = min;
      if (!isNaN(max)) priceFilter.lte = max;
    }
    if (Object.keys(priceFilter).length > 0) {
      filters.price = priceFilter;
    }

    const products = await prisma.products.findMany({
      where: filters,
      include: {
        product_images: true,
        product_variants: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Lỗi GET /products:", error);
    return NextResponse.json({ error: "Không thể lấy danh sách sản phẩm" }, { status: 500 });
  }
}

// POST: Tạo mới sản phẩm
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      short_description,
      description,
      price,
      status,
      category_id,
      brand_id,
      images = [],
      variants = [],
    } = body;

    if (!name || !price || !category_id || !brand_id) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const existing = await prisma.products.findFirst({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        name,
        slug,
        price: Number(price),
        short_description,
        description,
        status: Boolean(status),
        category_id: Number(category_id),
        brand_id: Number(brand_id),
        product_images: {
          create: images.map((url) => ({ image_url: url })),
        },
        product_variants: {
          create: variants.map((v) => ({
            name_color: v.name_color,
            code_color: v.code_color,
            quantity: Number(v.quantity),
            price: Number(v.price),
            discount: v.discount ? Number(v.discount) : null,
          })),
        },
      },
      include: {
        product_images: true,
        product_variants: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST /products:", error);
    return NextResponse.json({ error: "Không thể tạo sản phẩm" }, { status: 500 });
  }
}

// PUT: Cập nhật sản phẩm
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      short_description,
      description,
      price,
      status,
      category_id,
      brand_id,
      // Bỏ images, variants ra khỏi PUT nếu không chỉnh sửa
    } = body;

    if (!id || !name || !price || !category_id || !brand_id) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check slug trùng
    const existing = await prisma.products.findFirst({
      where: {
        slug,
        id: { not: Number(id) },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!" },
        { status: 400 }
      );
    }

    // Update sản phẩm mà không xoá biến thể hay images
    const updatedProduct = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        price: Number(price),
        short_description,
        description,
        status: Boolean(status),
        category_id: Number(category_id),
        brand_id: Number(brand_id),
      },
      include: {
        product_images: true,
        product_variants: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Lỗi PUT /products:", error);
    return NextResponse.json({ error: "Không thể cập nhật sản phẩm" }, { status: 500 });
  }
}

// PATCH: Cập nhật trạng thái sản phẩm
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof status !== "boolean") {
      return NextResponse.json({ error: "Thiếu thông tin id hoặc status" }, { status: 400 });
    }

    const updated = await prisma.products.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    console.error("Lỗi PATCH /products:", error);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái" }, { status: 500 });
  }
}

// DELETE: Xóa cứng sản phẩm
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    await prisma.products.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Đã xoá sản phẩm vĩnh viễn" });
  } catch (error) {
    console.error("Lỗi DELETE /products:", error);
    return NextResponse.json({ error: "Không thể xoá sản phẩm" }, { status: 500 });
  }
}
