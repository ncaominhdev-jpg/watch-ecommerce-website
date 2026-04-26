import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get("product_id");
    const name_color = searchParams.get("name_color");

    if (!product_id || !name_color) {
        return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
    }

    const exists = await prisma.product_variants.findFirst({
        where: {
            product_id: Number(product_id),
            name_color: name_color.trim(),
        },
    });

    return NextResponse.json({ exists: Boolean(exists) });
}
// POST: Tạo mới biến thể
export async function POST(req) {
    try {
        const {
            product_id,
            name_color,
            code_color,
            quantity,
            price,
            discount,
            status = true,
        } = await req.json();

        if (!product_id || !name_color || !code_color || !quantity || !price) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
        }

        const newVariant = await prisma.product_variants.create({
            data: {
                product_id: Number(product_id),
                name_color,
                code_color,
                quantity: Number(quantity),
                price: Number(price),
                discount: discount ? Number(discount) : 0,
                status: Boolean(status),
            },
        });

        return NextResponse.json(newVariant, { status: 201 });
    } catch (error) {
        console.error("Lỗi POST /products/variants:", error);
        return NextResponse.json({ error: "Không thể tạo biến thể" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { id, status } = await req.json();

        if (!id || typeof status !== "boolean") {
            return NextResponse.json({ error: "Thiếu id hoặc status" }, { status: 400 });
        }

        const updated = await prisma.product_variants.update({
            where: { id: Number(id) },
            data: { status },
        });

        return NextResponse.json({ id: updated.id, status: updated.status });
    } catch (error) {
        console.error("Lỗi PATCH /products/variants:", error);
        return NextResponse.json({ error: "Không thể cập nhật trạng thái" }, { status: 500 });
    }
}

