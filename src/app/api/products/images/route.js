import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const images = await prisma.product_images.findMany({
            orderBy: { id: 'desc' }, // có thể bỏ nếu không cần sắp xếp
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error("Lỗi khi lấy tất cả ảnh sản phẩm:", error);
        return NextResponse.json({ error: 'Không thể lấy ảnh sản phẩm' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { product_id, image_url } = await req.json();

        if (!product_id || !image_url) {
            return NextResponse.json({ error: 'Thiếu dữ liệu bắt buộc' }, { status: 400 });
        }

        const newImage = await prisma.product_images.create({
            data: {
                product_id: Number(product_id),
                image_url,
            },
        });

        return NextResponse.json(newImage, { status: 201 });
    } catch (error) {
        console.error("Lỗi khi thêm ảnh sản phẩm:", error);
        return NextResponse.json({ error: 'Không thể thêm ảnh sản phẩm' }, { status: 500 });
    }
}
