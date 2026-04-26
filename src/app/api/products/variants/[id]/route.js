import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseId(id) {
  const parsed = Number(id);
  if (!parsed || isNaN(parsed)) return null;
  return parsed;
}

// PUT: Cập nhật toàn bộ biến thể
export async function PUT(req, { params }) {
  try {
    const variantId = parseId(params.id);
    if (!variantId) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await req.json();
    const { name_color, code_color, price, discount, quantity, status } = body;

    if (!name_color || !code_color || !price) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const updatedVariant = await prisma.product_variants.update({
      where: { id: variantId },
      data: {
        name_color,
        code_color,
        price: Number(price),
        discount: discount ? Number(discount) : 0,
        quantity: quantity ? Number(quantity) : undefined,
        status: status !== undefined ? Boolean(status) : undefined,
      },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error("Lỗi PUT /products/variants/[id]:", error);
    return NextResponse.json({ error: "Không thể cập nhật biến thể" }, { status: 500 });
  }
}

// PATCH: Cập nhật một phần biến thể
export async function PATCH(req, { params }) {
  try {
    const variantId = parseId(params.id);
    if (!variantId) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await req.json();
    const dataToUpdate = {};

    if (body.status !== undefined) dataToUpdate.status = Boolean(body.status);
    if (body.price !== undefined) dataToUpdate.price = Number(body.price);
    if (body.discount !== undefined) dataToUpdate.discount = Number(body.discount);
    if (body.quantity !== undefined) dataToUpdate.quantity = Number(body.quantity);
    if (body.name_color !== undefined) dataToUpdate.name_color = body.name_color;
    if (body.code_color !== undefined) dataToUpdate.code_color = body.code_color;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu để cập nhật" }, { status: 400 });
    }

    const updated = await prisma.product_variants.update({
      where: { id: variantId },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Lỗi PATCH /products/variants/[id]:", error);
    return NextResponse.json({ error: "Không thể cập nhật biến thể" }, { status: 500 });
  }
}

// DELETE: Xoá biến thể
export async function DELETE(req, { params }) {
  try {
    const variantId = parseId(params.id);
    if (!variantId) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    await prisma.product_variants.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ message: "Đã xoá biến thể" });
  } catch (error) {
    console.error("Lỗi DELETE /products/variants/[id]:", error);
    return NextResponse.json({ error: "Không thể xoá biến thể" }, { status: 500 });
  }
}
