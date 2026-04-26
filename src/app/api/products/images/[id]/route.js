import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(request) {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split("/").pop());
    try {
        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID ảnh' }, { status: 400 });
        }

        await prisma.product_images.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Đã xoá ảnh' });
    } catch (error) {
        console.error("Lỗi xoá ảnh:", error);
        return NextResponse.json({ error: 'Không thể xoá ảnh' }, { status: 500 });
    }
}
