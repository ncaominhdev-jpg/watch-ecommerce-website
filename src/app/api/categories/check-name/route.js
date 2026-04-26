import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get("name");
        const excludeId = searchParams.get("excludeId");

        if (!name) {
            return NextResponse.json(
                { exists: false, error: "Thiếu tên để kiểm tra." },
                { status: 400 }
            );
        }

        // Nếu có excludeId → loại bỏ chính record đó
        const where = excludeId
            ? {
                name,
                NOT: { id: parseInt(excludeId) },
            }
            : { name };

        const existing = await prisma.categories.findFirst({ where });

        return NextResponse.json({ exists: !!existing });
    } catch (error) {
        console.error("Lỗi khi check name category:", error);
        return NextResponse.json(
            { error: "Không thể kiểm tra tên danh mục" },
            { status: 500 }
        );
    }
}
