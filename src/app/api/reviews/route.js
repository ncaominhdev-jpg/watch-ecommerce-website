import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // true/false
    const rating = searchParams.get('rating'); // 1-5

    const filters = {};
    if (status !== null) filters.status = status === 'true';
    if (rating) filters.rating = Number(rating);

    try {
        const [total, reviews] = await Promise.all([
            prisma.reviews.count({ where: filters }),
            prisma.reviews.findMany({
                where: filters,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { name: true } },
                    product: { select: { name: true } },
                    review_images: { select: { image_url: true } },
                },
            }),
        ]);

        return NextResponse.json({ total, page, limit, reviews });
    } catch (error) {
        console.error('Lỗi lấy danh sách reviews:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
